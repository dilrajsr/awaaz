// Shared infrastructure: database, auth (JWT + scrypt), field encryption (Fernet), rate limiting, PII and emergency detection.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import jwt from 'jsonwebtoken';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
try { process.loadEnvFile(path.join(ROOT, '.env')); } catch { /* no .env file: use real environment variables */ }

export const log = {
  info: (...a) => console.log(new Date().toISOString(), 'INFO', ...a),
  warn: (...a) => console.warn(new Date().toISOString(), 'WARNING', ...a),
  error: (...a) => console.error(new Date().toISOString(), 'ERROR', ...a),
};

export class HttpError extends Error {
  constructor(status, detail) { super(detail); this.status = status; this.detail = detail; }
}

const DATA = path.resolve(process.env.AWAAZ_DATA_DIR || path.join(ROOT, 'data'));
export const UPLOADS = path.join(DATA, 'uploads');
fs.mkdirSync(UPLOADS, { recursive: true });

const b64url = buf => buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

function secret(filename, env, make) {
  if (process.env[env]) return process.env[env];
  const p = path.join(DATA, filename);
  if (!fs.existsSync(p)) fs.writeFileSync(p, make());
  return fs.readFileSync(p, 'utf8').trim();
}

const JWT_SECRET = secret('.jwt', 'AWAAZ_JWT_SECRET', () => crypto.randomBytes(48).toString('base64url'));
const FERNET_KEY = Buffer.from(secret('.fernet', 'AWAAZ_FERNET_KEY', () => b64url(crypto.randomBytes(32))), 'base64url');
const SIGN_KEY = FERNET_KEY.subarray(0, 16);
const AES_KEY = FERNET_KEY.subarray(16, 32);
const TOKEN_TTL = 7 * 24 * 3600;

// ---------- database ----------
export const db = new DatabaseSync(path.join(DATA, 'awaaz.db'));
db.exec('PRAGMA foreign_keys=ON; PRAGMA busy_timeout=10000;');
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE, phone TEXT UNIQUE,
    pw_hash TEXT, name TEXT DEFAULT '', consent_at REAL, created_at REAL);
  CREATE TABLE IF NOT EXISTS otps (
    identifier TEXT PRIMARY KEY, code_hash TEXT, expires REAL, attempts INTEGER DEFAULT 0, sent_at REAL);
  CREATE TABLE IF NOT EXISTS profiles (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, data TEXT, updated_at REAL);
  CREATE TABLE IF NOT EXISTS drafts (
    id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title TEXT, department TEXT, portal_url TEXT, language TEXT, body TEXT, notes TEXT,
    status TEXT DEFAULT 'draft', complaint_number TEXT DEFAULT '', filed_on TEXT DEFAULT '', created_at REAL);
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT, draft_id INTEGER REFERENCES drafts(id) ON DELETE CASCADE,
    user_id INTEGER, at REAL, kind TEXT, text TEXT);
  CREATE TABLE IF NOT EXISTS sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    url TEXT, label TEXT, content_hash TEXT, last_text TEXT, last_diff TEXT DEFAULT '',
    checked_at REAL, needs_recheck INTEGER DEFAULT 0, UNIQUE(user_id, url));
  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    filename TEXT, path TEXT, content_type TEXT, ocr_text TEXT, created_at REAL);
  CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, draft_ref TEXT, helpful INTEGER,
    comment TEXT, created_at REAL);
