/* Voice: speech-to-text and text-to-speech through the server's Azure AI Speech endpoints.
   If Azure is not configured (or a call fails) it falls back to the browser's own speech features. */
(() => {
'use strict';

let azure = false;
const ready = fetch('/api/status').then(r => r.json()).then(s => { azure = !!s.speech_configured; }).catch(() => {});

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const canRecord = !!(navigator.mediaDevices?.getUserMedia && window.MediaRecorder);

/* ---------- speaking ---------- */
let audio = null, audioUrl = null, gen = 0, browserUtter = null, release = null;

function stop() {
  gen++;
  if (release) { release(); release = null; }   // let a pending speak() finish
  if (audio) { audio.pause(); audio = null; }
  if (audioUrl) { URL.revokeObjectURL(audioUrl); audioUrl = null; }
  if (window.speechSynthesis) try { speechSynthesis.cancel(); } catch (_) {}
  browserUtter = null;
}
const isSpeaking = () => !!audio || !!browserUtter;

function browserSpeak(text, locale) {
  return new Promise(resolve => {
    if (!window.speechSynthesis) return resolve();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = locale; u.onend = u.onerror = () => { if (browserUtter === u) browserUtter = null; resolve(); };
    browserUtter = u; speechSynthesis.speak(u);
  });
}

/** Speak text in the given UI language code ('pa', 'hi', ...). Resolves when finished or stopped. */
async function speak(text, code, locale) {
  stop();
  const my = gen;
  text = (text || '').trim();
  if (!text) return;
  await ready;
  if (azure) {
    try {
      const r = await fetch('/api/speech/tts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: text.slice(0, 3000), lang: code }) });
      if (!r.ok) throw new Error('tts ' + r.status);
      const blob = await r.blob();
      if (my !== gen) return;                      // stopped or replaced while downloading
      audioUrl = URL.createObjectURL(blob);
      const a = audio = new Audio(audioUrl);
      await new Promise((resolve, reject) => { release = resolve; a.onended = resolve; a.onerror = reject; a.play().catch(reject); });
      if (my === gen) stop();
      return;
    } catch (_) {
      if (my !== gen) return;
      stop(); gen = my;                            // fall through to the browser voice
    }
  }
  await browserSpeak(text, locale);
}

/* ---------- listening ---------- */
function encodeWav(samples, rate) {
  const buf = new ArrayBuffer(44 + samples.length * 2), v = new DataView(buf);
  const str = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  str(0, 'RIFF'); v.setUint32(4, 36 + samples.length * 2, true); str(8, 'WAVEfmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  str(36, 'data'); v.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, samples[i])) * 0x7fff, true);
  return new Blob([buf], { type: 'audio/wav' });
}

/** Any recorded format -> 16 kHz mono 16-bit WAV (what Azure's REST speech-to-text expects), capped at 60 s. */
async function toWav(blob) {
  const ac = new (window.AudioContext || window.webkitAudioContext)();
  let decoded;
  try { decoded = await ac.decodeAudioData(await blob.arrayBuffer()); } finally { ac.close(); }
  const off = new OfflineAudioContext(1, Math.max(1, Math.ceil(decoded.duration * 16000)), 16000);
  const src = off.createBufferSource(); src.buffer = decoded; src.connect(off.destination); src.start();
  const out = await off.startRendering();
  return encodeWav(out.getChannelData(0).subarray(0, 60 * 16000), 16000);
}

/** Start recording from the microphone. Returns { stop() -> Promise<Blob wav> }. */
async function record(onAutoStop) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true } });
  const rec = new MediaRecorder(stream), chunks = [];
  rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
  const done = new Promise(resolve => { rec.onstop = () => { stream.getTracks().forEach(t => t.stop()); resolve(new Blob(chunks, { type: rec.mimeType })); }; });
  rec.start();
  const timer = setTimeout(() => { if (rec.state !== 'inactive') { rec.stop(); onAutoStop?.(); } }, 55_000);
  return { stop() { clearTimeout(timer); if (rec.state !== 'inactive') rec.stop(); return done.then(toWav); } };
}

/** Send a WAV to the server for Azure speech-to-text. */
async function transcribe(wav, code, token) {
  const r = await fetch('/api/speech/stt?lang=' + encodeURIComponent(code), { method: 'POST', headers: { 'Content-Type': 'audio/wav', Authorization: 'Bearer ' + token }, body: wav });
  if (!r.ok) {
    let msg = 'Voice recognition failed. Please try again or type instead.';
    try { const d = await r.json(); if (typeof d.detail === 'string') msg = d.detail; } catch (_) {}
    throw new Error(msg);
  }
  return (await r.json()).text || '';
}

window.Voice = {
  ready, speak, stop, isSpeaking, record, transcribe,
  azure: () => azure,
  canListen: () => (azure && canRecord) || !!SR,
  browserRecognition: () => SR,
};
})();
