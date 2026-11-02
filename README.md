# Awaaz

Multilingual AI assistant that helps people in India prepare government complaints. It never submits anything for the user.

Stack: HTML/CSS/JavaScript (WebGL headings), Node.js + Express, SQLite (built-in `node:sqlite`), Google Gemini API (function-calling agent), Azure AI Speech (voice in and out), JWT auth.

## Run locally
Needs Node.js 22.13 or newer. No Docker, no Python.
```
npm install
copy .env.example .env      # then fill in GEMINI_API_KEY, AZURE_SPEECH_KEY and AZURE_SPEECH_REGION
npm start
```
Open http://127.0.0.1:8000. Or double-click `start.bat`. Run tests: `npm test`.

Without a Gemini key everything works except the assistant. Without an Azure Speech key the microphone and read-aloud fall back to the browser's own voice features (Chrome works best, Punjabi quality varies).

## Voice (Azure AI Speech)
Create a **Speech** resource in the Azure portal (the free F0 tier is enough to start) and put its key and region in `.env`. The key stays on the server: the browser sends a recording to `/api/speech/stt` and gets text back, and asks `/api/speech/tts` for audio. Tap the microphone, speak (for example in Punjabi), tap again, and the message is sent. The reply is then read back in the same language. All 10 languages use Azure neural voices (Punjabi: `pa-IN-VaaniNeural`); the voice map is in `server/speech.js`.

## Features
Voice/text in 10 languages with a first-visit language screen, guided problem buttons, follow-up questions, official-source research, formal draft with online/offline steps, read-aloud, print/PDF and WhatsApp share, login (password or SMS code), encrypted saved profile/drafts, document upload read by Gemini, Azure speech-to-text and text-to-speech in all 10 languages (speak in Punjabi, hear the reply in Punjabi), complaint tracking with timeline and 30-day follow-up reminders, escalation and RTI letter drafting, watched official pages with daily change detection, emergency numbers banner, PII stripping, data export and account deletion, accessibility options, installable PWA.

## Deploy
Any host that runs Node 22.13+ works (Azure App Service, a VM, Render, Railway...):
```
npm ci --omit=dev
HOST=0.0.0.0 PORT=8000 TRUST_PROXY=1 npm start
```
Persist the `data` folder (database, uploads, secrets) or point `AWAAZ_DATA_DIR` at a persistent disk, set the variables from `.env.example`, and serve over HTTPS (browsers only allow the microphone on HTTPS or localhost).

## Before launching to the public (things code cannot do)
1. **SMS OTP**: point `SMS_WEBHOOK_URL` to a real SMS provider bridge. Without it, OTP only prints to the server log.
2. **Routing data**: `server/routes.json` is seed data. A maintainer must confirm every portal URL/helpline and fill `last_verified`.
3. **Translations**: have native speakers review the interface text (`site/i18n.js`, `site/i18n-extra.js`) and the AI's output on real cases.
4. **Legal**: have the privacy page reviewed (DPDP Act 2023); add the data controller name and a contact address.
5. **Gemini free tier**: free-tier prompts may be used by Google to improve its products. Use a paid key before real users send personal complaints.
5b. **Azure Speech**: recordings are sent to Azure for recognition; mention this in the privacy page (done) and pick a region you are comfortable with. The free F0 tier has monthly limits.
6. **Scale**: SQLite and the in-memory rate limiter suit one instance. For several instances move to PostgreSQL and Redis.
7. **Monitoring**: ship logs somewhere and alert on 5xx errors.

The animated background is a fragment shader (pixel moon over noise, by Alexandr Korotaev) in `site/bg.js`, drawn at low resolution and frame rate so it stays light on phones. It is recoloured for dark and light themes.