`);

const plain = r => (r ? { ...r } : r);
/** One row as a plain object (or undefined). */
export const get = (sql, ...p) => plain(db.prepare(sql).get(...p));
/** All rows as plain objects. */
export const all = (sql, ...p) => db.prepare(sql).all(...p).map(plain);
/** Run a write; returns { changes, lastInsertRowid }. */
export const run = (sql, ...p) => db.prepare(sql).run(...p);

// ---------- encryption of stored personal text (Fernet: compatible with the earlier Python version's data) ----------
export function enc(s) {
  const iv = crypto.randomBytes(16);
  const c = crypto.createCipheriv('aes-128-cbc', AES_KEY, iv);
  const ct = Buffer.concat([c.update(s || '', 'utf8'), c.final()]);
  const ts = Buffer.alloc(8); ts.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 1000)));
  const head = Buffer.concat([Buffer.from([0x80]), ts, iv, ct]);
  const mac = crypto.createHmac('sha256', SIGN_KEY).update(head).digest();
  return b64url(Buffer.concat([head, mac]));
}

export function dec(s) {
  try {
    if (!s) return '';
    const buf = Buffer.from(s, 'base64url');
    const head = buf.subarray(0, buf.length - 32), mac = buf.subarray(buf.length - 32);
    const want = crypto.createHmac('sha256', SIGN_KEY).update(head).digest();
    if (head[0] !== 0x80 || !crypto.timingSafeEqual(mac, want)) return '';
    const d = crypto.createDecipheriv('aes-128-cbc', AES_KEY, head.subarray(9, 25));
    return Buffer.concat([d.update(head.subarray(25)), d.final()]).toString('utf8');
  } catch { return ''; }
}

// ---------- passwords and tokens ----------
const SCRYPT = { N: 2 ** 14, r: 8, p: 1 };

export function hashPassword(pw) {
  const salt = crypto.randomBytes(16);
  return salt.toString('hex') + '$' + crypto.scryptSync(pw, salt, 64, SCRYPT).toString('hex');
}

export function checkPassword(pw, stored) {
  try {
    const [salt, h] = stored.split('$');
    const calc = crypto.scryptSync(pw, Buffer.from(salt, 'hex'), 64, SCRYPT);
    return crypto.timingSafeEqual(calc, Buffer.from(h, 'hex'));
  } catch { return false; }
}

export const makeToken = uid => jwt.sign({ sub: String(uid) }, JWT_SECRET, { algorithm: 'HS256', expiresIn: TOKEN_TTL });

/** Express middleware: sets req.uid from the Bearer token. */
export function requireUser(req, _res, next) {
  const h = req.get('authorization') || '';
  if (!h.toLowerCase().startsWith('bearer ')) throw new HttpError(401, 'Please log in.');
  let uid;
  try { uid = parseInt(jwt.verify(h.slice(7), JWT_SECRET, { algorithms: ['HS256'] }).sub, 10); }
  catch { throw new HttpError(401, 'Session expired. Please log in again.'); }
  if (!Number.isInteger(uid)) throw new HttpError(401, 'Session expired. Please log in again.');
  if (!get('SELECT 1 AS x FROM users WHERE id=?', uid)) throw new HttpError(401, 'Account not found.');
  req.uid = uid;
  next();
}

export function normaliseIdentifier(raw) {
  raw = (raw || '').trim();
  if (raw.includes('@')) {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(raw)) throw new HttpError(400, 'Enter a valid email address.');
    return ['email', raw.toLowerCase()];
  }
  let digits = raw.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (!/^[6-9]\d{9}$/.test(digits)) throw new HttpError(400, 'Enter a valid 10-digit Indian mobile number or an email.');
  return ['phone', digits];
}

// ---------- rate limiting (in-memory; use Redis if you run several instances) ----------
const hits = new Map();

export function rateLimit(key, who, limit, per) {
  const k = key + '|' + who, now = Date.now() / 1000;
  const q = (hits.get(k) || []).filter(t => t >= now - per);
  if (q.length >= limit) { hits.set(k, q); throw new HttpError(429, 'Too many requests. Please wait a little and try again.'); }
  q.push(now); hits.set(k, q);
}
setInterval(() => { const now = Date.now() / 1000; for (const [k, q] of hits) if (!q.length || q[q.length - 1] < now - 86400) hits.delete(k); }, 3600_000).unref();

// ---------- PII ----------
const PII_PATTERNS = {
  'Aadhaar number': /\b[2-9]\d{3}[\s-]?\d{4}[\s-]?\d{4}\b/,
  'PAN': /\b[A-Z]{5}\d{4}[A-Z]\b/,
  'card number': /\b(?:\d[ -]?){13,16}\b/,
};

export const findPii = text => Object.entries(PII_PATTERNS).filter(([, rx]) => rx.test(text || '')).map(([n]) => n);
export function maskPii(text) {
  for (const [name, rx] of Object.entries(PII_PATTERNS)) text = text.replace(new RegExp(rx.source, 'g'), `[${name} removed]`);
  return text;
}

// ---------- emergencies ----------
export const EMERGENCY_TERMS = [
  'suicide', 'kill myself', 'want to die', 'end my life', 'being beaten', 'domestic violence', 'raped', 'rape',
  'kidnap', 'caught fire', 'on fire', 'fire broke', 'heart attack', 'not breathing', 'bleeding badly',
  'threatening to kill', 'going to kill me', 'has a gun', 'has a knife',
  'आत्महत्या', 'मरना चाहता', 'मरना चाहती', 'जान से मार', 'मार डाल', 'बलात्कार', 'अपहरण', 'आग लगी', 'दिल का दौरा', 'सांस नहीं',
  'ਖੁਦਕੁਸ਼ੀ', 'ਜਾਨੋਂ ਮਾਰ', 'ਮਾਰ ਦੇਣਗੇ', 'ਅੱਗ ਲੱਗ', 'ਬਲਾਤਕਾਰ', 'ਅਗਵਾ',
];
export const EMERGENCY_NUMBERS = [
  { number: '112', label: 'All emergencies (police, fire, ambulance)' },
  { number: '100', label: 'Police' },
  { number: '108', label: 'Ambulance' },
  { number: '101', label: 'Fire' },
  { number: '1091', label: 'Women helpline (also 181)' },
  { number: '1098', label: 'Child helpline' },
  { number: '14416', label: 'Tele-MANAS mental health support' },
];

export const isEmergency = text => { const t = (text || '').toLowerCase(); return EMERGENCY_TERMS.some(x => t.includes(x)); };
