import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

export const generatePdfFromHtml = async (
  html: string,
  fileName: string,
): Promise<string> => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  await page.setContent(html, {
    waitUntil: 'networkidle0',
  });

  const uploadDir = path.join(process.cwd(), 'uploads', 'documents');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, `${fileName}.pdf`);

  await page.pdf({
    path: filePath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20mm',
      bottom: '20mm',
      left: '15mm',
      right: '15mm',
    },
  });

  await browser.close();

  return filePath;
};
