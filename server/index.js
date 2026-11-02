// Awaaz API + site. Run from the project root:  npm start   (http://127.0.0.1:8000)
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import multer from 'multer';
import * as agent from './agent.js';
import * as speech from './speech.js';
import {
  EMERGENCY_NUMBERS, EMERGENCY_TERMS, HttpError, ROOT, UPLOADS, all, checkPassword, dec, enc, findPii, get, hashPassword,
  isEmergency, log, makeToken, maskPii, normaliseIdentifier, rateLimit, requireUser, run,
} from './core.js';

const SITE = path.join(ROOT, 'site');
const FOLLOW_UP_DAYS = 30;
const monitorHours = () => parseFloat(process.env.MONITOR_INTERVAL_HOURS ?? '24');
const smsWebhook = () => process.env.SMS_WEBHOOK_URL || '';  // your SMS provider bridge; without it OTPs print to the server console (dev only)
const ALLOWED_UPLOADS = { 'application/pdf': '.pdf', 'image/jpeg': '.jpg', 'image/png': '.png' };
const MAGIC = { '.pdf': '%PDF', '.jpg': '\xff\xd8', '.png': '\x89PNG' };
const MAX_UPLOAD = 8 * 1024 * 1024;
const MAX_WAV = 2 * 1024 * 1024; // 60 s of 16 kHz 16-bit mono is about 1.9 MB
const STATUSES = ['draft', 'submitted_by_me', 'awaiting_reply', 'resolved'];

export const app = express();
app.disable('x-powered-by');
if (process.env.TRUST_PROXY) app.set('trust proxy', /^\d+$/.test(process.env.TRUST_PROXY) ? Number(process.env.TRUST_PROXY) : process.env.TRUST_PROXY);

const CSP = "default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; "
  + "font-src https://fonts.gstatic.com; img-src 'self' data:; media-src 'self' blob:; connect-src 'self'; object-src 'none'; "
  + "frame-ancestors 'none'; base-uri 'self'; form-action 'self'";

app.use((_req, res, next) => {
  res.set({
    'Content-Security-Policy': CSP,
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'Permissions-Policy': 'microphone=(self), camera=(), geolocation=()',
  });
  next();
});
app.use(express.json({ limit: '100kb' }));

// ---------- validation helpers ----------
const bad = m => new HttpError(422, m);
/** A string field with optional min/max length. */
function str(b, k, { max = 1e9, min = 0, def = '' } = {}) {
  const v = b?.[k] ?? def;
  if (typeof v !== 'string' || v.length > max || v.length < min) throw bad(`Invalid ${k}.`);
  return v;
}
const bool = (b, k) => { const v = b?.[k] ?? false; if (typeof v !== 'boolean') throw bad(`Invalid ${k}.`); return v; };
const ip = req => req.ip || '?';
const idParam = req => { const n = Number(req.params.id); if (!Number.isInteger(n)) throw bad('Invalid id.'); return n; };

// ---------- helpers ----------
const userPayload = uid => get('SELECT id,email,phone,name,consent_at FROM users WHERE id=?', uid);
const authResponse = uid => ({ token: makeToken(uid), user: userPayload(uid) });

function draftOut(r) {
  const d = { ...r, body: dec(r.body), follow_up_due: '' };
  if (d.filed_on && /^\d{4}-\d{2}-\d{2}$/.test(d.filed_on)) {
    const t = new Date(d.filed_on + 'T00:00:00Z');
    if (!isNaN(t)) { t.setUTCDate(t.getUTCDate() + FOLLOW_UP_DAYS); d.follow_up_due = t.toISOString().slice(0, 10); }
  }
  return d;
}

const addEvent = (draftId, uid, kind, text) => run('INSERT INTO events (draft_id,user_id,at,kind,text) VALUES (?,?,?,?,?)', draftId, uid, Date.now() / 1000, kind, text);

