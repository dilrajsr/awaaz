/* Awaaz front end — plain JavaScript, no frameworks. */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (_) { return null; } },
  set(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (_) {} },
};

/* ---------- small helpers ---------- */
function toast(msg) {
  const box = $('#toasts');
  const el = h('div', { class: 'toast' }, msg);
  box.append(el);
  setTimeout(() => el.remove(), 4200);
}

function h(tag, props = {}, ...kids) {
  const e = document.createElement(tag);
  Object.entries(props).forEach(([k, v]) => {
    if (v == null || v === false) return;
    if (k === 'class') e.className = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? '' : v);
  });
  kids.flat().forEach(k => k != null && e.append(k));
  return e;
}
const fmtDate = ts => new Date(ts * 1000).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
const safeUrl = u => (/^https?:\/\//i.test(u || '') ? u : '');

const I = window.AwaazI18n;
const t = I.t;
const lang = { get value() { return I.speechCode(); } };   // speech recognition / synthesis language
const langName = () => I.name();                            // language name sent to the AI agent

/* ---------- language gate (first visit) + switcher ---------- */
const gate = $('#langGate');
function buildGate() {
  const grid = $('#gateGrid'); grid.replaceChildren();
  const suggested = I.detect();
  const order = [...I.LANGS].sort((x, y) => (y.code === suggested) - (x.code === suggested));
  order.forEach(l => grid.append(h('button', { type: 'button', class: 'gate-btn' + (l.code === suggested ? ' sug' : ''), lang: l.code, onclick: () => chooseLang(l.code) },
    h('b', {}, l.native), l.code !== 'en' ? h('small', {}, l.name) : null)));
}
function openGate(first) {
  buildGate();
  $('#gateClose').hidden = !!first;
  gate.hidden = false; document.body.classList.add('noscroll');
  gate.querySelector('.gate-btn').focus();
}
function chooseLang(code) {
  I.setLang(code);
  gate.hidden = true; document.body.classList.remove('noscroll');
  // speak the greeting so someone who cannot read well still hears the next step
  Voice.speak(t('greet'), I.code, I.speechCode());
}
$('#navLang').addEventListener('click', () => openGate(false));
$('#gateClose').addEventListener('click', () => { gate.hidden = true; document.body.classList.remove('noscroll'); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !gate.hidden && I.hasChoice()) $('#gateClose').click(); });

const chips = $('#langChips');
I.LANGS.forEach(l => chips.append(h('li', {}, h('button', { type: 'button', class: 'lchip', 'data-code': l.code, lang: l.code, onclick: () => I.setLang(l.code) }, l.native))));

const GUIDED_ICONS = ['\u{1F4A7}', '\u{1F4A1}', '\u{1F6E1}️', '\u{1F46E}', '\u{1F4E6}', '\u{1F6E3}️', '\u{1F4BC}', '\u{1F3E6}'];
function buildGuided() {
  const box = $('#guided'); box.replaceChildren();
  GUIDED_ICONS.forEach((icon, i) => box.append(h('button', { type: 'button', class: 'guide', onclick: () => { $('#msg').value = t('g' + (i + 1)) + '. '; $('#msg').focus(); updatePiiWarn(); } }, h('span', { class: 'gi', 'aria-hidden': 'true' }, icon), h('b', {}, t('g' + (i + 1))))));
}

