// Azure AI Speech over REST: speech-to-text and text-to-speech for the 10 supported languages.
// The key stays on the server; the browser only talks to /api/speech/*.
import { log } from './core.js';

// UI language code -> Azure locale and neural voice
export const VOICES = {
  hi: { locale: 'hi-IN', voice: 'hi-IN-SwaraNeural' },
  pa: { locale: 'pa-IN', voice: 'pa-IN-VaaniNeural' },
  en: { locale: 'en-IN', voice: 'en-IN-NeerjaNeural' },
  ta: { locale: 'ta-IN', voice: 'ta-IN-PallaviNeural' },
  bn: { locale: 'bn-IN', voice: 'bn-IN-TanishaaNeural' },
  mr: { locale: 'mr-IN', voice: 'mr-IN-AarohiNeural' },
  te: { locale: 'te-IN', voice: 'te-IN-ShrutiNeural' },
  gu: { locale: 'gu-IN', voice: 'gu-IN-DhwaniNeural' },
  kn: { locale: 'kn-IN', voice: 'kn-IN-SapnaNeural' },
  ml: { locale: 'ml-IN', voice: 'ml-IN-SobhanaNeural' },
};

export const MAX_TTS_CHARS = 3000;
const key = () => process.env.AZURE_SPEECH_KEY || '';
const region = () => process.env.AZURE_SPEECH_REGION || '';
export const speechConfigured = () => !!(key() && region());

export const knownLang = code => Object.hasOwn(VOICES, code);

/** Indirection so tests can swap the network call. */
export const deps = { fetch: (...a) => fetch(...a) };

const xmlEscape = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));

/** wav: 16 kHz 16-bit mono PCM WAV (max 60 s). Returns the recognised text, or '' if nothing was understood. */
export async function recognize(wav, lang) {
  const url = `https://${region()}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1`
    + `?language=${encodeURIComponent(VOICES[lang].locale)}&format=simple&profanity=raw`;
  const r = await deps.fetch(url, {
    method: 'POST',
    headers: { 'Ocp-Apim-Subscription-Key': key(), 'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000', Accept: 'application/json' },
    body: wav,
    signal: AbortSignal.timeout(30_000),
  });
  if (!r.ok) {
    log.error(`Azure STT error ${r.status}: ${(await r.text()).slice(0, 300)}`);
    throw new Error(`Azure STT returned ${r.status}`);
  }
  const out = await r.json();
  if (out.RecognitionStatus === 'Success') return (out.DisplayText || '').trim();
  if (out.RecognitionStatus === 'NoMatch' || out.RecognitionStatus === 'InitialSilenceTimeout') return '';
  throw new Error('Azure STT status ' + out.RecognitionStatus);
}

// Short phrases (the language greeting) repeat constantly, so keep their audio in memory.
const cache = new Map();

/** Returns an MP3 Buffer of the text spoken in the language's neural voice. */
export async function synthesize(text, lang) {
  text = text.slice(0, MAX_TTS_CHARS);
  const ck = lang + '|' + text;
  if (text.length <= 300 && cache.has(ck)) return cache.get(ck);
  const { locale, voice } = VOICES[lang];
  const ssml = `<speak version="1.0" xml:lang="${locale}"><voice name="${voice}"><prosody rate="-5%">${xmlEscape(text)}</prosody></voice></speak>`;
  const r = await deps.fetch(`https://${region()}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': key(), 'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3', 'User-Agent': 'awaaz',
    },
    body: ssml,
    signal: AbortSignal.timeout(30_000),
  });
  if (!r.ok) {
    log.error(`Azure TTS error ${r.status}: ${(await r.text()).slice(0, 300)}`);
    throw new Error(`Azure TTS returned ${r.status}`);
  }
  const mp3 = Buffer.from(await r.arrayBuffer());
  if (text.length <= 300) { if (cache.size >= 200) cache.delete(cache.keys().next().value); cache.set(ck, mp3); }
  return mp3;
}