function ownDraft(id, uid) {
  const r = get('SELECT * FROM drafts WHERE id=? AND user_id=?', id, uid);
  if (!r) throw new HttpError(404, 'Draft not found.');
  return r;
}

function requireAgent() {
  if (!agent.agentConfigured()) throw new HttpError(503, 'The AI agent is not configured on this server yet (set GEMINI_API_KEY).');
}

function requireSpeech() {
  if (!speech.speechConfigured()) throw new HttpError(503, 'Voice is not configured on this server yet (set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION).');
}

// ---------- public ----------
app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.get('/api/status', (_req, res) => res.json({
  agent_configured: agent.agentConfigured(), search_configured: agent.searchConfigured(),
  ocr_configured: agent.ocrConfigured(), sms_configured: !!smsWebhook(), speech_configured: speech.speechConfigured(),
}));

app.get('/api/emergency', (_req, res) => res.json({ numbers: EMERGENCY_NUMBERS, terms: EMERGENCY_TERMS }));

app.get('/api/routes/search', (req, res) => res.json(agent.lookupKnownRoutes(String(req.query.q ?? '').slice(0, 300))));

// ---------- voice (Azure AI Speech) ----------
app.post('/api/speech/tts', (req, res, next) => {
  requireSpeech();
  rateLimit('tts', ip(req), 200, 3600);
  const text = str(req.body, 'text', { min: 1, max: 5000 }).trim();
  const lang = str(req.body, 'lang', { max: 5 });
  if (!text || !speech.knownLang(lang)) throw bad('Unsupported language.');
  speech.synthesize(text, lang).then(mp3 => {
    res.set({ 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store' }).send(mp3);
  }).catch(e => { log.error('tts failed:', e.message); next(new HttpError(502, 'The voice service had a problem. Please try again.')); });
});

app.post('/api/speech/stt', requireUser, express.raw({ type: 'audio/wav', limit: MAX_WAV }), (req, res, next) => {
  requireSpeech();
  rateLimit('stt', req.uid, 60, 3600);
  const lang = String(req.query.lang ?? '');
  if (!speech.knownLang(lang)) throw bad('Unsupported language.');
  const wav = req.body;
  if (!Buffer.isBuffer(wav) || wav.length < 1000 || wav.subarray(0, 4).toString('latin1') !== 'RIFF') throw new HttpError(400, 'Send a WAV recording.');
  speech.recognize(wav, lang).then(text => res.json({ text })).catch(e => {
    log.error('stt failed:', e.message);
    next(new HttpError(502, 'The voice service had a problem. Please try again.'));
  });
});

// ---------- auth ----------
app.post('/api/auth/register', (req, res) => {
  rateLimit('register', ip(req), 10, 3600);
  const b = req.body ?? {};
  const identifier = str(b, 'identifier'), password = str(b, 'password', { min: 8, max: 128 });
  const name = str(b, 'name', { max: 100 }), consent = bool(b, 'consent');
  if (!consent) throw new HttpError(400, 'Please accept the privacy terms to create an account.');
  const [kind, ident] = normaliseIdentifier(identifier);
  let uid;
  try {
    const now = Date.now() / 1000;
    uid = run(`INSERT INTO users (${kind},pw_hash,name,consent_at,created_at) VALUES (?,?,?,?,?)`, ident, hashPassword(password), name.trim(), now, now).lastInsertRowid;
  } catch { throw new HttpError(409, 'An account with this email or phone already exists. Please log in.'); }
  res.json(authResponse(Number(uid)));
});

app.post('/api/auth/login', (req, res) => {
  rateLimit('login', ip(req), 15, 900);
  const identifier = str(req.body, 'identifier'), password = str(req.body, 'password', { max: 128 });
  const [kind, ident] = normaliseIdentifier(identifier);
  const u = get(`SELECT id,pw_hash FROM users WHERE ${kind}=?`, ident);
  if (!u || !u.pw_hash || !checkPassword(password, u.pw_hash)) throw new HttpError(401, 'Wrong email/phone or password.');
  res.json(authResponse(u.id));
});

const sha256 = s => crypto.createHash('sha256').update(s).digest('hex');

app.post('/api/auth/otp/request', async (req, res) => {
  const [kind, ident] = normaliseIdentifier(str(req.body, 'identifier'));
  if (kind !== 'phone') throw new HttpError(400, 'OTP login needs a mobile number.');
  rateLimit('otp', ident, 5, 3600);
  const now = Date.now() / 1000;
  const code = String(crypto.randomInt(1_000_000)).padStart(6, '0');
  const old = get('SELECT sent_at FROM otps WHERE identifier=?', ident);
  if (old && now - old.sent_at < 60) throw new HttpError(429, 'Please wait a minute before asking for another code.');
  run('INSERT INTO otps (identifier,code_hash,expires,attempts,sent_at) VALUES (?,?,?,0,?) '
    + 'ON CONFLICT(identifier) DO UPDATE SET code_hash=excluded.code_hash,expires=excluded.expires,attempts=0,sent_at=excluded.sent_at',
  ident, sha256(code + ident), now + 600, now);
  if (smsWebhook()) {
    try {
      const r = await fetch(smsWebhook(), { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(10_000),
        body: JSON.stringify({ to: '+91' + ident, message: `Your Awaaz code is ${code}. Valid for 10 minutes.` }) });
      if (!r.ok) throw new Error('SMS bridge returned ' + r.status);
    } catch (e) {
      log.error('SMS delivery failed:', e.message);
      throw new HttpError(502, 'Could not send the SMS. Please try again or use your password.');
    }
    return res.json({ delivery: 'sms' });
  }
  log.warn(`DEV OTP for ${ident}: ${code} (SMS_WEBHOOK_URL not set; nothing was sent)`);
  res.json({ delivery: 'console' });
});

app.post('/api/auth/otp/verify', (req, res) => {
  const b = req.body ?? {};
  const [, ident] = normaliseIdentifier(str(b, 'identifier'));
  const code = str(b, 'code', { max: 10 }), name = str(b, 'name', { max: 100 }), consent = bool(b, 'consent');
  const o = get('SELECT * FROM otps WHERE identifier=?', ident);
  if (!o || o.expires < Date.now() / 1000 || o.attempts >= 5) throw new HttpError(400, 'This code has expired. Please request a new one.');
  run('UPDATE otps SET attempts=attempts+1 WHERE identifier=?', ident);
  const want = Buffer.from(o.code_hash), have = Buffer.from(sha256(code.trim() + ident));
  if (want.length !== have.length || !crypto.timingSafeEqual(want, have)) throw new HttpError(400, 'Wrong code.');
  run('DELETE FROM otps WHERE identifier=?', ident);
  let uid = get('SELECT id FROM users WHERE phone=?', ident)?.id;
  if (!uid) {
    if (!consent) throw new HttpError(400, 'Please accept the privacy terms to create an account.');
    const now = Date.now() / 1000;
    uid = Number(run('INSERT INTO users (phone,name,consent_at,created_at) VALUES (?,?,?,?)', ident, name.trim(), now, now).lastInsertRowid);
  }
  res.json(authResponse(uid));
});

app.get('/api/me', requireUser, (req, res) => res.json(userPayload(req.uid)));

app.get('/api/me/export', requireUser, (req, res) => {
  const p = get('SELECT data FROM profiles WHERE user_id=?', req.uid);
  res.json({
    user: userPayload(req.uid), profile: p ? JSON.parse(dec(p.data) || '{}') : {},
    drafts: all('SELECT * FROM drafts WHERE user_id=?', req.uid).map(draftOut),
    events: all('SELECT * FROM events WHERE user_id=?', req.uid),
    sources: all('SELECT url,label,checked_at FROM sources WHERE user_id=?', req.uid),
  });
});

app.delete('/api/me', requireUser, (req, res) => {
  for (const d of all('SELECT path FROM documents WHERE user_id=?', req.uid)) fs.rmSync(d.path, { force: true });
  run('DELETE FROM events WHERE user_id=?', req.uid);
  run('DELETE FROM feedback WHERE user_id=?', req.uid);
  run('DELETE FROM users WHERE id=?', req.uid);
  log.info(`user ${req.uid} deleted their account`);
  res.json({ ok: true });
});

// ---------- assistant ----------
app.post('/api/agent/chat', requireUser, async (req, res) => {
  rateLimit('chat', req.uid, 30, 3600);
  const b = req.body ?? {};
  const raw = b.messages;
  if (!Array.isArray(raw) || raw.length > 20) throw bad('Invalid messages.');
  const language = str(b, 'language', { max: 30, def: 'English' }), notEmergency = bool(b, 'not_emergency');
  const messages = raw.map(m => {
    if (!m || !['user', 'assistant'].includes(m.role) || typeof m.content !== 'string' || m.content.length > 4000) throw bad('Invalid messages.');
    return { role: m.role, content: m.content };
  });
  if (!messages.length || messages.at(-1).role !== 'user') throw new HttpError(400, 'Send a message first.');
  if (isEmergency(messages.at(-1).content) && !notEmergency) return res.json({ type: 'emergency', numbers: EMERGENCY_NUMBERS });
  requireAgent();
  const removed = findPii(messages.map(m => m.content).join(' '));
  const masked = messages.map(m => ({ role: m.role, content: maskPii(m.content) }));
  const p = get('SELECT data FROM profiles WHERE user_id=?', req.uid);
  const state = p ? JSON.parse(dec(p.data) || '{}').state ?? '' : '';
  let out;
  try { out = await agent.runAgent(masked, language, state); }
  catch (e) { log.error('agent error:', e.message); throw new HttpError(502, 'The AI service had a problem. Please try again in a moment.'); }
  if (removed.length) out.pii_removed = removed;
  res.json(out);
});

// ---------- profile ----------
app.get('/api/profile', requireUser, (req, res) => {
  const p = get('SELECT data FROM profiles WHERE user_id=?', req.uid);
  res.json(p ? JSON.parse(dec(p.data) || '{}') : {});
});

app.put('/api/profile', requireUser, (req, res) => {
  const b = req.body ?? {};
  const profile = {
    name: str(b, 'name', { max: 100 }), phone: str(b, 'phone', { max: 20 }), address: str(b, 'address', { max: 400 }),
    state: str(b, 'state', { max: 60 }), language: str(b, 'language', { max: 30, def: 'English' }),
  };
  run('INSERT INTO profiles (user_id,data,updated_at) VALUES (?,?,?) ON CONFLICT(user_id) DO UPDATE SET data=excluded.data, updated_at=excluded.updated_at',
    req.uid, enc(JSON.stringify(profile)), Date.now() / 1000);
  res.json({ ok: true });
});

// ---------- drafts, tracking, escalation ----------
app.get('/api/drafts', requireUser, (req, res) => res.json(all('SELECT * FROM drafts WHERE user_id=? ORDER BY created_at DESC', req.uid).map(draftOut)));

app.post('/api/drafts', requireUser, (req, res) => {
  const b = req.body ?? {};
  const d = {
    title: str(b, 'title', { max: 200, def: undefined }), department: str(b, 'department', { max: 300 }), portal_url: str(b, 'portal_url', { max: 500 }),
    language: str(b, 'language', { max: 30, def: 'English' }), body: str(b, 'body', { max: 10000, def: undefined }), notes: str(b, 'notes', { max: 2000 }),
  };
  const id = Number(run('INSERT INTO drafts (user_id,title,department,portal_url,language,body,notes,created_at) VALUES (?,?,?,?,?,?,?,?)',
    req.uid, d.title, d.department, d.portal_url, d.language, enc(d.body), d.notes, Date.now() / 1000).lastInsertRowid);
  addEvent(id, req.uid, 'created', 'Draft saved. Not submitted.');
  res.json({ id, pii_warning: findPii(d.body) });
});

app.patch('/api/drafts/:id', requireUser, (req, res) => {
  const id = idParam(req), b = req.body ?? {};
  ownDraft(id, req.uid);
  const opt = k => (b[k] == null ? null : str(b, k, { max: k === 'complaint_number' ? 80 : 40 }));
  const status = opt('status'), number = opt('complaint_number'), filedOn = opt('filed_on');
  if (status !== null) {
    if (!STATUSES.includes(status)) throw new HttpError(400, 'Unknown status.');
    run('UPDATE drafts SET status=? WHERE id=?', status, id);
    addEvent(id, req.uid, 'status', `Status set to ${status.replaceAll('_', ' ')} by you.`);
  }
  if (number !== null) {
    run('UPDATE drafts SET complaint_number=? WHERE id=?', number.trim(), id);
    addEvent(id, req.uid, 'number', `Complaint number recorded: ${number.trim()}`);
  }
  if (filedOn !== null) {
    if (filedOn && !(/^\d{4}-\d{2}-\d{2}$/.test(filedOn) && !isNaN(new Date(filedOn + 'T00:00:00Z')))) throw new HttpError(400, 'Date must look like 2026-01-31.');
    run('UPDATE drafts SET filed_on=? WHERE id=?', filedOn, id);
    addEvent(id, req.uid, 'filed', `Filing date recorded: ${filedOn}`);
  }
  res.json(draftOut(ownDraft(id, req.uid)));
});

app.get('/api/drafts/:id/events', requireUser, (req, res) => {
  const id = idParam(req);
  ownDraft(id, req.uid);
  res.json(all('SELECT at,kind,text FROM events WHERE draft_id=? ORDER BY at', id));
});

app.post('/api/drafts/:id/events', requireUser, (req, res) => {
  const id = idParam(req);
  ownDraft(id, req.uid);
  addEvent(id, req.uid, 'note', str(req.body, 'text', { max: 1000, def: undefined }));
  res.json({ ok: true });
});

app.post('/api/drafts/:id/escalate', requireUser, async (req, res) => {
  rateLimit('escalate', req.uid, 10, 3600);
  const id = idParam(req), kind = str(req.body, 'kind', { def: undefined });
  if (!['escalation', 'rti'].includes(kind)) throw bad('Invalid kind.');
  requireAgent();
  const d = draftOut(ownDraft(id, req.uid));
  let text;
  try { text = await agent.draftLetter(kind, d.language, d.department, d.body, d.complaint_number, d.filed_on); }
  catch (e) { log.error('escalation draft failed:', e.message); throw new HttpError(502, 'The AI service had a problem. Please try again.'); }
  res.json({ text, title: (kind === 'rti' ? 'RTI application: ' : 'Escalation: ') + d.title, department: d.department, language: d.language });
});

app.delete('/api/drafts/:id', requireUser, (req, res) => {
  const id = idParam(req);
  ownDraft(id, req.uid);
  run('DELETE FROM drafts WHERE id=?', id);
  res.json({ ok: true });
});

app.get('/api/reminders', requireUser, (req, res) => {
  // Filed complaints whose follow-up date has arrived (or is within 3 days).
  const soon = new Date(Date.now() + 3 * 86400_000).toISOString().slice(0, 10);
  const rows = all("SELECT * FROM drafts WHERE user_id=? AND status IN ('submitted_by_me','awaiting_reply') AND filed_on!=''", req.uid).map(draftOut);
  res.json(rows.filter(d => d.follow_up_due && d.follow_up_due <= soon)
    .map(d => ({ id: d.id, title: d.title, department: d.department, follow_up_due: d.follow_up_due, complaint_number: d.complaint_number })));
});

// ---------- documents + OCR ----------
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_UPLOAD, files: 1 } }).single('file');
const uploadFile = (req, res, next) => upload(req, res, err => {
  if (err?.code === 'LIMIT_FILE_SIZE') return next(new HttpError(413, 'File is too large (max 8 MB).'));
  if (err) return next(new HttpError(400, 'Could not read the upload.'));
  next();
});