/* ---------- accessibility options ---------- */
const root = document.documentElement;
function applyA11y() {
  root.classList.toggle('large', store.get('awaaz-large') === '1');
  root.classList.toggle('contrast', store.get('awaaz-contrast') === '1');
  $('#optLarge').checked = store.get('awaaz-large') === '1';
  $('#optContrast').checked = store.get('awaaz-contrast') === '1';
  $('#optPlain').checked = store.get('awaaz-plain') === '1';
}
applyA11y();
$('#a11y').addEventListener('click', () => { const m = $('#a11ymenu'); m.hidden = !m.hidden; $('#a11y').setAttribute('aria-expanded', String(!m.hidden)); });
function applyTheme() {
  const th = store.get('awaaz-theme');
  if (th === 'dark' || th === 'light') root.dataset.theme = th; else delete root.dataset.theme;
  document.querySelectorAll('#themeSeg button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.theme === (th === 'dark' || th === 'light' ? th : 'auto'))));
  document.dispatchEvent(new Event('awaaz-theme'));
}
document.querySelectorAll('#themeSeg button').forEach(b => b.addEventListener('click', () => { store.set('awaaz-theme', b.dataset.theme === 'auto' ? null : b.dataset.theme); applyTheme(); }));
applyTheme();
$('#optLarge').addEventListener('change', e => { store.set('awaaz-large', e.target.checked ? '1' : '0'); applyA11y(); });
$('#optContrast').addEventListener('change', e => { store.set('awaaz-contrast', e.target.checked ? '1' : '0'); applyA11y(); });
$('#optPlain').addEventListener('change', e => { store.set('awaaz-plain', e.target.checked ? '1' : '0'); window.AwaazGL?.setPlain(e.target.checked); });

/* ---------- API + auth state ---------- */
let token = store.get('awaaz-token');
let me = null;
let profile = {};

async function api(path, opts = {}, raw = false) {
  const headers = { ...(opts.body && !(opts.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: 'Bearer ' + token } : {}) };
  let res;
  try { res = await fetch('/api' + path, { ...opts, headers }); }
  catch (_) { throw new Error('Cannot reach the server. Check your internet connection.'); }
  if (res.status === 401 && token) { logout(false); throw new Error('Please log in again.'); }
  if (!res.ok) {
    let msg = 'Something went wrong.';
    try { const d = await res.json(); msg = typeof d.detail === 'string' ? d.detail : (d.detail?.[0]?.msg || msg); } catch (_) {}
    throw new Error(msg);
  }
  return raw ? res : res.json();
}
const post = (p, body) => api(p, { method: 'POST', body: JSON.stringify(body || {}) });
const patch = (p, body) => api(p, { method: 'PATCH', body: JSON.stringify(body) });

function setSession(t, user) {
  token = t; me = user; store.set('awaaz-token', t);
  render();
  loadAll();
}
function logout(clearTokenOnly = true) {
  token = null; me = null; profile = {}; store.set('awaaz-token', null);
  render();
}
function render() {
  const on = !!me;
  $('#authBtn').textContent = on ? t('logout') : t('login');
  $('#savedGrid').hidden = !on;
  $('#savedGate').hidden = on;
  if (!on) $('#remindBar').hidden = true;
}
$('#authBtn').addEventListener('click', () => { if (me) { logout(); } else openAuth(); });

/* ---------- auth dialog ---------- */
const dlg = $('#authDlg');
let mode = 'login';
function setMode(m) {
  mode = m;
  document.querySelectorAll('.tabs [role=tab]').forEach(t => t.setAttribute('aria-selected', String(t.dataset.mode === m)));
  $('#aPw').hidden = m === 'otp';
  $('#aPw').required = m !== 'otp';
  $('#aPw').autocomplete = m === 'register' ? 'new-password' : 'current-password';
  $('#aOtpRow').hidden = m !== 'otp';
  $('#aName').hidden = m === 'login';
  $('#aConsentRow').hidden = m === 'login';
  $('#aMsg').textContent = '';
  $('#authTitle').textContent = m === 'register' ? t('auth_reg') : t('auth_login');
}
function openAuth(m = 'login') { setMode(m); if (!dlg.open) dlg.showModal(); $('#aId').focus(); }
document.querySelectorAll('.tabs [role=tab]').forEach(t => t.addEventListener('click', () => setMode(t.dataset.mode)));
$('#aCancel').addEventListener('click', () => dlg.close());
$('#aSendOtp').addEventListener('click', async () => {
  try {
    const r = await post('/auth/otp/request', { identifier: $('#aId').value });
    $('#aMsg').textContent = r.delivery === 'sms' ? 'Code sent by SMS.' : 'SMS is not set up on this server yet (developer mode: the code is in the server log). Use a password instead.';
  } catch (e) { $('#aMsg').textContent = e.message; }
});
$('#authForm').addEventListener('submit', async e => {
  e.preventDefault();
  const identifier = $('#aId').value, name = $('#aName').value, consent = $('#aConsent').checked;
  try {
    let r;
    if (mode === 'login') r = await post('/auth/login', { identifier, password: $('#aPw').value });
    else if (mode === 'register') r = await post('/auth/register', { identifier, password: $('#aPw').value, name, consent });
    else r = await post('/auth/otp/verify', { identifier, code: $('#aCode').value, name, consent });
    $('#aPw').value = ''; $('#aCode').value = '';
    dlg.close();
    setSession(r.token, r.user);
  } catch (err) { $('#aMsg').textContent = err.message; }
});

/* ---------- status, emergency ---------- */
let emergency = { numbers: [{ number: '112', label: 'All emergencies' }, { number: '100', label: 'Police' }, { number: '108', label: 'Ambulance' }], terms: [] };
fetch('/api/emergency').then(r => r.json()).then(d => { emergency = d; }).catch(() => {});

function showEmergency(retry) {
  const bar = $('#emergencyBar');
  bar.replaceChildren(
    h('strong', {}, t('emerg_title') + ' '),
    ...emergency.numbers.map(n => h('a', { href: 'tel:' + n.number, class: 'num' }, n.number, h('small', {}, ' ' + n.label))),
    retry ? h('button', { class: 'btn small ghost', type: 'button', onclick: () => { bar.hidden = true; retry(); } }, t('emerg_not')) : null,
    h('button', { class: 'close', type: 'button', 'aria-label': 'Close', onclick: () => { bar.hidden = true; } }, '×'));
  bar.hidden = false; bar.scrollIntoView({ block: 'nearest' });
}
const looksEmergency = t => emergency.terms.some(x => t.toLowerCase().includes(x));

async function checkStatus() {
  const el = $('#apiStatus');
  try {
    const s = await (await fetch('/api/status')).json();
    if (s.agent_configured) { el.textContent = t('status_ok'); el.className = 'status ok'; }
    else { el.textContent = t('status_nocfg'); el.className = 'status warn'; }
  } catch (_) { el.textContent = t('status_off'); el.className = 'status warn'; }
}

/* ---------- PII warning ---------- */
const PII = [/\b[2-9]\d{3}[\s-]?\d{4}[\s-]?\d{4}\b/, /\b[A-Z]{5}\d{4}[A-Z]\b/, /\b(?:\d[ -]?){13,16}\b/];
function updatePiiWarn() { $('#piiWarn').hidden = !PII.some(r => r.test($('#msg').value)); }
$('#msg').addEventListener('input', updatePiiWarn);

/* ---------- chat ---------- */
const log = $('#log');
const history = [];
let lastComplaint = null;

function bubble(text, cls) {
  const b = h('div', { class: 'bubble ' + cls }, text);
  log.append(b); log.scrollTop = log.scrollHeight;
  return b;
}

async function sendChat(notEmergency = false) {
  const wait = bubble(t('researching'), 'bot');
  wait.prepend(h('span', { class: 'dots' }, h('i'), h('i'), h('i')));
  $('#send').disabled = true;
  try {
    const r = await post('/agent/chat', { messages: history, language: langName(), not_emergency: notEmergency });
    wait.remove();
    if (r.pii_removed) bubble('For your safety I removed: ' + r.pii_removed.join(', ') + ' before processing.', 'bot');
    if (r.type === 'emergency') { emergency.numbers = r.numbers; history.pop(); showEmergency(() => { history.push({ role: 'user', content: lastUser }); sendChat(true); }); bubble('This sounds urgent. Please call the numbers above first.', 'bot'); }
    else if (r.type === 'followup') { const q = r.questions.join('\n'); bubble(q, 'bot'); history.push({ role: 'assistant', content: q }); replyAloud(q); }
    else if (r.type === 'complaint') { bubble(r.summary, 'bot'); history.push({ role: 'assistant', content: r.summary }); showComplaint(r); replyAloud(r.summary); }
    else { bubble(r.reply, 'bot'); history.push({ role: 'assistant', content: r.reply }); replyAloud(r.reply); }
  } catch (err) { wait.remove(); bubble(err.message, 'err'); }
  finally { $('#send').disabled = false; }
}

let lastUser = '';
let voiceNext = false;   // the message about to be sent was spoken, so the reply is spoken back too
let voiceTurn = false;
const replyAloud = text => { if (voiceTurn) Voice.speak(text, I.code, I.speechCode()); };
$('#composer').addEventListener('submit', e => {
  e.preventDefault();
  const ta = $('#msg'), text = ta.value.trim();
  if (!text) return;
  if (looksEmergency(text)) showEmergency(null);
  if (!me) { openAuth(); return; }
  voiceTurn = voiceNext; voiceNext = false;
  if (!voiceTurn) Voice.stop();
  ta.value = ''; updatePiiWarn();
  lastUser = text;
  bubble(text, 'user');
  history.push({ role: 'user', content: text });
  sendChat();
});
$('#msg').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#composer').requestSubmit(); } });

/* voice input */
// Azure AI Speech (server-side) when configured; otherwise the browser's own recognition.
const mic = $('#mic');
const micTitle = mic.title;
Voice.ready.then(() => {
  if (!Voice.canListen()) { mic.disabled = true; mic.title = 'Voice input is not supported in this browser (try Chrome)'; }
});
let recorder = null;      // Azure path: active microphone recording
let browserRec = null;    // fallback path: SpeechRecognition instance
const micOff = () => { mic.classList.remove('on'); mic.disabled = false; mic.title = micTitle; };

function micSpoke(text) {
  const ta = $('#msg');
  ta.value += (ta.value && !/\s$/.test(ta.value) ? ' ' : '') + text;
  updatePiiWarn();
  voiceNext = true;
  if (me) $('#composer').requestSubmit(); else openAuth();   // keep the words in the box until they have logged in
}

mic.addEventListener('click', async () => {
  await Voice.ready;
  Voice.stop();
  if (Voice.azure() && navigator.mediaDevices) {
    if (recorder) {                                  // second tap: stop and send to Azure
      const r = recorder; recorder = null;
      mic.classList.remove('on'); mic.disabled = true;
      try {
        const text = (await Voice.transcribe(await r.stop(), I.code, token)).trim();
        if (text) micSpoke(text); else bubble('I could not hear anything. Please tap the microphone and try again.', 'err');
      } catch (err) { bubble(err.message, 'err'); }
      micOff();
      return;
    }
    if (!me) { openAuth(); return; }
    try { recorder = await Voice.record(() => mic.click()); mic.classList.add('on'); mic.title = 'Tap again when you finish speaking'; }
    catch (_) { recorder = null; bubble('The microphone is blocked. Please allow microphone access and try again.', 'err'); }
    return;
  }
  const SR = Voice.browserRecognition();
  if (!SR) return;
  if (browserRec) { browserRec.stop(); return; }
  browserRec = new SR(); browserRec.lang = lang.value; browserRec.interimResults = false;
  browserRec.onresult = ev => micSpoke(ev.results[0][0].transcript);
  browserRec.onend = browserRec.onerror = () => { browserRec = null; mic.classList.remove('on'); };
  browserRec.start(); mic.classList.add('on');
});

/* document upload */
$('#docFile').addEventListener('change', async e => {
  const f = e.target.files[0]; e.target.value = '';
  if (!f) return;
  if (!me) { openAuth(); return; }
  const w = bubble('Reading ' + f.name + '…', 'bot');
  try {
    const fd = new FormData(); fd.append('file', f);
    const r = await api('/documents', { method: 'POST', body: fd });
    w.remove();
    bubble('Added: ' + r.filename + (r.note ? '. ' + r.note : r.text ? '. I copied the text into the box so you can check it before sending.' : ''), 'bot');
    if (r.text) { $('#msg').value += (($('#msg').value ? '\n' : '') + 'From my document: ' + r.text.slice(0, 1500)); updatePiiWarn(); }
    loadDocs();
  } catch (err) { w.remove(); bubble(err.message, 'err'); }
});

/* ---------- complaint view ---------- */
const fillPlaceholders = t => t
  .replaceAll('[NAME]', profile.name || '[NAME]').replaceAll('[ADDRESS]', profile.address || '[ADDRESS]')
  .replaceAll('[PHONE]', profile.phone || '[PHONE]').replaceAll('[DATE]', new Date().toLocaleDateString('en-IN'));
const ol = (items, tag) => h(tag, {}, (items || []).map(i => h('li', {}, i)));

function showComplaint(c, opts = {}) {
  lastComplaint = c;
  $('#resultEmpty').hidden = true;
  const body = $('#resultBody'); body.hidden = false; body.replaceChildren();
  const url = safeUrl(c.portal_url);
  const letter = h('div', { class: 'draft', id: 'letter' }, fillPlaceholders(c.complaint_text));
  const readText = () => [c.department, c.portal_name, 'Online steps:', ...(c.steps_online || []), 'Offline steps:', ...(c.steps_offline || [])].filter(Boolean).join('. ');
  body.append(
    h('span', { class: 'tag' }, t('not_submitted')),
    h('h4', {}, t('r_dept')), h('div', {}, c.department || '—'),
    h('h4', {}, t('r_where')),
    h('div', {}, url ? h('a', { href: url, target: '_blank', rel: 'noopener noreferrer' }, c.portal_name || url) : (c.portal_name || 'No portal confirmed — see the note below.'), c.helpline ? '  ·  Helpline ' : '', c.helpline ? h('a', { href: 'tel:' + c.helpline.replace(/[^\d+]/g, '') }, c.helpline) : null),
    c.steps_online?.length ? [h('h4', {}, t('r_online')), ol(c.steps_online, 'ol')] : [],
    c.steps_offline?.length ? [h('h4', {}, t('r_offline')), ol(c.steps_offline, 'ol')] : [],
    c.documents_needed?.length ? [h('h4', {}, t('r_docs')), ol(c.documents_needed, 'ul')] : [],
    h('h4', {}, t('r_letter')), letter,
    c.confidence_note ? [h('h4', {}, t('r_recheck')), h('div', { class: 'muted' }, c.confidence_note)] : [],
    c.sources?.length ? [h('h4', {}, t('r_sources')), h('ul', {}, c.sources.map(s => h('li', {}, safeUrl(s) ? h('a', { href: s, target: '_blank', rel: 'noopener noreferrer' }, s) : s)))] : [],
    h('div', { class: 'actions' },
      opts.saved ? null : h('button', { class: 'btn small', onclick: () => saveDraft(c) }, t('b_save')),
      h('button', { class: 'btn ghost small', onclick: () => navigator.clipboard?.writeText(letter.textContent) }, t('b_copy')),
      h('button', { class: 'btn ghost small', onclick: () => printLetter(letter.textContent) }, t('b_print')),
      h('button', { class: 'btn ghost small', onclick: () => window.open('https://wa.me/?text=' + encodeURIComponent(letter.textContent), '_blank', 'noopener') }, t('b_wa')),
      h('button', { class: 'btn ghost small', onclick: ev => {
        const btn = ev.target;
        if (Voice.isSpeaking()) { Voice.stop(); btn.textContent = t('b_read'); return; }
        btn.textContent = t('b_stop');
        Voice.speak(readText(), I.code, I.speechCode()).then(() => { btn.textContent = t('b_read'); });
      } }, t('b_read'))),
    opts.noFeedback ? null : h('div', { class: 'fb' }, h('span', { class: 'muted' }, t('fb_q') + ' '),
      h('button', { class: 'btn ghost small', onclick: ev => sendFeedback(true, c, ev.target) }, t('yes')),
      h('button', { class: 'btn ghost small', onclick: ev => sendFeedback(false, c, ev.target) }, t('no'))));
  body.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

async function sendFeedback(helpful, c, btn) {
  try { await post('/feedback', { helpful, draft_ref: (c.department || '').slice(0, 100) }); btn.parentElement.replaceChildren(t('thanks')); }
  catch (e) { btn.parentElement.append(' ' + e.message); }
}

function printLetter(text) {
  let el = $('#printLetter');
  if (!el) { el = h('pre', { id: 'printLetter' }); document.body.append(el); }
  el.textContent = text;
  window.print();
}

async function saveDraft(c) {
  if (!me) { openAuth(); return; }
  try {
    const r = await post('/drafts', { title: (c.summary || 'Complaint').slice(0, 150), department: c.department || '', portal_url: safeUrl(c.portal_url), language: langName(), body: c.complaint_text, notes: (c.sources || []).join('\n') });
    if (r.pii_warning?.length) bubble('Your draft seems to contain: ' + r.pii_warning.join(', ') + '. Please remove it before sending.', 'err');
    if (safeUrl(c.portal_url)) post('/sources', { url: c.portal_url, label: c.portal_name || c.department }).catch(() => {});
    bubble('Draft saved in "My saved". It is not submitted.', 'bot');
    loadDrafts(); loadSources();
  } catch (e) { bubble('Could not save: ' + e.message, 'err'); }
}

/* ---------- drafts + tracking ---------- */
const STATUS = { get draft() { return t('st_draft'); }, get submitted_by_me() { return t('st_submitted'); }, get awaiting_reply() { return t('st_awaiting'); }, get resolved() { return t('st_resolved'); } };
const openDrafts = new Set();

async function loadDrafts() {
  const ul = $('#drafts');
  try {
    const d = await api('/drafts');
    ul.replaceChildren(...(d.length ? d.map(draftItem) : [h('li', { class: 'muted' }, 'No drafts yet.')]));
    loadReminders();
  } catch (e) { ul.replaceChildren(h('li', { class: 'muted' }, e.message)); }
}

function draftItem(x) {
  const det = h('details', { class: 'draft-item', open: openDrafts.has(x.id) },
    h('summary', {}, h('span', {}, h('b', {}, x.title), h('br'), h('small', { class: 'muted' }, x.department + ' · ' + STATUS[x.status] + (x.follow_up_due ? ' · follow up by ' + x.follow_up_due : '')))));
  det.addEventListener('toggle', () => { det.open ? openDrafts.add(x.id) : openDrafts.delete(x.id); if (det.open && !det.dataset.loaded) { det.dataset.loaded = '1'; fillDetails(det, x); } });
  if (det.open) { det.dataset.loaded = '1'; fillDetails(det, x); }
  return h('li', { class: 'col' }, det);
}

async function fillDetails(det, x) {
  const num = h('input', { placeholder: 'Complaint / reference number', value: x.complaint_number || '', maxlength: '80', 'aria-label': 'Complaint number' });
  const filed = h('input', { type: 'date', value: x.filed_on || '', 'aria-label': 'Date you filed it' });
  const sel = h('select', { 'aria-label': 'Status' }, Object.entries(STATUS).map(([k, v]) => h('option', { value: k, selected: k === x.status }, v)));
  const tl = h('ol', { class: 'timeline' });
  const note = h('input', { placeholder: 'Add a note (e.g. called the office)', maxlength: '1000', 'aria-label': 'Note' });
  const wrap = h('div', { class: 'stack track' },
    h('small', { class: 'muted' }, 'Awaaz never files for you. Record here when you do.'),
    h('div', { class: 'two' }, num, filed), sel,
    h('div', { class: 'actions' },
      h('button', { class: 'btn small', onclick: async () => { try { await patch('/drafts/' + x.id, { status: sel.value, complaint_number: num.value, filed_on: filed.value }); loadDrafts(); } catch (e) { toast(e.message); } } }, 'Save tracking'),
      h('button', { class: 'btn ghost small', onclick: () => showComplaint({ summary: x.title, department: x.department, portal_url: x.portal_url, complaint_text: x.body, sources: (x.notes || '').split('\n').filter(Boolean) }, { saved: true, noFeedback: true }) }, 'Open letter')),
    h('div', { class: 'actions' },
      h('button', { class: 'btn ghost small', onclick: ev => escalate(x, 'escalation', ev.target) }, 'Write follow-up / escalation letter'),
      h('button', { class: 'btn ghost small', onclick: ev => escalate(x, 'rti', ev.target) }, 'Write RTI application')),
    h('h4', {}, 'Timeline'), tl,
    h('div', { class: 'stack inline' }, note, h('button', { class: 'btn small ghost', onclick: async () => { if (!note.value.trim()) return; await post(`/drafts/${x.id}/events`, { text: note.value }); note.value = ''; loadTl(); } }, 'Add')),
    h('button', { class: 'linkbtn danger', onclick: async () => { if (confirm('Delete this draft and its timeline?')) { await api('/drafts/' + x.id, { method: 'DELETE' }); loadDrafts(); } } }, 'Delete this draft'));
  det.append(wrap);
  async function loadTl() { const ev = await api(`/drafts/${x.id}/events`); tl.replaceChildren(...ev.map(e => h('li', {}, h('small', { class: 'muted' }, fmtDate(e.at)), ' ', e.text))); }
  loadTl().catch(() => {});
}

async function escalate(x, kind, btn) {
  const old = btn.textContent; btn.disabled = true; btn.textContent = 'Writing…';
  try {
    const r = await post(`/drafts/${x.id}/escalate`, { kind });
    showComplaint({ summary: r.title, department: r.department, complaint_text: r.text, sources: [] }, { noFeedback: true });
    location.hash = '#assistant';
  } catch (e) { toast(e.message); }
  finally { btn.disabled = false; btn.textContent = old; }
}

async function loadReminders() {
  try {
    const r = await api('/reminders');
    const bar = $('#remindBar');
    if (!r.length) { bar.hidden = true; return; }
    bar.replaceChildren(h('b', {}, 'Time to follow up: '), r.map(x => h('a', { href: '#saved', onclick: () => openDrafts.add(x.id) }, x.title + ' (due ' + x.follow_up_due + ')  ')));
    bar.hidden = false;
  } catch (_) {}
}

/* ---------- documents ---------- */
async function loadDocs() {
  const ul = $('#docs');
  try {
    const d = await api('/documents');
    ul.replaceChildren(...(d.length ? d.map(x => h('li', {}, h('span', {}, x.filename), h('span', {},
      h('button', { onclick: async () => { const b = await (await api(`/documents/${x.id}/file`, {}, true)).blob(); window.open(URL.createObjectURL(b), '_blank'); } }, 'View'), ' ',
      h('button', { onclick: async () => { await api('/documents/' + x.id, { method: 'DELETE' }); loadDocs(); } }, 'Delete')))) : [h('li', { class: 'muted' }, 'No documents yet.')]));
  } catch (e) { ul.replaceChildren(h('li', { class: 'muted' }, e.message)); }
}

/* ---------- watched sources ---------- */
async function loadSources(check) {
  const ul = $('#sources');
  try {
    const s = check ? await post('/sources/check') : await api('/sources');
    ul.replaceChildren(...(s.length ? s.map(x => h('li', { class: 'col' + (x.needs_recheck ? ' flag' : '') },
      h('div', { class: 'between' },
        h('span', {}, h('a', { href: safeUrl(x.url), target: '_blank', rel: 'noopener noreferrer' }, x.label), h('br'),
          h('small', { class: 'muted' }, x.needs_recheck ? 'Changed or unreachable — please recheck' : x.checked_at ? 'Checked ' + fmtDate(x.checked_at) + ', no change' : 'Not checked yet')),
        h('span', {}, x.needs_recheck ? h('button', { onclick: async () => { await post(`/sources/${x.id}/acknowledge`); loadSources(); } }, 'I rechecked') : null, ' ',
          h('button', { onclick: async () => { await api('/sources/' + x.id, { method: 'DELETE' }); loadSources(); } }, 'Remove'))),
      x.needs_recheck && x.last_diff ? h('pre', { class: 'diff' }, x.last_diff) : null)) : [h('li', { class: 'muted' }, 'Nothing watched yet.')]));
  } catch (e) { ul.replaceChildren(h('li', { class: 'muted' }, e.message)); }
}
$('#checkSources').addEventListener('click', async ev => { ev.target.disabled = true; try { await loadSources(true); } finally { ev.target.disabled = false; } });
$('#srcForm').addEventListener('submit', async e => {
  e.preventDefault();
  try { await post('/sources', { url: $('#srcUrl').value }); $('#srcUrl').value = ''; loadSources(); } catch (err) { toast(err.message); }
});

/* ---------- profile, data rights, feedback ---------- */
const pf = $('#profile');
pf.addEventListener('submit', async e => {
  e.preventDefault();
  try { profile = { ...Object.fromEntries(new FormData(pf)), language: langName() }; await api('/profile', { method: 'PUT', body: JSON.stringify(profile) }); $('#profileNote').textContent = 'Saved.'; }
  catch (err) { $('#profileNote').textContent = err.message; }
});
async function loadProfile() {
  try { profile = await api('/profile'); Object.entries(profile).forEach(([k, v]) => pf.elements[k] && (pf.elements[k].value = v || '')); } catch (_) {}
}
$('#exportMe').addEventListener('click', async () => {
  try {
    const data = await api('/me/export');
    const a = h('a', { href: URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })), download: 'awaaz-my-data.json' });
    document.body.append(a); a.click(); a.remove();
  } catch (e) { toast(e.message); }
});
$('#deleteMe').addEventListener('click', async () => {
  if (!confirm('This permanently deletes your account, drafts, documents and watched pages. Continue?')) return;
  try { await api('/me', { method: 'DELETE' }); logout(); toast('Your account and data were deleted.'); } catch (e) { toast(e.message); }
});
$('#fbForm').addEventListener('submit', async e => {
  e.preventDefault();
  if (!me) { openAuth(); return; }
  try { await post('/feedback', { helpful: true, draft_ref: 'general-feedback', comment: $('#fbText').value }); $('#fbText').value = ''; $('#fbNote').textContent = 'Thank you!'; } catch (err) { $('#fbNote').textContent = err.message; }
});

