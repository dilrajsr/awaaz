/* Awaaz interface languages. English is the fallback for any key a language does not have yet.
   Have native speakers review these translations before launch. */
(() => {
'use strict';

const LANGS = [
  { code: 'hi', speech: 'hi-IN', name: 'Hindi', native: 'हिन्दी' },
  { code: 'pa', speech: 'pa-IN', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'en', speech: 'en-IN', name: 'English', native: 'English' },
  { code: 'ta', speech: 'ta-IN', name: 'Tamil', native: 'தமிழ்' },
  { code: 'bn', speech: 'bn-IN', name: 'Bengali', native: 'বাংলা' },
  { code: 'mr', speech: 'mr-IN', name: 'Marathi', native: 'मराठी' },
  { code: 'te', speech: 'te-IN', name: 'Telugu', native: 'తెలుగు' },
  { code: 'gu', speech: 'gu-IN', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'kn', speech: 'kn-IN', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', speech: 'ml-IN', name: 'Malayalam', native: 'മലയാളം' },
];

const S = {
  en: {
    nav_how: 'How it works', nav_assistant: 'Assistant', nav_saved: 'My saved', nav_trust: 'Trust', login: 'Log in', logout: 'Log out',
    hero_eyebrow: 'AI assistant for citizens of India', hero_h1a: 'Speak your problem.', hero_h1b: 'We prepare the complaint.',
    hero_lead: 'Describe the issue by voice or text in your own language. Awaaz finds the right department and portal on official government sites, writes a formal complaint, and tells you exactly how to submit it.',
    cta_speak: 'Tap to speak', cta_type: 'Type instead', cta_how: 'See how it works',
    how_h: 'Four simple steps.', s1_h: 'You speak or type', s1_p: 'Use the microphone or keyboard, or tap a common problem.',
    s2_h: 'Awaaz asks questions', s2_p: 'If something is missing, it asks short questions.',
    s3_h: 'It checks official sites', s3_p: 'It reads government websites to find the right department and portal.',
    s4_h: 'You get a ready complaint', s4_p: 'A formal letter and the steps to submit it. You submit it yourself.',
    asm_eyebrow: 'Assistant', asm_h: 'Tell us what happened.', common_h: 'Common problems',
    g1: 'No water', g2: 'Wrong electricity bill', g3: 'Online fraud', g4: 'Police not listening', g5: 'Defective product / refund', g6: 'Bad road / garbage', g7: 'PF or salary not paid', g8: 'Bank or insurance problem',
    greet: 'Namaste. Tell me your problem — what happened, where, and when. You can press the microphone and speak. Please do not type Aadhaar, PAN or bank numbers.',
    ph_msg: 'Type or speak your problem…', send: 'Send', researching: 'Researching official sources…',
    result_h: 'Your complaint', result_empty: 'Your department, portal, steps and formal draft will appear here.', not_submitted: 'Draft — NOT submitted',
    r_dept: 'Department', r_where: 'Where to file', r_online: 'Submit online', r_offline: 'Submit offline', r_docs: 'Documents to keep ready', r_letter: 'Formal complaint', r_recheck: 'Please recheck', r_sources: 'Sources',
    b_save: 'Save draft', b_copy: 'Copy', b_print: 'Print / save as PDF', b_wa: 'Share on WhatsApp', b_read: 'Read steps aloud', b_stop: 'Stop reading',
    fb_q: 'Is this the right department?', yes: 'Yes', no: 'No', thanks: 'Thank you.',
    saved_h: 'Come back anytime.', saved_gate: 'Log in to save your details, drafts, documents and follow-ups.',
    p_details: 'My details', p_drafts: 'Complaints & follow-ups', p_docs: 'Documents', p_watch: 'Watched official pages', p_data: 'Your data',
    trust_h: 'Honest by design.', t1_h: 'Never pretends to submit', t1_p: 'Awaaz prepares. You file. Every draft says "Not submitted" until you mark it yourself.',
    t2_h: 'Official sources only', t2_p: 'Only government websites are read. Anything not confirmed is flagged for rechecking.',
    t3_h: 'Your data stays yours', t3_p: 'Personal details are encrypted and you can delete everything at any time.',
    auth_login: 'Log in to Awaaz', auth_reg: 'Create your Awaaz account', tab_pw: 'Password', tab_sms: 'SMS code', tab_new: 'New account',
    ph_id: 'Mobile number or email', ph_pw: 'Password (8+ characters)', continue: 'Continue', cancel: 'Cancel', consent: 'I agree to the privacy terms.',
    emerg_title: 'If you or someone is in danger, call now:', emerg_not: 'This is not an emergency — continue',
    st_draft: 'Not submitted', st_submitted: 'Submitted by me', st_awaiting: 'Awaiting reply', st_resolved: 'Resolved',
    f_note: 'Awaaz is not a government service and does not file complaints for you. Drafts may contain mistakes — please read them before sending.',
    gate_skip: 'Close',
  },
  hi: {
    nav_how: 'कैसे काम करता है', nav_assistant: 'सहायक', nav_saved: 'मेरा सहेजा', nav_trust: 'भरोसा', login: 'लॉग इन', logout: 'लॉग आउट',
    hero_eyebrow: 'भारत के नागरिकों के लिए AI सहायक', hero_h1a: 'अपनी समस्या बोलिए।', hero_h1b: 'शिकायत हम तैयार करेंगे।',
    hero_lead: 'अपनी भाषा में आवाज़ या लिखकर समस्या बताइए। आवाज़ सरकारी वेबसाइटों से सही विभाग और पोर्टल ढूँढती है, औपचारिक शिकायत लिखती है और बताती है कि उसे कैसे जमा करें।',
    cta_speak: 'बोलने के लिए दबाएँ', cta_type: 'लिखकर बताएँ', cta_how: 'यह कैसे काम करता है',
    how_h: 'चार आसान कदम।', s1_h: 'आप बोलें या लिखें', s1_p: 'माइक्रोफ़ोन या कीबोर्ड इस्तेमाल करें, या कोई आम समस्या चुनें।',
    s2_h: 'आवाज़ सवाल पूछती है', s2_p: 'कुछ कम हो तो छोटे सवाल पूछती है।',
    s3_h: 'सरकारी साइटों से जाँच', s3_p: 'सरकारी वेबसाइट पढ़कर सही विभाग और पोर्टल ढूँढती है।',
    s4_h: 'तैयार शिकायत पाएँ', s4_p: 'औपचारिक पत्र और जमा करने के तरीके। जमा आप खुद करेंगे।',
    asm_eyebrow: 'सहायक', asm_h: 'बताइए क्या हुआ।', common_h: 'आम समस्याएँ',
    g1: 'पानी नहीं आ रहा', g2: 'बिजली का गलत बिल', g3: 'ऑनलाइन ठगी', g4: 'पुलिस नहीं सुन रही', g5: 'खराब सामान / रिफंड', g6: 'खराब सड़क / कचरा', g7: 'पीएफ या वेतन नहीं मिला', g8: 'बैंक या बीमा की समस्या',
    greet: 'नमस्ते। अपनी समस्या बताइए — क्या हुआ, कहाँ और कब। आप माइक्रोफ़ोन दबाकर बोल सकते हैं। कृपया आधार, पैन या बैंक नंबर न लिखें।',
    ph_msg: 'अपनी समस्या लिखें या बोलें…', send: 'भेजें', researching: 'सरकारी स्रोतों में खोज रहे हैं…',
    result_h: 'आपकी शिकायत', result_empty: 'विभाग, पोर्टल, कदम और औपचारिक मसौदा यहाँ दिखेगा।', not_submitted: 'मसौदा — जमा नहीं हुआ',
    r_dept: 'विभाग', r_where: 'कहाँ शिकायत करें', r_online: 'ऑनलाइन जमा करें', r_offline: 'ऑफ़लाइन जमा करें', r_docs: 'ये कागज़ तैयार रखें', r_letter: 'औपचारिक शिकायत', r_recheck: 'कृपया दोबारा जाँचें', r_sources: 'स्रोत',
    b_save: 'मसौदा सहेजें', b_copy: 'कॉपी', b_print: 'प्रिंट / PDF', b_wa: 'WhatsApp पर भेजें', b_read: 'कदम सुनें', b_stop: 'रोकें',
    fb_q: 'क्या यह सही विभाग है?', yes: 'हाँ', no: 'नहीं', thanks: 'धन्यवाद।',
    saved_h: 'कभी भी वापस आइए।', saved_gate: 'अपनी जानकारी, मसौदे और दस्तावेज़ सहेजने के लिए लॉग इन करें।',
    p_details: 'मेरी जानकारी', p_drafts: 'शिकायतें और फ़ॉलो-अप', p_docs: 'दस्तावेज़', p_watch: 'निगरानी वाले सरकारी पेज', p_data: 'आपका डेटा',
    trust_h: 'ईमानदारी से बना।', t1_h: 'खुद जमा नहीं करता', t1_p: 'आवाज़ सिर्फ तैयारी करती है। जमा आप करते हैं।',
    t2_h: 'सिर्फ सरकारी स्रोत', t2_p: 'सिर्फ सरकारी वेबसाइटें पढ़ी जाती हैं। जो पक्का नहीं, उसकी चेतावनी दी जाती है।',
    t3_h: 'आपका डेटा आपका', t3_p: 'निजी जानकारी एन्क्रिप्ट रहती है और आप कभी भी सब कुछ मिटा सकते हैं।',
    auth_login: 'आवाज़ में लॉग इन करें', auth_reg: 'नया खाता बनाएँ', tab_pw: 'पासवर्ड', tab_sms: 'SMS कोड', tab_new: 'नया खाता',
    ph_id: 'मोबाइल नंबर या ईमेल', ph_pw: 'पासवर्ड (8+ अक्षर)', continue: 'आगे बढ़ें', cancel: 'रद्द करें', consent: 'मैं गोपनीयता शर्तों से सहमत हूँ।',
    emerg_title: 'अगर आप या कोई खतरे में है तो अभी कॉल करें:', emerg_not: 'यह आपातकाल नहीं है — आगे बढ़ें',
    st_draft: 'जमा नहीं हुआ', st_submitted: 'मैंने जमा किया', st_awaiting: 'जवाब का इंतज़ार', st_resolved: 'हल हो गया',
    f_note: 'आवाज़ सरकारी सेवा नहीं है और आपकी ओर से शिकायत जमा नहीं करती। मसौदे में गलतियाँ हो सकती हैं — भेजने से पहले पढ़ लें।',
    gate_skip: 'बंद करें',
  },
  pa: {
    nav_how: 'ਇਹ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ', nav_assistant: 'ਸਹਾਇਕ', nav_saved: 'ਮੇਰਾ ਸੰਭਾਲਿਆ', nav_trust: 'ਭਰੋਸਾ', login: 'ਲੌਗ ਇਨ', logout: 'ਲੌਗ ਆਊਟ',
    hero_eyebrow: 'ਭਾਰਤ ਦੇ ਨਾਗਰਿਕਾਂ ਲਈ AI ਸਹਾਇਕ', hero_h1a: 'ਆਪਣੀ ਸਮੱਸਿਆ ਬੋਲੋ।', hero_h1b: 'ਸ਼ਿਕਾਇਤ ਅਸੀਂ ਤਿਆਰ ਕਰਾਂਗੇ।',
    hero_lead: 'ਆਪਣੀ ਭਾਸ਼ਾ ਵਿੱਚ ਆਵਾਜ਼ ਜਾਂ ਲਿਖ ਕੇ ਸਮੱਸਿਆ ਦੱਸੋ। ਆਵਾਜ਼ ਸਰਕਾਰੀ ਵੈੱਬਸਾਈਟਾਂ ਤੋਂ ਸਹੀ ਵਿਭਾਗ ਅਤੇ ਪੋਰਟਲ ਲੱਭਦੀ ਹੈ, ਰਸਮੀ ਸ਼ਿਕਾਇਤ ਲਿਖਦੀ ਹੈ ਅਤੇ ਦੱਸਦੀ ਹੈ ਕਿ ਇਸਨੂੰ ਕਿਵੇਂ ਜਮ੍ਹਾ ਕਰਨਾ ਹੈ।',
    cta_speak: 'ਬੋਲਣ ਲਈ ਦਬਾਓ', cta_type: 'ਲਿਖ ਕੇ ਦੱਸੋ', cta_how: 'ਇਹ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ',
    how_h: 'ਚਾਰ ਸੌਖੇ ਕਦਮ।', s1_h: 'ਤੁਸੀਂ ਬੋਲੋ ਜਾਂ ਲਿਖੋ', s1_p: 'ਮਾਈਕ੍ਰੋਫ਼ੋਨ ਜਾਂ ਕੀਬੋਰਡ ਵਰਤੋ, ਜਾਂ ਕੋਈ ਆਮ ਸਮੱਸਿਆ ਚੁਣੋ।',
    s2_h: 'ਆਵਾਜ਼ ਸਵਾਲ ਪੁੱਛਦੀ ਹੈ', s2_p: 'ਕੁਝ ਘੱਟ ਹੋਵੇ ਤਾਂ ਛੋਟੇ ਸਵਾਲ ਪੁੱਛਦੀ ਹੈ।',
    s3_h: 'ਸਰਕਾਰੀ ਸਾਈਟਾਂ ਤੋਂ ਜਾਂਚ', s3_p: 'ਸਰਕਾਰੀ ਵੈੱਬਸਾਈਟਾਂ ਪੜ੍ਹ ਕੇ ਸਹੀ ਵਿਭਾਗ ਅਤੇ ਪੋਰਟਲ ਲੱਭਦੀ ਹੈ।',
    s4_h: 'ਤਿਆਰ ਸ਼ਿਕਾਇਤ ਲਓ', s4_p: 'ਰਸਮੀ ਚਿੱਠੀ ਅਤੇ ਜਮ੍ਹਾ ਕਰਨ ਦੇ ਤਰੀਕੇ। ਜਮ੍ਹਾ ਤੁਸੀਂ ਆਪ ਕਰੋਗੇ।',
    asm_eyebrow: 'ਸਹਾਇਕ', asm_h: 'ਦੱਸੋ ਕੀ ਹੋਇਆ।', common_h: 'ਆਮ ਸਮੱਸਿਆਵਾਂ',
    g1: 'ਪਾਣੀ ਨਹੀਂ ਆ ਰਿਹਾ', g2: 'ਬਿਜਲੀ ਦਾ ਗਲਤ ਬਿੱਲ', g3: 'ਆਨਲਾਈਨ ਠੱਗੀ', g4: 'ਪੁਲਿਸ ਨਹੀਂ ਸੁਣ ਰਹੀ', g5: 'ਖਰਾਬ ਸਮਾਨ / ਰਿਫੰਡ', g6: 'ਖਰਾਬ ਸੜਕ / ਕੂੜਾ', g7: 'ਪੀਐਫ ਜਾਂ ਤਨਖਾਹ ਨਹੀਂ ਮਿਲੀ', g8: 'ਬੈਂਕ ਜਾਂ ਬੀਮੇ ਦੀ ਸਮੱਸਿਆ',
    greet: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ। ਆਪਣੀ ਸਮੱਸਿਆ ਦੱਸੋ — ਕੀ ਹੋਇਆ, ਕਿੱਥੇ ਅਤੇ ਕਦੋਂ। ਤੁਸੀਂ ਮਾਈਕ੍ਰੋਫ਼ੋਨ ਦਬਾ ਕੇ ਬੋਲ ਸਕਦੇ ਹੋ। ਕਿਰਪਾ ਕਰਕੇ ਆਧਾਰ, ਪੈਨ ਜਾਂ ਬੈਂਕ ਨੰਬਰ ਨਾ ਲਿਖੋ।',
    ph_msg: 'ਆਪਣੀ ਸਮੱਸਿਆ ਲਿਖੋ ਜਾਂ ਬੋਲੋ…', send: 'ਭੇਜੋ', researching: 'ਸਰਕਾਰੀ ਸਰੋਤਾਂ ਵਿੱਚ ਲੱਭ ਰਹੇ ਹਾਂ…',
    result_h: 'ਤੁਹਾਡੀ ਸ਼ਿਕਾਇਤ', result_empty: 'ਵਿਭਾਗ, ਪੋਰਟਲ, ਕਦਮ ਅਤੇ ਰਸਮੀ ਖਰੜਾ ਇੱਥੇ ਦਿਖਾਈ ਦੇਵੇਗਾ।', not_submitted: 'ਖਰੜਾ — ਜਮ੍ਹਾ ਨਹੀਂ ਹੋਇਆ',
    r_dept: 'ਵਿਭਾਗ', r_where: 'ਕਿੱਥੇ ਸ਼ਿਕਾਇਤ ਕਰਨੀ ਹੈ', r_online: 'ਆਨਲਾਈਨ ਜਮ੍ਹਾ ਕਰੋ', r_offline: 'ਆਫ਼ਲਾਈਨ ਜਮ੍ਹਾ ਕਰੋ', r_docs: 'ਇਹ ਕਾਗਜ਼ ਤਿਆਰ ਰੱਖੋ', r_letter: 'ਰਸਮੀ ਸ਼ਿਕਾਇਤ', r_recheck: 'ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਜਾਂਚੋ', r_sources: 'ਸਰੋਤ',
    b_save: 'ਖਰੜਾ ਸੰਭਾਲੋ', b_copy: 'ਕਾਪੀ', b_print: 'ਪ੍ਰਿੰਟ / PDF', b_wa: 'WhatsApp ਤੇ ਭੇਜੋ', b_read: 'ਕਦਮ ਸੁਣੋ', b_stop: 'ਰੋਕੋ',
    fb_q: 'ਕੀ ਇਹ ਸਹੀ ਵਿਭਾਗ ਹੈ?', yes: 'ਹਾਂ', no: 'ਨਹੀਂ', thanks: 'ਧੰਨਵਾਦ।',
    saved_h: 'ਕਦੇ ਵੀ ਵਾਪਸ ਆਓ।', saved_gate: 'ਆਪਣੀ ਜਾਣਕਾਰੀ, ਖਰੜੇ ਅਤੇ ਦਸਤਾਵੇਜ਼ ਸੰਭਾਲਣ ਲਈ ਲੌਗ ਇਨ ਕਰੋ।',
    p_details: 'ਮੇਰੀ ਜਾਣਕਾਰੀ', p_drafts: 'ਸ਼ਿਕਾਇਤਾਂ ਅਤੇ ਫ਼ਾਲੋ-ਅੱਪ', p_docs: 'ਦਸਤਾਵੇਜ਼', p_watch: 'ਨਿਗਰਾਨੀ ਵਾਲੇ ਸਰਕਾਰੀ ਪੰਨੇ', p_data: 'ਤੁਹਾਡਾ ਡੇਟਾ',
    trust_h: 'ਇਮਾਨਦਾਰੀ ਨਾਲ ਬਣਿਆ।', t1_h: 'ਆਪ ਜਮ੍ਹਾ ਨਹੀਂ ਕਰਦਾ', t1_p: 'ਆਵਾਜ਼ ਸਿਰਫ਼ ਤਿਆਰੀ ਕਰਦੀ ਹੈ। ਜਮ੍ਹਾ ਤੁਸੀਂ ਕਰਦੇ ਹੋ।',
    t2_h: 'ਸਿਰਫ਼ ਸਰਕਾਰੀ ਸਰੋਤ', t2_p: 'ਸਿਰਫ਼ ਸਰਕਾਰੀ ਵੈੱਬਸਾਈਟਾਂ ਪੜ੍ਹੀਆਂ ਜਾਂਦੀਆਂ ਹਨ। ਜੋ ਪੱਕਾ ਨਹੀਂ, ਉਸਦੀ ਚੇਤਾਵਨੀ ਦਿੱਤੀ ਜਾਂਦੀ ਹੈ।',
    t3_h: 'ਤੁਹਾਡਾ ਡੇਟਾ ਤੁਹਾਡਾ', t3_p: 'ਨਿੱਜੀ ਜਾਣਕਾਰੀ ਇਨਕ੍ਰਿਪਟ ਰਹਿੰਦੀ ਹੈ ਅਤੇ ਤੁਸੀਂ ਕਦੇ ਵੀ ਸਭ ਕੁਝ ਮਿਟਾ ਸਕਦੇ ਹੋ।',
    auth_login: 'ਆਵਾਜ਼ ਵਿੱਚ ਲੌਗ ਇਨ ਕਰੋ', auth_reg: 'ਨਵਾਂ ਖਾਤਾ ਬਣਾਓ', tab_pw: 'ਪਾਸਵਰਡ', tab_sms: 'SMS ਕੋਡ', tab_new: 'ਨਵਾਂ ਖਾਤਾ',
    ph_id: 'ਮੋਬਾਈਲ ਨੰਬਰ ਜਾਂ ਈਮੇਲ', ph_pw: 'ਪਾਸਵਰਡ (8+ ਅੱਖਰ)', continue: 'ਅੱਗੇ ਵਧੋ', cancel: 'ਰੱਦ ਕਰੋ', consent: 'ਮੈਂ ਗੋਪਨੀਯਤਾ ਸ਼ਰਤਾਂ ਨਾਲ ਸਹਿਮਤ ਹਾਂ।',
    emerg_title: 'ਜੇ ਤੁਸੀਂ ਜਾਂ ਕੋਈ ਖ਼ਤਰੇ ਵਿੱਚ ਹੈ ਤਾਂ ਹੁਣੇ ਕਾਲ ਕਰੋ:', emerg_not: 'ਇਹ ਐਮਰਜੈਂਸੀ ਨਹੀਂ ਹੈ — ਅੱਗੇ ਵਧੋ',
    st_draft: 'ਜਮ੍ਹਾ ਨਹੀਂ ਹੋਇਆ', st_submitted: 'ਮੈਂ ਜਮ੍ਹਾ ਕੀਤਾ', st_awaiting: 'ਜਵਾਬ ਦੀ ਉਡੀਕ', st_resolved: 'ਹੱਲ ਹੋ ਗਿਆ',
    f_note: 'ਆਵਾਜ਼ ਸਰਕਾਰੀ ਸੇਵਾ ਨਹੀਂ ਹੈ ਅਤੇ ਤੁਹਾਡੀ ਥਾਂ ਸ਼ਿਕਾਇਤ ਜਮ੍ਹਾ ਨਹੀਂ ਕਰਦੀ। ਖਰੜੇ ਵਿੱਚ ਗਲਤੀਆਂ ਹੋ ਸਕਦੀਆਂ ਹਨ — ਭੇਜਣ ਤੋਂ ਪਹਿਲਾਂ ਪੜ੍ਹ ਲਓ।',
    gate_skip: 'ਬੰਦ ਕਰੋ',
  },
  ta: {
    nav_how: 'எப்படி செயல்படுகிறது', nav_assistant: 'உதவியாளர்', nav_saved: 'என் சேமிப்பு', nav_trust: 'நம்பிக்கை', login: 'உள்நுழை', logout: 'வெளியேறு',
    hero_h1a: 'உங்கள் பிரச்சினையைச் சொல்லுங்கள்.', hero_h1b: 'புகாரை நாங்கள் தயாரிப்போம்.',
    hero_lead: 'உங்கள் மொழியில் குரல் அல்லது எழுத்தில் பிரச்சினையைச் சொல்லுங்கள். அரசு இணையதளங்களிலிருந்து சரியான துறையையும் தளத்தையும் கண்டறிந்து, முறையான புகாரை எழுதி, அதை எப்படி சமர்ப்பிப்பது என்று சொல்லும்.',
    cta_speak: 'பேச தட்டவும்', cta_type: 'எழுதிச் சொல்லுங்கள்', cta_how: 'எப்படி செயல்படுகிறது',
    how_h: 'நான்கு எளிய படிகள்.', s1_h: 'நீங்கள் பேசுங்கள் அல்லது எழுதுங்கள்', s2_h: 'கேள்விகள் கேட்கும்', s3_h: 'அரசு தளங்களில் சரிபார்க்கும்', s4_h: 'தயாரான புகாரைப் பெறுங்கள்',
    asm_h: 'என்ன நடந்தது என்று சொல்லுங்கள்.', common_h: 'பொதுவான பிரச்சினைகள்',
    g1: 'தண்ணீர் வரவில்லை', g2: 'தவறான மின் கட்டணம்', g3: 'ஆன்லைன் மோசடி', g4: 'போலீஸ் கேட்கவில்லை', g5: 'பழுதான பொருள் / பணத்திரும்பப்பெறல்', g6: 'மோசமான சாலை / குப்பை', g7: 'PF அல்லது சம்பளம் வரவில்லை', g8: 'வங்கி அல்லது காப்பீட்டு பிரச்சினை',
    greet: 'வணக்கம். உங்கள் பிரச்சினையைச் சொல்லுங்கள் — என்ன நடந்தது, எங்கே, எப்போது. மைக்ரோஃபோனை அழுத்திப் பேசலாம். ஆதார், பான் அல்லது வங்கி எண்களை எழுத வேண்டாம்.',
    ph_msg: 'உங்கள் பிரச்சினையை எழுதுங்கள் அல்லது பேசுங்கள்…', send: 'அனுப்பு', researching: 'அரசு ஆதாரங்களில் தேடுகிறோம்…',
    result_h: 'உங்கள் புகார்', result_empty: 'துறை, தளம், படிகள் மற்றும் முறையான வரைவு இங்கே தோன்றும்.', not_submitted: 'வரைவு — சமர்ப்பிக்கப்படவில்லை',
    b_save: 'வரைவைச் சேமி', b_read: 'படிகளைக் கேளுங்கள்',
    emerg_title: 'நீங்கள் அல்லது யாராவது ஆபத்தில் இருந்தால் இப்போதே அழைக்கவும்:', emerg_not: 'இது அவசரநிலை அல்ல — தொடரவும்',
    saved_h: 'எப்போது வேண்டுமானாலும் திரும்பி வாருங்கள்.', saved_gate: 'உங்கள் விவரங்கள், வரைவுகள், ஆவணங்களைச் சேமிக்க உள்நுழையவும்.',
    tab_pw: 'கடவுச்சொல்', tab_sms: 'SMS குறியீடு', tab_new: 'புதிய கணக்கு', ph_id: 'மொபைல் எண் அல்லது மின்னஞ்சல்', ph_pw: 'கடவுச்சொல் (8+ எழுத்துகள்)', continue: 'தொடரவும்', cancel: 'ரத்து',
  },
  bn: {
    nav_how: 'কীভাবে কাজ করে', nav_assistant: 'সহায়ক', nav_saved: 'আমার সংরক্ষিত', nav_trust: 'বিশ্বাস', login: 'লগ ইন', logout: 'লগ আউট',
    hero_h1a: 'আপনার সমস্যা বলুন।', hero_h1b: 'অভিযোগ আমরা তৈরি করব।',
    hero_lead: 'নিজের ভাষায় কণ্ঠে বা লিখে সমস্যা জানান। সরকারি ওয়েবসাইট থেকে সঠিক বিভাগ ও পোর্টাল খুঁজে, আনুষ্ঠানিক অভিযোগ লিখে কীভাবে জমা দেবেন তা জানিয়ে দেবে।',
    cta_speak: 'বলতে চাপুন', cta_type: 'লিখে জানান', cta_how: 'কীভাবে কাজ করে',
    how_h: 'চারটি সহজ ধাপ।', s1_h: 'আপনি বলুন বা লিখুন', s2_h: 'প্রশ্ন করবে', s3_h: 'সরকারি সাইটে যাচাই করবে', s4_h: 'তৈরি অভিযোগ পান',
    asm_h: 'কী হয়েছে বলুন।', common_h: 'সাধারণ সমস্যা',
    g1: 'জল আসছে না', g2: 'ভুল বিদ্যুৎ বিল', g3: 'অনলাইন প্রতারণা', g4: 'পুলিশ শুনছে না', g5: 'ত্রুটিপূর্ণ জিনিস / রিফান্ড', g6: 'খারাপ রাস্তা / আবর্জনা', g7: 'পিএফ বা বেতন পাইনি', g8: 'ব্যাংক বা বিমার সমস্যা',
    greet: 'নমস্কার। আপনার সমস্যা বলুন — কী হয়েছে, কোথায়, কখন। মাইক্রোফোন চেপে বলতে পারেন। দয়া করে আধার, প্যান বা ব্যাংক নম্বর লিখবেন না।',
    ph_msg: 'আপনার সমস্যা লিখুন বা বলুন…', send: 'পাঠান', researching: 'সরকারি সূত্রে খোঁজা হচ্ছে…',
    result_h: 'আপনার অভিযোগ', result_empty: 'বিভাগ, পোর্টাল, ধাপ ও আনুষ্ঠানিক খসড়া এখানে দেখা যাবে।', not_submitted: 'খসড়া — জমা দেওয়া হয়নি',
    b_save: 'খসড়া সংরক্ষণ', b_read: 'ধাপগুলি শুনুন',
    emerg_title: 'আপনি বা কেউ বিপদে থাকলে এখনই ফোন করুন:', emerg_not: 'এটি জরুরি নয় — চালিয়ে যান',
    saved_h: 'যে কোনো সময় ফিরে আসুন।', saved_gate: 'আপনার তথ্য, খসড়া ও নথি সংরক্ষণ করতে লগ ইন করুন।',
    tab_pw: 'পাসওয়ার্ড', tab_sms: 'SMS কোড', tab_new: 'নতুন অ্যাকাউন্ট', ph_id: 'মোবাইল নম্বর বা ইমেল', ph_pw: 'পাসওয়ার্ড (৮+ অক্ষর)', continue: 'এগিয়ে যান', cancel: 'বাতিল',
  },
  mr: {
    nav_how: 'हे कसे काम करते', nav_assistant: 'सहाय्यक', nav_saved: 'माझे जतन', nav_trust: 'विश्वास', login: 'लॉग इन', logout: 'लॉग आउट',
    hero_h1a: 'तुमची समस्या सांगा.', hero_h1b: 'तक्रार आम्ही तयार करू.',
    hero_lead: 'तुमच्या भाषेत आवाजाने किंवा लिहून समस्या सांगा. सरकारी वेबसाइट्सवरून योग्य विभाग आणि पोर्टल शोधून, औपचारिक तक्रार लिहून ती कशी सादर करायची ते सांगेल.',
    cta_speak: 'बोलण्यासाठी दाबा', cta_type: 'लिहून सांगा', cta_how: 'हे कसे काम करते',
    how_h: 'चार सोपी पावले.', s1_h: 'तुम्ही बोला किंवा लिहा', s2_h: 'प्रश्न विचारते', s3_h: 'सरकारी साइट्सवर तपासते', s4_h: 'तयार तक्रार मिळवा',
    asm_h: 'काय झाले ते सांगा.', common_h: 'नेहमीच्या समस्या',
    g1: 'पाणी येत नाही', g2: 'चुकीचे वीजबिल', g3: 'ऑनलाइन फसवणूक', g4: 'पोलीस ऐकत नाहीत', g5: 'सदोष वस्तू / परतावा', g6: 'खराब रस्ता / कचरा', g7: 'पीएफ किंवा पगार मिळाला नाही', g8: 'बँक किंवा विम्याची समस्या',
    greet: 'नमस्कार. तुमची समस्या सांगा — काय झाले, कुठे आणि कधी. मायक्रोफोन दाबून बोलू शकता. कृपया आधार, पॅन किंवा बँक क्रमांक लिहू नका.',
    ph_msg: 'तुमची समस्या लिहा किंवा बोला…', send: 'पाठवा', researching: 'सरकारी स्रोतांमध्ये शोधत आहोत…',
    result_h: 'तुमची तक्रार', result_empty: 'विभाग, पोर्टल, पावले आणि औपचारिक मसुदा येथे दिसेल.', not_submitted: 'मसुदा — सादर केलेला नाही',
    b_save: 'मसुदा जतन करा', b_read: 'पावले ऐका',
    emerg_title: 'तुम्ही किंवा कोणी धोक्यात असल्यास आत्ताच फोन करा:', emerg_not: 'ही आणीबाणी नाही — पुढे चला',
    saved_h: 'केव्हाही परत या.', saved_gate: 'तुमची माहिती, मसुदे आणि कागदपत्रे जतन करण्यासाठी लॉग इन करा.',
    tab_pw: 'पासवर्ड', tab_sms: 'SMS कोड', tab_new: 'नवे खाते', ph_id: 'मोबाइल क्रमांक किंवा ईमेल', ph_pw: 'पासवर्ड (८+ अक्षरे)', continue: 'पुढे जा', cancel: 'रद्द करा',
  },
  te: {
    nav_how: 'ఇది ఎలా పనిచేస్తుంది', nav_assistant: 'సహాయకుడు', nav_saved: 'నా సేవ్ చేసినవి', nav_trust: 'నమ్మకం', login: 'లాగిన్', logout: 'లాగౌట్',
    hero_h1a: 'మీ సమస్యను చెప్పండి.', hero_h1b: 'ఫిర్యాదును మేము సిద్ధం చేస్తాం.',
    hero_lead: 'మీ భాషలో గొంతుతో లేదా రాసి సమస్యను చెప్పండి. ప్రభుత్వ వెబ్‌సైట్ల నుంచి సరైన శాఖ, పోర్టల్ కనుగొని, అధికారిక ఫిర్యాదు రాసి, దాన్ని ఎలా సమర్పించాలో చెబుతుంది.',
    cta_speak: 'మాట్లాడటానికి నొక్కండి', cta_type: 'రాసి చెప్పండి', cta_how: 'ఇది ఎలా పనిచేస్తుంది',
    how_h: 'నాలుగు సులభమైన దశలు.', s1_h: 'మీరు మాట్లాడండి లేదా రాయండి', s2_h: 'ప్రశ్నలు అడుగుతుంది', s3_h: 'ప్రభుత్వ సైట్లలో పరిశీలిస్తుంది', s4_h: 'సిద్ధమైన ఫిర్యాదు పొందండి',
    asm_h: 'ఏమి జరిగిందో చెప్పండి.', common_h: 'సాధారణ సమస్యలు',
    g1: 'నీళ్లు రావడం లేదు', g2: 'తప్పు కరెంట్ బిల్లు', g3: 'ఆన్‌లైన్ మోసం', g4: 'పోలీసులు వినడం లేదు', g5: 'లోపభూయిష్ట వస్తువు / రీఫండ్', g6: 'చెడు రోడ్డు / చెత్త', g7: 'PF లేదా జీతం రాలేదు', g8: 'బ్యాంక్ లేదా బీమా సమస్య',
    greet: 'నమస్కారం. మీ సమస్యను చెప్పండి — ఏమి జరిగింది, ఎక్కడ, ఎప్పుడు. మైక్రోఫోన్ నొక్కి మాట్లాడవచ్చు. దయచేసి ఆధార్, పాన్ లేదా బ్యాంక్ నంబర్లు రాయకండి.',
    ph_msg: 'మీ సమస్యను రాయండి లేదా చెప్పండి…', send: 'పంపండి', researching: 'ప్రభుత్వ వనరులలో వెతుకుతున్నాం…',
    result_h: 'మీ ఫిర్యాదు', result_empty: 'శాఖ, పోర్టల్, దశలు, అధికారిక ముసాయిదా ఇక్కడ కనిపిస్తాయి.', not_submitted: 'ముసాయిదా — సమర్పించలేదు',
    b_save: 'ముసాయిదా సేవ్ చేయండి', b_read: 'దశలను వినండి',
    emerg_title: 'మీరు లేదా ఎవరైనా ప్రమాదంలో ఉంటే ఇప్పుడే కాల్ చేయండి:', emerg_not: 'ఇది అత్యవసరం కాదు — కొనసాగండి',
    saved_h: 'ఎప్పుడైనా తిరిగి రండి.', saved_gate: 'మీ వివరాలు, ముసాయిదాలు, పత్రాలు సేవ్ చేయడానికి లాగిన్ చేయండి.',
    tab_pw: 'పాస్‌వర్డ్', tab_sms: 'SMS కోడ్', tab_new: 'కొత్త ఖాతా', ph_id: 'మొబైల్ నంబర్ లేదా ఇమెయిల్', ph_pw: 'పాస్‌వర్డ్ (8+ అక్షరాలు)', continue: 'కొనసాగండి', cancel: 'రద్దు',
  },
  gu: {
    nav_how: 'આ કેવી રીતે કામ કરે છે', nav_assistant: 'સહાયક', nav_saved: 'મારું સાચવેલું', nav_trust: 'ભરોસો', login: 'લૉગ ઇન', logout: 'લૉગ આઉટ',
    hero_h1a: 'તમારી સમસ્યા કહો.', hero_h1b: 'ફરિયાદ અમે તૈયાર કરીશું.',
    hero_lead: 'તમારી ભાષામાં અવાજથી અથવા લખીને સમસ્યા જણાવો. સરકારી વેબસાઇટ પરથી સાચો વિભાગ અને પોર્ટલ શોધી, ઔપચારિક ફરિયાદ લખીને તે કેવી રીતે જમા કરાવવી તે જણાવશે.',
    cta_speak: 'બોલવા માટે દબાવો', cta_type: 'લખીને જણાવો', cta_how: 'આ કેવી રીતે કામ કરે છે',
    how_h: 'ચાર સરળ પગલાં.', s1_h: 'તમે બોલો અથવા લખો', s2_h: 'પ્રશ્નો પૂછે છે', s3_h: 'સરકારી સાઇટ પર તપાસે છે', s4_h: 'તૈયાર ફરિયાદ મેળવો',
    asm_h: 'શું થયું તે કહો.', common_h: 'સામાન્ય સમસ્યાઓ',
    g1: 'પાણી આવતું નથી', g2: 'ખોટું વીજળી બિલ', g3: 'ઓનલાઇન છેતરપિંડી', g4: 'પોલીસ સાંભળતી નથી', g5: 'ખામીયુક્ત વસ્તુ / રિફંડ', g6: 'ખરાબ રસ્તો / કચરો', g7: 'પીએફ કે પગાર મળ્યો નથી', g8: 'બેંક કે વીમાની સમસ્યા',
    greet: 'નમસ્તે. તમારી સમસ્યા કહો — શું થયું, ક્યાં અને ક્યારે. માઇક્રોફોન દબાવીને બોલી શકો છો. કૃપા કરીને આધાર, પાન કે બેંક નંબર ન લખશો.',
    ph_msg: 'તમારી સમસ્યા લખો અથવા બોલો…', send: 'મોકલો', researching: 'સરકારી સ્ત્રોતોમાં શોધી રહ્યા છીએ…',
    result_h: 'તમારી ફરિયાદ', result_empty: 'વિભાગ, પોર્ટલ, પગલાં અને ઔપચારિક મુસદ્દો અહીં દેખાશે.', not_submitted: 'મુસદ્દો — જમા થયો નથી',
    b_save: 'મુસદ્દો સાચવો', b_read: 'પગલાં સાંભળો',
    emerg_title: 'તમે કે કોઈ જોખમમાં હોય તો હમણાં જ કૉલ કરો:', emerg_not: 'આ કટોકટી નથી — આગળ વધો',
    saved_h: 'ગમે ત્યારે પાછા આવો.', saved_gate: 'તમારી માહિતી, મુસદ્દા અને દસ્તાવેજો સાચવવા લૉગ ઇન કરો.',
    tab_pw: 'પાસવર્ડ', tab_sms: 'SMS કોડ', tab_new: 'નવું ખાતું', ph_id: 'મોબાઇલ નંબર અથવા ઇમેઇલ', ph_pw: 'પાસવર્ડ (8+ અક્ષર)', continue: 'આગળ વધો', cancel: 'રદ કરો',
  },
  kn: {
    nav_how: 'ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ', nav_assistant: 'ಸಹಾಯಕ', nav_saved: 'ನನ್ನ ಉಳಿಸಿದ್ದು', nav_trust: 'ನಂಬಿಕೆ', login: 'ಲಾಗಿನ್', logout: 'ಲಾಗ್ ಔಟ್',
    hero_h1a: 'ನಿಮ್ಮ ಸಮಸ್ಯೆ ಹೇಳಿ.', hero_h1b: 'ದೂರನ್ನು ನಾವು ಸಿದ್ಧಪಡಿಸುತ್ತೇವೆ.',
    hero_lead: 'ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಧ್ವನಿಯಿಂದ ಅಥವಾ ಬರೆದು ಸಮಸ್ಯೆ ತಿಳಿಸಿ. ಸರ್ಕಾರಿ ವೆಬ್‌ಸೈಟ್‌ಗಳಿಂದ ಸರಿಯಾದ ಇಲಾಖೆ ಮತ್ತು ಪೋರ್ಟಲ್ ಹುಡುಕಿ, ಔಪಚಾರಿಕ ದೂರು ಬರೆದು ಅದನ್ನು ಹೇಗೆ ಸಲ್ಲಿಸಬೇಕೆಂದು ತಿಳಿಸುತ್ತದೆ.',
    cta_speak: 'ಮಾತನಾಡಲು ಒತ್ತಿ', cta_type: 'ಬರೆದು ತಿಳಿಸಿ', cta_how: 'ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ',
    how_h: 'ನಾಲ್ಕು ಸುಲಭ ಹಂತಗಳು.', s1_h: 'ನೀವು ಮಾತನಾಡಿ ಅಥವಾ ಬರೆಯಿರಿ', s2_h: 'ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳುತ್ತದೆ', s3_h: 'ಸರ್ಕಾರಿ ಸೈಟ್‌ಗಳಲ್ಲಿ ಪರಿಶೀಲಿಸುತ್ತದೆ', s4_h: 'ಸಿದ್ಧ ದೂರು ಪಡೆಯಿರಿ',
    asm_h: 'ಏನಾಯಿತು ಎಂದು ಹೇಳಿ.', common_h: 'ಸಾಮಾನ್ಯ ಸಮಸ್ಯೆಗಳು',
    g1: 'ನೀರು ಬರುತ್ತಿಲ್ಲ', g2: 'ತಪ್ಪು ವಿದ್ಯುತ್ ಬಿಲ್', g3: 'ಆನ್‌ಲೈನ್ ವಂಚನೆ', g4: 'ಪೊಲೀಸರು ಕೇಳುತ್ತಿಲ್ಲ', g5: 'ದೋಷಯುಕ್ತ ವಸ್ತು / ಮರುಪಾವತಿ', g6: 'ಕೆಟ್ಟ ರಸ್ತೆ / ಕಸ', g7: 'PF ಅಥವಾ ಸಂಬಳ ಬಂದಿಲ್ಲ', g8: 'ಬ್ಯಾಂಕ್ ಅಥವಾ ವಿಮೆ ಸಮಸ್ಯೆ',
    greet: 'ನಮಸ್ಕಾರ. ನಿಮ್ಮ ಸಮಸ್ಯೆ ಹೇಳಿ — ಏನಾಯಿತು, ಎಲ್ಲಿ, ಯಾವಾಗ. ಮೈಕ್ರೊಫೋನ್ ಒತ್ತಿ ಮಾತನಾಡಬಹುದು. ದಯವಿಟ್ಟು ಆಧಾರ್, ಪ್ಯಾನ್ ಅಥವಾ ಬ್ಯಾಂಕ್ ಸಂಖ್ಯೆ ಬರೆಯಬೇಡಿ.',
    ph_msg: 'ನಿಮ್ಮ ಸಮಸ್ಯೆ ಬರೆಯಿರಿ ಅಥವಾ ಹೇಳಿ…', send: 'ಕಳುಹಿಸಿ', researching: 'ಸರ್ಕಾರಿ ಮೂಲಗಳಲ್ಲಿ ಹುಡುಕುತ್ತಿದ್ದೇವೆ…',
    result_h: 'ನಿಮ್ಮ ದೂರು', result_empty: 'ಇಲಾಖೆ, ಪೋರ್ಟಲ್, ಹಂತಗಳು ಮತ್ತು ಔಪಚಾರಿಕ ಕರಡು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ.', not_submitted: 'ಕರಡು — ಸಲ್ಲಿಸಿಲ್ಲ',
    b_save: 'ಕರಡು ಉಳಿಸಿ', b_read: 'ಹಂತಗಳನ್ನು ಕೇಳಿ',
    emerg_title: 'ನೀವು ಅಥವಾ ಯಾರಾದರೂ ಅಪಾಯದಲ್ಲಿದ್ದರೆ ಈಗಲೇ ಕರೆ ಮಾಡಿ:', emerg_not: 'ಇದು ತುರ್ತು ಪರಿಸ್ಥಿತಿ ಅಲ್ಲ — ಮುಂದುವರಿಸಿ',
    saved_h: 'ಯಾವಾಗ ಬೇಕಾದರೂ ಮರಳಿ ಬನ್ನಿ.', saved_gate: 'ನಿಮ್ಮ ವಿವರಗಳು, ಕರಡುಗಳು, ದಾಖಲೆಗಳನ್ನು ಉಳಿಸಲು ಲಾಗಿನ್ ಮಾಡಿ.',
    tab_pw: 'ಪಾಸ್‌ವರ್ಡ್', tab_sms: 'SMS ಕೋಡ್', tab_new: 'ಹೊಸ ಖಾತೆ', ph_id: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಅಥವಾ ಇಮೇಲ್', ph_pw: 'ಪಾಸ್‌ವರ್ಡ್ (8+ ಅಕ್ಷರಗಳು)', continue: 'ಮುಂದುವರಿಸಿ', cancel: 'ರದ್ದುಮಾಡಿ',
  },
  ml: {
    nav_how: 'ഇത് എങ്ങനെ പ്രവർത്തിക്കുന്നു', nav_assistant: 'സഹായി', nav_saved: 'എന്റെ സേവ് ചെയ്തവ', nav_trust: 'വിശ്വാസം', login: 'ലോഗിൻ', logout: 'ലോഗൗട്ട്',
    hero_h1a: 'നിങ്ങളുടെ പ്രശ്നം പറയൂ.', hero_h1b: 'പരാതി ഞങ്ങൾ തയ്യാറാക്കാം.',
    hero_lead: 'നിങ്ങളുടെ ഭാഷയിൽ ശബ്ദത്തിലൂടെയോ എഴുതിയോ പ്രശ്നം പറയൂ. സർക്കാർ വെബ്സൈറ്റുകളിൽ നിന്ന് ശരിയായ വകുപ്പും പോർട്ടലും കണ്ടെത്തി, ഔദ്യോഗിക പരാതി എഴുതി, അത് എങ്ങനെ സമർപ്പിക്കണമെന്ന് പറയും.',
    cta_speak: 'സംസാരിക്കാൻ അമർത്തൂ', cta_type: 'എഴുതി പറയൂ', cta_how: 'ഇത് എങ്ങനെ പ്രവർത്തിക്കുന്നു',
    how_h: 'നാല് എളുപ്പ ഘട്ടങ്ങൾ.', s1_h: 'നിങ്ങൾ സംസാരിക്കൂ അല്ലെങ്കിൽ എഴുതൂ', s2_h: 'ചോദ്യങ്ങൾ ചോദിക്കും', s3_h: 'സർക്കാർ സൈറ്റുകളിൽ പരിശോധിക്കും', s4_h: 'തയ്യാറായ പരാതി നേടൂ',
    asm_h: 'എന്താണ് സംഭവിച്ചതെന്ന് പറയൂ.', common_h: 'സാധാരണ പ്രശ്നങ്ങൾ',
    g1: 'വെള്ളം വരുന്നില്ല', g2: 'തെറ്റായ വൈദ്യുതി ബിൽ', g3: 'ഓൺലൈൻ തട്ടിപ്പ്', g4: 'പോലീസ് കേൾക്കുന്നില്ല', g5: 'തകരാറുള്ള സാധനം / റീഫണ്ട്', g6: 'മോശം റോഡ് / മാലിന്യം', g7: 'PF അല്ലെങ്കിൽ ശമ്പളം കിട്ടിയില്ല', g8: 'ബാങ്ക് അല്ലെങ്കിൽ ഇൻഷുറൻസ് പ്രശ്നം',
    greet: 'നമസ്കാരം. നിങ്ങളുടെ പ്രശ്നം പറയൂ — എന്ത് സംഭവിച്ചു, എവിടെ, എപ്പോൾ. മൈക്രോഫോൺ അമർത്തി സംസാരിക്കാം. ദയവായി ആധാർ, പാൻ, ബാങ്ക് നമ്പറുകൾ എഴുതരുത്.',
    ph_msg: 'നിങ്ങളുടെ പ്രശ്നം എഴുതൂ അല്ലെങ്കിൽ പറയൂ…', send: 'അയയ്ക്കൂ', researching: 'സർക്കാർ സ്രോതസ്സുകളിൽ തിരയുന്നു…',
    result_h: 'നിങ്ങളുടെ പരാതി', result_empty: 'വകുപ്പ്, പോർട്ടൽ, ഘട്ടങ്ങൾ, ഔദ്യോഗിക കരട് എന്നിവ ഇവിടെ കാണാം.', not_submitted: 'കരട് — സമർപ്പിച്ചിട്ടില്ല',
    b_save: 'കരട് സേവ് ചെയ്യൂ', b_read: 'ഘട്ടങ്ങൾ കേൾക്കൂ',
    emerg_title: 'നിങ്ങളോ മറ്റാരെങ്കിലുമോ അപകടത്തിലാണെങ്കിൽ ഉടൻ വിളിക്കൂ:', emerg_not: 'ഇത് അടിയന്തരാവസ്ഥയല്ല — തുടരൂ',
    saved_h: 'എപ്പോൾ വേണമെങ്കിലും തിരികെ വരൂ.', saved_gate: 'നിങ്ങളുടെ വിവരങ്ങൾ, കരടുകൾ, രേഖകൾ സേവ് ചെയ്യാൻ ലോഗിൻ ചെയ്യൂ.',
    tab_pw: 'പാസ്‌വേഡ്', tab_sms: 'SMS കോഡ്', tab_new: 'പുതിയ അക്കൗണ്ട്', ph_id: 'മൊബൈൽ നമ്പർ അല്ലെങ്കിൽ ഇമെയിൽ', ph_pw: 'പാസ്‌വേഡ് (8+ അക്ഷരങ്ങൾ)', continue: 'തുടരൂ', cancel: 'റദ്ദാക്കൂ',
  },
};

const KEY = 'awaaz-ui';
const read = () => { try { return localStorage.getItem(KEY); } catch (_) { return null; } };
const write = v => { try { localStorage.setItem(KEY, v); } catch (_) {} };
const listeners = [];
// A shared link such as /?lang=hi picks the language directly (handy for WhatsApp)
const fromUrl = new URLSearchParams(location.search).get('lang');
if (LANGS.some(l => l.code === fromUrl)) write(fromUrl);
let current = LANGS.some(l => l.code === read()) ? read() : 'en';
const hasChoice = () => LANGS.some(l => l.code === read());

function detect() {
  for (const tag of navigator.languages || [navigator.language || 'en']) {
    const c = String(tag).slice(0, 2).toLowerCase();
    if (LANGS.some(l => l.code === c)) return c;
  }
  return 'en';
}
const meta = () => LANGS.find(l => l.code === current);
const t = k => (S[current] && S[current][k]) || S.en[k] || k;

function apply() {
  const d = document;
  d.documentElement.lang = current;
  d.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
  d.querySelectorAll('[data-i18n-ph]').forEach(e => { e.placeholder = t(e.dataset.i18nPh); });
  d.querySelectorAll('[data-i18n-aria]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.i18nAria)); });
  d.querySelectorAll('[data-i18n-title]').forEach(e => { e.title = t(e.dataset.i18nTitle); });
  const nl = d.getElementById('navLangName');
  if (nl) nl.textContent = meta().native;
  d.querySelectorAll('.lchip').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.code === current)));
}

function setLang(code, remember = true) {
  if (!LANGS.some(l => l.code === code)) return;
  current = code;
  if (remember) write(code);
  apply();
  listeners.forEach(f => f(code));
  // headings are re-drawn in WebGL: wait for the new script's web font before rebuilding
  const redraw = () => window.AwaazGL && window.AwaazGL.rebuild && window.AwaazGL.rebuild();
  if (document.fonts) { document.fonts.load('600 40px "Noto Sans Devanagari"', 'अ').catch(() => {}); document.fonts.ready.then(redraw); }
  setTimeout(redraw, 800);
}

window.AwaazI18n = {
  LANGS, t, setLang, apply, detect, hasChoice,
  get code() { return current; },
  speechCode: () => meta().speech,
  name: () => meta().name,
  onChange: f => listeners.push(f),
  extend: (c, o) => Object.assign(S[c] || (S[c] = {}), o),
};
})();