app.post('/api/documents', requireUser, uploadFile, async (req, res) => {
  rateLimit('upload', req.uid, 20, 3600);
  const file = req.file;
  const ext = ALLOWED_UPLOADS[file?.mimetype ?? ''];
  if (!ext) throw new HttpError(400, 'Only PDF, JPG or PNG files are allowed.');
  const data = file.buffer;
  if (data.subarray(0, MAGIC[ext].length).toString('latin1') !== MAGIC[ext]) throw new HttpError(400, 'The file content does not match its type.');
  const folder = path.join(UPLOADS, String(req.uid));
  fs.mkdirSync(folder, { recursive: true });
  const filePath = path.join(folder, crypto.randomUUID().replaceAll('-', '') + ext);
  fs.writeFileSync(filePath, data);
  let text = '', note = '';
  if (agent.ocrConfigured()) {
    try { text = await agent.ocrBytes(data, file.mimetype); }
    catch (e) { log.error('OCR failed:', e.message); note = 'Text could not be read from this file.'; }
  } else note = 'Text reading is not available because GEMINI_API_KEY is not set. The file was saved.';
  const name = (file.originalname || 'document').replace(/[^\w.\- ]/g, '_').slice(0, 100);
  const id = Number(run('INSERT INTO documents (user_id,filename,path,content_type,ocr_text,created_at) VALUES (?,?,?,?,?,?)',
    req.uid, name, filePath, file.mimetype, enc(text), Date.now() / 1000).lastInsertRowid);
  res.json({ id, filename: name, text, note, pii_warning: findPii(text) });
});

