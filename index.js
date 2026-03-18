const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json({ limit: '10mb' }));

// Request logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'thinkgrades-pdf' });
});

// PDF generation endpoint
app.post('/generate', async (req, res) => {
  const secret = req.headers['x-pdf-secret'];
  const pdfSecret = process.env.PDF_SECRET;

  if (!pdfSecret || secret !== pdfSecret) {
    return res.status(401).json({ error: 'Unauthorized: invalid or missing x-pdf-secret header' });
  }

  const { html, options = {} } = req.body;

  if (!html) {
    return res.status(400).json({ error: 'Bad Request: html is required' });
  }

  const {
    format = 'A4',
    landscape = false,
    filename = 'document.pdf',
    marginTop = '0',
    marginBottom = '0',
    marginLeft = '0',
    marginRight = '0',
  } = options;

  let browser;
  try {
    browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format,
      landscape,
      printBackground: true,
      margin: {
        top: marginTop,
        bottom: marginBottom,
        left: marginLeft,
        right: marginRight,
      },
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdf.length);
    return res.end(pdf);
  } catch (err) {
    console.error('PDF generation error:', err.message);
    return res.status(500).json({ error: `PDF generation failed: ${err.message}` });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

app.listen(PORT, () => {
  console.log(`ThinkGrades PDF service listening on port ${PORT}`);
});