function loadAll() { loadProfile(); loadDrafts(); loadDocs(); loadSources(); }

/* ---------- hero: tap to speak ---------- */
function speakNow() {
  $('#assistant').scrollIntoView({ behavior: 'smooth', block: 'start' });
  setTimeout(() => { $('#msg').focus(); if (!mic.disabled && !mic.classList.contains('on')) mic.click(); }, 450);
}
$('#orb').addEventListener('click', speakNow);
$('#mbarSpeak').addEventListener('click', speakNow);
$('#ctaSpeak').addEventListener('click', speakNow);

/* ---------- re-render dynamic text when the language changes ---------- */
I.onChange(() => {
  buildGuided(); render(); checkStatus();
  if (me) loadDrafts();
  if (dlg.open) setMode(mode);
});

/* ---------- scroll polish: reading progress + reveal on scroll ---------- */
const bar = $('#progress');
let tick = false;
addEventListener('scroll', () => {
  if (tick) return; tick = true;
  requestAnimationFrame(() => { const m = document.documentElement.scrollHeight - innerHeight; bar.style.transform = 'scaleX(' + (m > 0 ? Math.min(1, scrollY / m) : 0) + ')'; tick = false; });
}, { passive: true });
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  document.querySelectorAll('.rv').forEach(el => io.observe(el));
} else document.querySelectorAll('.rv').forEach(el => el.classList.add('in'));

/* ---------- boot ---------- */
$('#yr').textContent = new Date().getFullYear();
I.apply();
buildGuided();
render();
checkStatus();
if (!I.hasChoice()) openGate(true);
if (token) api('/me').then(u => { me = u; render(); loadAll(); }).catch(() => logout());
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
