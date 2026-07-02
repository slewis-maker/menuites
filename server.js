const express = require('express');
const path = require('path');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

const VISION_KEY = process.env.GOOGLE_VISION_KEY || process.env.GOOGLE_API_KEY;
const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_KEY || process.env.GOOGLE_API_KEY;

const rateLimits = new Map();
function rateLimit(req, res, next) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const maxRequests = 30;
  const entry = rateLimits.get(ip) || { count: 0, resetAt: now + windowMs };
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }
  entry.count += 1;
  rateLimits.set(ip, entry);
  if (entry.count > maxRequests) {
    return res.status(429).json({ error: 'Rate limit exceeded. Try again in an hour.' });
  }
  next();
}

app.post('/api/vision', rateLimit, async (req, res) => {
  try {
    if (!VISION_KEY && !GEMINI_KEY) return res.status(500).json({ error: 'No API keys configured' });
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'imageBase64 required' });

    const response = await fetch(
      'https://vision.googleapis.com/v1/images:annotate?key=' + encodeURIComponent(VISION_KEY),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [{
            image: { content: imageBase64 },
            features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
            imageContext: { languageHints: ['en', 'it', 'fr', 'es', 'de', 'ja', 'zh'] },
          }],
        }),
      }
    );
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    res.json(data);
  } catch (err) {
    console.error('Vision error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/gemini', rateLimit, async (req, res) => {
  try {
    if (!VISION_KEY && !GEMINI_KEY) return res.status(500).json({ error: 'No API keys configured' });
    const { ocrText } = req.body;
    if (!ocrText) return res.status(400).json({ error: 'ocrText required' });

    const prompt = `Below is the raw OCR output from a restaurant menu. Extract each dish into a JSON array. For each dish include:
- name (string, in the original menu language, cleaned up — what the diner would say to the server)
- translated_name (literal English translation of the name; if already English, use the same value)
- description (short English context — what the dish actually is, ~1 sentence with notable prep style or cultural note; or null if unremarkable)
- section (starter/pasta/main/side/dessert/drink/other, best guess)
- ingredients (array of key ingredients in English)
- dietary_tags (array — pick from: vegetarian, vegan, gluten-free, contains-pork, contains-beef, contains-veal, contains-lamb, contains-fish, contains-shellfish, contains-dairy, contains-nuts, spicy, or add relevant tags)

Ignore obvious noise (page numbers, footer text, decorative fragments). Return ONLY valid JSON array. No markdown fences, no prose.

OCR:
${ocrText}`;

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + encodeURIComponent(GEMINI_KEY),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 4096,
            responseMimeType: 'application/json',
          },
        }),
      }
    );
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    res.json(data);
  } catch (err) {
    console.error('Gemini error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, visionKey: !!VISION_KEY, geminiKey: !!GEMINI_KEY });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Menuites server listening on port ' + PORT));
