import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';

process.env.AWAAZ_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'awaaz-'));
process.env.MONITOR_INTERVAL_HOURS = '0';
delete process.env.GEMINI_API_KEY; delete process.env.AZURE_SPEECH_KEY; delete process.env.AZURE_SPEECH_REGION;

const core = await import('../server/core.js');
const agent = await import('../server/agent.js');
const speech = await import('../server/speech.js');
const { app } = await import('../server/index.js');

let server, base;
before(() => new Promise(r => { server = app.listen(0, '127.0.0.1', () => { base = `http://127.0.0.1:${server.address().port}`; r(); }); }));
after(() => { server.close(); });

async function call(method, url, { headers = {}, json, body } = {}) {
  const r = await fetch(base + url, { method, headers: { ...(json ? { 'Content-Type': 'application/json' } : {}), ...headers }, body: json ? JSON.stringify(json) : body });
  const ct = r.headers.get('content-type') || '';
  return { status: r.status, headers: r.headers, body: ct.includes('json') ? await r.json() : await r.arrayBuffer() };
}
const get = (u, h) => call('GET', u, { headers: h });
const post = (u, json, h) => call('POST', u, { json, headers: h });
const patch = (u, json, h) => call('PATCH', u, { json, headers: h });

async function reg(ident = '9876543210', pw = 'password123') {
  const r = await post('/api/auth/register', { identifier: ident, password: pw, name: 'Test', consent: true });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  return { Authorization: 'Bearer ' + r.body.token };
}

// ---- routing: real problems -> expected route id ----
const ROUTING_CASES = [
  ['Someone cheated me on UPI and took 5000 rupees', 'cyber'],
  ['The seller sent a defective phone and refuses refund', 'consumer'],
  ['My PF is not credited by my employer', 'epf'],
  ['मेरे साथ ऑनलाइन ठगी हुई है', 'cyber'],
  ['Train ticket refund not received, coach was dirty', 'railway'],
  ['insurance claim rejected without reason', 'insurance'],
  ['officer is asking for bribe to pass my file', 'corruption'],
  ['there is a big pothole and garbage on my road', 'roads'],
  ['ਮੇਰੇ ਘਰ ਪਾਣੀ ਨਹੀਂ ਆ ਰਿਹਾ', 'water'],
  ['I want information under RTI', 'rti'],
];
for (const [text, expected] of ROUTING_CASES) {
  test('routing: ' + text, () => assert.ok(agent.lookupKnownRoutes(text).map(r => r.id).includes(expected)));
}

test('short keywords do not match inside words', () => {
  assert.ok(!agent.lookupKnownRoutes('my simple pfizer problem').map(r => r.id).includes('epf'));
});

test('official domain check', () => {
  assert.ok(agent.isOfficial('https://pgportal.gov.in/x'));
  assert.ok(!agent.isOfficial('https://pgportal.gov.in.evil.com'));
  assert.ok(!agent.isOfficial('ftp://x.gov.in'));
  assert.ok(!agent.isOfficial('https://example.com'));
});

test('pii and emergency', () => {
  assert.ok(core.findPii('my aadhaar 2345 6789 0123').includes('Aadhaar number'));
  assert.ok(core.findPii('ABCDE1234F').includes('PAN'));
  assert.ok(core.maskPii('card 4111 1111 1111 1111').includes('removed'));
  assert.ok(core.isEmergency('my husband is beating me, domestic violence'));
  assert.ok(core.isEmergency('मुझे आत्महत्या के विचार आ रहे हैं'));
  assert.ok(!core.isEmergency('my salary was not paid'));
});