app.get('/api/documents', requireUser, (req, res) => res.json(all('SELECT id,filename,content_type,created_at FROM documents WHERE user_id=? ORDER BY id DESC', req.uid)));

app.get('/api/documents/:id/file', requireUser, (req, res) => {
  const d = get('SELECT * FROM documents WHERE id=? AND user_id=?', idParam(req), req.uid);
  if (!d || !fs.existsSync(d.path)) throw new HttpError(404, 'File not found.');
  res.attachment(d.filename);
  res.type(d.content_type);
  res.sendFile(d.path);
});

app.delete('/api/documents/:id', requireUser, (req, res) => {
  const id = idParam(req), d = get('SELECT path FROM documents WHERE id=? AND user_id=?', id, req.uid);
  if (d) { fs.rmSync(d.path, { force: true }); run('DELETE FROM documents WHERE id=?', id); }
  res.json({ ok: true });
});

// ---------- watched official pages ----------
const sentences = t => t.split(/(?<=[.!?])\s+|\s{2,}/).map(s => s.trim()).filter(s => s.length > 20);

/** Added/removed sentences between two page texts (set-based; order changes are ignored). */
export function summariseDiff(oldText, newText) {
  const a = sentences(oldText), b = sentences(newText), A = new Set(a), B = new Set(b);
  const out = [
    ...a.filter(s => !B.has(s)).map(s => 'Removed: ' + s.slice(0, 160)),
    ...b.filter(s => !A.has(s)).map(s => 'Added: ' + s.slice(0, 160)),
  ];
  return out.slice(0, 6).join('\n');
}

