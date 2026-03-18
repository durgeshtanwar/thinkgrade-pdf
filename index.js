const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
app.use(express.json({ limit: "10mb" }));

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "thinkgrades-pdf" });
});

app.post("/generate", async (req, res) => {
  const secret = req.headers["x-pdf-secret"];
  if (secret !== process.env.PDF_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { html, options = {} } = req.body;

  if (!html) {
    return res.status(400).json({ error: "html is required" });
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--single-process",
      ],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: options.format || "A4",
      landscape: options.landscape || false,
      printBackground: true,
      margin: {
        top: options.marginTop || "10mm",
        bottom: options.marginBottom || "10mm",
        left: options.marginLeft || "10mm",
        right: options.marginRight || "10mm",
      },
    });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": pdf.length,
      "Content-Disposition": `attachment; filename="${options.filename || "document.pdf"}"`,
    });

    res.send(pdf);
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (browser) await browser.close();
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`ThinkGrades PDF service listening on port ${PORT}`);
});
