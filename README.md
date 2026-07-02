# Menuites

Menu OCR + structuring spike. Node/Express server that serves a static HTML frontend and proxies Google Vision (OCR) and Gemini (structured extraction) API calls, keeping API keys server-side.

## Stack

- Node 18+ (uses global `fetch`)
- Express for the server
- Google Cloud Vision API (Document Text Detection)
- Gemini 2.5 Flash (structured JSON extraction)

## Environment variables

- `GOOGLE_API_KEY` — Google Cloud API key with Cloud Vision + Generative Language APIs enabled

## Local dev

```bash
npm install
GOOGLE_API_KEY=your_key_here npm start
# http://localhost:3000
```

## Deployment

Deploys to Railway from `main` branch. Set `GOOGLE_API_KEY` in Railway → Project → Variables.
Custom domain: `menuites.damnai.io` — CNAME to Railway-provided target.

## Rate limiting

30 requests per IP per hour. Rough guard against cost bombs while testing publicly.
