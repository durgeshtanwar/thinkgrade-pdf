# ThinkGrades PDF Service

Standalone Puppeteer PDF generation service.
Deployed on Railway. Called by ThinkGrades Next.js app.

## Local Setup

```bash
npm install
cp .env.example .env
# fill in .env values
npm run dev
```

## Test locally

```bash
curl -X POST http://localhost:3001/generate \
  -H "Content-Type: application/json" \
  -H "x-pdf-secret: your-secret" \
  -d '{"html": "<h1>Test</h1>", "options": {"filename": "test.pdf"}}'
```

## Environment Variables

- `PDF_SECRET` — shared secret with ThinkGrades app. Must match `PDF_SECRET` in ThinkGrades `.env.local`
- `ALLOWED_ORIGIN` — ThinkGrades Vercel URL
- `PORT` — Railway sets this automatically

## Endpoints

### POST /generate

- Body: `{ html: string, options?: object }`
- Headers: `x-pdf-secret` required
- Returns: PDF binary

Options:
| Field | Default | Description |
|---|---|---|
| format | A4 | Page format (A4, Letter, etc.) |
| landscape | false | Landscape orientation |
| filename | document.pdf | Output filename |
| marginTop | 0 | Top margin |
| marginBottom | 0 | Bottom margin |
| marginLeft | 0 | Left margin |
| marginRight | 0 | Right margin |

### GET /health

Returns: `{ status: 'ok', service: 'thinkgrades-pdf' }`

## Deployment on Railway

1. Push this repo to GitHub
2. New Project on railway.app → Deploy from GitHub
3. Add environment variables: `PDF_SECRET` and `ALLOWED_ORIGIN`
4. Settings → Networking → Generate Domain
5. Copy the domain URL to ThinkGrades `PDF_SERVICE_URL` env var