test('encryption round-trips and rejects tampering', () => {
  const t = core.enc('ਸਤ ਸ੍ਰੀ ਅਕਾਲ secret');
  assert.equal(core.dec(t), 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ secret');
  assert.equal(core.dec(t.slice(0, -4) + 'AAAA'), '');
});

test('auth flow', async () => {
  assert.equal((await post('/api/auth/register', { identifier: '9111111111', password: 'password123', consent: false })).status, 400);
  const h = await reg('9111111111');
  assert.equal((await get('/api/me', h)).body.phone, '9111111111');
  assert.equal((await post('/api/auth/login', { identifier: '+91 9111111111', password: 'password123' })).status, 200);
  assert.equal((await post('/api/auth/login', { identifier: '9111111111', password: 'wrongpass1' })).status, 401);
  assert.equal((await get('/api/me')).status, 401);
  assert.equal((await get('/api/me', { Authorization: 'Bearer junk' })).status, 401);
});

test('drafts are private, encrypted and tracked', async () => {
  const a = await reg('9222222222'), b = await reg('9333333333');
  const d = (await post('/api/drafts', { title: 't', department: 'D', body: 'secret body' }, a)).body;
  assert.deepEqual((await get('/api/drafts', b)).body, []);
  assert.equal((await patch(`/api/drafts/${d.id}`, { status: 'resolved' }, b)).status, 404);
  assert.ok(!core.get('SELECT body FROM drafts').body.includes('secret'));
  const out = (await patch(`/api/drafts/${d.id}`, { status: 'submitted_by_me', complaint_number: 'CPG/123', filed_on: '2020-01-01' }, a)).body;
  assert.equal(out.follow_up_due, '2020-01-31');
  assert.equal(out.body, 'secret body');
  assert.deepEqual((await get('/api/reminders', a)).body.map(x => x.id), [d.id]);
  const kinds = (await get(`/api/drafts/${d.id}/events`, a)).body.map(e => e.kind);
  for (const k of ['created', 'status', 'number', 'filed']) assert.ok(kinds.includes(k), k);
  assert.equal((await patch(`/api/drafts/${d.id}`, { filed_on: '31-01-2020' }, a)).status, 400);
});

test('chat: emergency shortcut, then not configured', async () => {
  const h = await reg('9444444444');
  const r = (await post('/api/agent/chat', { messages: [{ role: 'user', content: 'he will kill me, domestic violence' }] }, h)).body;
  assert.equal(r.type, 'emergency');
  assert.equal(r.numbers[0].number, '112');
  assert.equal((await post('/api/agent/chat', { messages: [{ role: 'user', content: 'water problem' }] }, h)).status, 503);
});

test('chat masks pii before the model', async () => {
  const h = await reg('9555555555');
  process.env.GEMINI_API_KEY = 'x';
  const orig = agent.deps.generate;
  let seen;
  agent.deps.generate = async body => { seen = body; return { candidates: [{ content: { role: 'model', parts: [{ text: 'ok' }] } }] }; };
  try {
    const r = (await post('/api/agent/chat', { messages: [{ role: 'user', content: 'my aadhaar is 2345 6789 0123' }] }, h)).body;
    assert.ok(!JSON.stringify(seen.contents).includes('2345'));
    assert.deepEqual(r.pii_removed, ['Aadhaar number']);
    assert.equal(r.reply, 'ok');
  } finally { agent.deps.generate = orig; delete process.env.GEMINI_API_KEY; }
});

test('sources only official', async () => {
  const h = await reg('9666666666');
  assert.equal((await post('/api/sources', { url: 'https://example.com' }, h)).status, 400);
  assert.equal((await post('/api/sources', { url: 'https://pgportal.gov.in' }, h)).status, 200);
});

test('source change detection', async () => {
  const h = await reg('9777777777');
  await post('/api/sources', { url: 'https://pgportal.gov.in' }, h);
  const pages = [
    'The grievance form lives at the old address today. Keep your documents ready.',
    'The grievance form lives at the old address today. Keep your documents ready.',
    'The grievance form has moved to a brand new address today. Keep your documents ready.'];
  const origFetch = globalThis.fetch;
  let i = 0;
  globalThis.fetch = (url, opts) => String(url).startsWith(base) ? origFetch(url, opts)
    : Promise.resolve({ ok: true, status: 200, url: String(url), text: async () => pages[i++] });
  const results = [];
  try {
    for (let n = 0; n < 3; n++) results.push((await post('/api/sources/check', {}, h)).body[0]);
  } finally { globalThis.fetch = origFetch; }
  assert.deepEqual(results.map(r => r.needs_recheck), [0, 0, 1]);
  assert.match(results[2].last_diff, /brand new/);
});

test('upload validation', async () => {
  const h = await reg('9888888888');
  const upload = (name, bytes, type) => { const fd = new FormData(); fd.append('file', new Blob([bytes], { type }), name); return call('POST', '/api/documents', { headers: h, body: fd }); };
  assert.equal((await upload('a.exe', 'MZ', 'application/x-msdownload')).status, 400);
  assert.equal((await upload('a.pdf', 'not a pdf', 'application/pdf')).status, 400);
  const r = await upload('a.pdf', '%PDF-1.4 x', 'application/pdf');
  assert.equal(r.status, 200);
  assert.equal((await get(`/api/documents/${r.body.id}/file`, await reg('9999999999'))).status, 404);
  assert.equal((await get(`/api/documents/${r.body.id}/file`, h)).status, 200);
});

test('otp dev flow and account deletion', async () => {
  const ident = '9000000001';
  assert.equal((await post('/api/auth/otp/request', { identifier: ident })).body.delivery, 'console');
  core.run('UPDATE otps SET code_hash=?', crypto.createHash('sha256').update('123456' + ident).digest('hex'));
  assert.equal((await post('/api/auth/otp/verify', { identifier: ident, code: '000000', consent: true })).status, 400);
  const r = await post('/api/auth/otp/verify', { identifier: ident, code: '123456', consent: true });
  assert.equal(r.status, 200);
  const h = { Authorization: 'Bearer ' + r.body.token };
  await post('/api/drafts', { title: 't', body: 'b' }, h);
  assert.equal((await call('DELETE', '/api/me', { headers: h })).status, 200);
  assert.equal((await get('/api/me', h)).status, 401);
});

test('security headers and site', async () => {
  const r = await get('/');
  assert.equal(r.status, 200);
  assert.match(r.headers.get('content-security-policy'), /script-src 'self'/);
  assert.deepEqual((await get('/api/health')).body, { ok: true });
  assert.equal((await get('/api/nope')).status, 404);
});

test('gemini agent loop: search tool then deliver_complaint', async () => {
  const sent = [];
  const replies = [
    { candidates: [{ content: { role: 'model', parts: [{ functionCall: { name: 'search_routing_knowledge', args: { query: 'upi fraud' } } }] } }] },
    { candidates: [{ content: { role: 'model', parts: [{ functionCall: { name: 'deliver_complaint', args: {
      summary: 's', department: 'I4C', complaint_text: 'Dear Sir [NAME]', steps_online: ['a'], steps_offline: ['b'], sources: ['https://cybercrime.gov.in'] } } }] } }] },
  ];
  const orig = agent.deps.generate;
  agent.deps.generate = async body => { sent.push(structuredClone(body)); return replies[sent.length - 1]; };
  try {
    const out = await agent.runAgent([{ role: 'user', content: 'UPI fraud' }], 'English');
    assert.equal(out.type, 'complaint');
    assert.equal(out.submitted, false);
    assert.equal(out.department, 'I4C');
    const fr = sent[1].contents.find(c => c.role === 'user' && c.parts[0].functionResponse).parts[0].functionResponse;
    assert.equal(fr.name, 'search_routing_knowledge');
    assert.equal(fr.response.result.known_routes[0].id, 'cyber');
    assert.ok(sent[0].tools[0].functionDeclarations.length && sent[0].systemInstruction);
  } finally { agent.deps.generate = orig; }
});

test('gemini follow-up', async () => {
  const orig = agent.deps.generate;
  agent.deps.generate = async () => ({ candidates: [{ content: { role: 'model', parts: [{ functionCall: { name: 'ask_followup', args: { questions: ['Where?'] } } }] } }] });
  try { assert.deepEqual(await agent.runAgent([{ role: 'user', content: 'x' }], 'Hindi'), { type: 'followup', questions: ['Where?'] }); }
  finally { agent.deps.generate = orig; }
});

// ---- Azure speech ----
test('speech: not configured, status flag, validation', async () => {
  assert.equal((await get('/api/status')).body.speech_configured, false);
  assert.equal((await post('/api/speech/tts', { text: 'hi', lang: 'pa' })).status, 503);
});

test('speech: Punjabi text-to-speech uses the pa-IN neural voice', async () => {
  process.env.AZURE_SPEECH_KEY = 'k'; process.env.AZURE_SPEECH_REGION = 'centralindia';
  const orig = speech.deps.fetch;
  let call1;
  speech.deps.fetch = async (url, opts) => { call1 = { url, opts }; return new Response(Buffer.from('ID3fakemp3'), { status: 200 }); };
  try {
    assert.equal((await get('/api/status')).body.speech_configured, true);
    const r = await post('/api/speech/tts', { text: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ <b> & co', lang: 'pa' });
    assert.equal(r.status, 200);
    assert.equal(r.headers.get('content-type'), 'audio/mpeg');
    assert.equal(call1.url, 'https://centralindia.tts.speech.microsoft.com/cognitiveservices/v1');
    assert.equal(call1.opts.headers['Ocp-Apim-Subscription-Key'], 'k');
    assert.match(call1.opts.body, /xml:lang="pa-IN"><voice name="pa-IN-VaaniNeural">/);
    assert.match(call1.opts.body, /ਸਤ ਸ੍ਰੀ ਅਕਾਲ &lt;b&gt; &amp; co/); // SSML-escaped
    assert.equal((await post('/api/speech/tts', { text: 'x', lang: 'xx' })).status, 422);
    assert.equal((await post('/api/speech/tts', { text: '', lang: 'pa' })).status, 422);
  } finally { speech.deps.fetch = orig; }
});

test('speech: Punjabi speech-to-text sends WAV with pa-IN and needs login', async () => {
  const orig = speech.deps.fetch;
  let call1;
  speech.deps.fetch = async (url, opts) => { call1 = { url, opts }; return Response.json({ RecognitionStatus: 'Success', DisplayText: 'ਮੇਰੇ ਘਰ ਪਾਣੀ ਨਹੀਂ ਆ ਰਿਹਾ।' }); };
  const wav = Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(2000)]);
  const stt = (lang, h) => call('POST', `/api/speech/stt?lang=${lang}`, { headers: { 'Content-Type': 'audio/wav', ...h }, body: wav });
  try {
    assert.equal((await stt('pa')).status, 401);
    const h = { Authorization: 'Bearer ' + (await post('/api/auth/login', { identifier: '9111111111', password: 'password123' })).body.token };
    const r = await stt('pa', h);
    assert.equal(r.status, 200);
    assert.equal(r.body.text, 'ਮੇਰੇ ਘਰ ਪਾਣੀ ਨਹੀਂ ਆ ਰਿਹਾ।');
    assert.match(call1.url, /^https:\/\/centralindia\.stt\.speech\.microsoft\.com\/.*language=pa-IN/);
    assert.match(call1.opts.headers['Content-Type'], /^audio\/wav; codecs=audio\/pcm; samplerate=16000/);
    assert.equal((await stt('xx', h)).status, 422);
    assert.equal((await call('POST', '/api/speech/stt?lang=pa', { headers: { 'Content-Type': 'audio/wav', ...h }, body: Buffer.from('nope') })).status, 400);
    speech.deps.fetch = async () => Response.json({ RecognitionStatus: 'NoMatch' });
    assert.equal((await stt('pa', h)).body.text, '');
    speech.deps.fetch = async () => new Response('denied', { status: 401 });
    assert.equal((await stt('pa', h)).status, 502);
  } finally { speech.deps.fetch = orig; delete process.env.AZURE_SPEECH_KEY; delete process.env.AZURE_SPEECH_REGION; }
});

test('every interface language has an Azure voice', () => {
  const src = fs.readFileSync(new URL('../site/i18n.js', import.meta.url), 'utf8');
  const codes = [...src.matchAll(/code: '(\w+)', speech: '([\w-]+)'/g)];
  assert.equal(codes.length, 10);
  for (const [, code, locale] of codes) assert.equal(speech.VOICES[code]?.locale, locale, code);
});