/** Re-read watched pages; flag ones that changed or can't be reached. uid=null checks everyone's. */
export async function checkSources(uid) {
  const rows = uid ? all('SELECT * FROM sources WHERE user_id=?', uid) : all('SELECT * FROM sources');
  for (const r of rows) {
    const page = await agent.fetchOfficialPage(r.url);
    let flag, h, text, diff;
    if (page.error || (page.status ?? 500) >= 400) {
      [flag, h, text, diff] = [1, r.content_hash, r.last_text, 'Page could not be reached.'];
    } else {
      text = page.text;
      h = crypto.createHash('sha256').update(text).digest('hex');
      const changed = !!r.content_hash && r.content_hash !== h;
      if (changed) { flag = 1; diff = summariseDiff(r.last_text || '', text); log.info('source changed: ' + r.url); }
      else { flag = r.needs_recheck; diff = r.last_diff; } // keep an unacknowledged flag until the user clears it
    }
    run('UPDATE sources SET content_hash=?,last_text=?,last_diff=?,checked_at=?,needs_recheck=? WHERE id=?', h, text, diff, Date.now() / 1000, flag, r.id);
  }
  return rows.length;
}

const sourcesOut = uid => all('SELECT id,url,label,checked_at,needs_recheck,last_diff FROM sources WHERE user_id=? ORDER BY id DESC', uid);

app.get('/api/sources', requireUser, (req, res) => res.json(sourcesOut(req.uid)));

app.post('/api/sources', requireUser, (req, res) => {
  const url = str(req.body, 'url', { max: 500, def: undefined }), label = str(req.body, 'label', { max: 200 });
  if (!agent.isOfficial(url)) throw new HttpError(400, 'Only official government URLs (.gov.in / .nic.in) can be watched.');
  run('INSERT OR IGNORE INTO sources (user_id,url,label) VALUES (?,?,?)', req.uid, url, label || url);
  res.json({ ok: true });
});

app.post('/api/sources/check', requireUser, async (req, res) => {
  rateLimit('check', req.uid, 6, 3600);
  await checkSources(req.uid);
  res.json(sourcesOut(req.uid));
});

app.post('/api/sources/:id/acknowledge', requireUser, (req, res) => {
  run("UPDATE sources SET needs_recheck=0,last_diff='' WHERE id=? AND user_id=?", idParam(req), req.uid);
  res.json({ ok: true });
});

app.delete('/api/sources/:id', requireUser, (req, res) => {
  run('DELETE FROM sources WHERE id=? AND user_id=?', idParam(req), req.uid);
  res.json({ ok: true });
});

// ---------- feedback ----------
app.post('/api/feedback', requireUser, (req, res) => {
  const b = req.body ?? {};
  if (typeof b.helpful !== 'boolean') throw bad('Invalid helpful.');
  run('INSERT INTO feedback (user_id,draft_ref,helpful,comment,created_at) VALUES (?,?,?,?,?)',
    req.uid, str(b, 'draft_ref', { max: 100 }), Number(b.helpful), str(b, 'comment', { max: 1000 }), Date.now() / 1000);
  res.json({ ok: true });
});

// ---------- site + errors ----------
app.use('/api', (_req, _res, next) => next(new HttpError(404, 'Not found.')));
app.use(express.static(SITE));

app.use((err, _req, res, _next) => {
  if (err instanceof HttpError) return res.status(err.status).json({ detail: err.detail });
  if (err?.type === 'entity.parse.failed') return res.status(400).json({ detail: 'Invalid request body.' });
  if (err?.type === 'entity.too.large') return res.status(413).json({ detail: 'Request is too large.' });
  log.error('unhandled error:', err);
  res.status(500).json({ detail: 'Something went wrong on our side. Please try again.' });
});

// ---------- start ----------
export function startMonitor() {
  const hours = monitorHours();
  if (!(hours > 0)) return null;
  return setInterval(async () => {
    try { log.info(`nightly source check done: ${await checkSources(null)} pages`); }
    catch (e) { log.error('source monitor failed:', e); }
  }, hours * 3600_000).unref();
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 8000), host = process.env.HOST || '127.0.0.1';
  app.listen(port, host, () => log.info(`Awaaz running at http://${host}:${port}`));
  startMonitor();
}
