import PDFDocument from 'pdfkit';
import { Response } from 'express';
import fs from 'fs'; // only for photo existence check

const formatDate = (date?: string | null) => {
  if (!date) return 'Present';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
};

const generatePdf = (resume: any, res: Response) => {
  const doc = new PDFDocument({ size: 'A4', margin: 0 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=${resume.personalInfo.name.replace(/\s+/g, '_')}_Resume.pdf`
  );

  doc.pipe(res);

  // ────────────────────────────────────────────────
  // We use ONLY built-in fonts → no registerFont calls
  // ────────────────────────────────────────────────
  const fonts = {
    regular: 'Helvetica',
    bold:    'Helvetica-Bold',
    italic:  'Helvetica-Oblique',
  };

  // Colors (same as before)
  const colors = {
    primary: '#0A3D62',
    accent:  '#00A896',
    dark:    '#1A1A1A',
    text:    '#2D2D2D',
    muted:   '#5F6B7A',
    light:   '#F7F9FC',
  };

  const margin = 48;
  const leftColumnWidth = 220;
  const rightColumnX = margin + leftColumnWidth + 36;
  const contentWidth = 595 - rightColumnX - margin;

  // ────────────────────────────────────────────────
  // LEFT SIDEBAR (dark background)
  // ────────────────────────────────────────────────
  doc.rect(0, 0, leftColumnWidth + margin, 842).fill(colors.primary);

  let y = margin;

  // Profile photo (circular)
  const photoSize = 110;
  const photoX = margin + (leftColumnWidth - photoSize) / 2;
  const photoY = y + 20;

  doc.circle(photoX + photoSize/2, photoY + photoSize/2, photoSize/2 + 4).fill(colors.light);

  if (resume.personalInfo.image && fs.existsSync(resume.personalInfo.image)) {
    doc
      .save()
      .circle(photoX + photoSize/2, photoY + photoSize/2, photoSize/2)
      .clip()
      .image(resume.personalInfo.image, photoX, photoY, { width: photoSize })
      .restore();
  } else {
    doc.fontSize(48).fillColor(colors.accent).text('MJ', photoX + 8, photoY + 30);
  }

  y = photoY + photoSize + 40;

  // Name
  doc
    .font(fonts.bold)
    .fontSize(22)
    .fillColor(colors.light)
    .text(resume.personalInfo.name.toUpperCase(), margin, y, {
      width: leftColumnWidth - margin * 2,
      align: 'center',
    });

  // Title
  y += 28;
  doc
    .font(fonts.regular)
    .fontSize(13)
    .fillColor(colors.accent)
    .text('Full Stack Engineer', margin, y, {
      width: leftColumnWidth - margin * 2,
      align: 'center',
    });

  y += 50;

  // Contact info
  doc.font(fonts.regular).fontSize(10).fillColor(colors.light);
  [
    `✉ ${resume.personalInfo.email}`,
    `☎ ${resume.personalInfo.phone}`,
    `📍 ${resume.personalInfo.presentAddress}`,
  ].forEach(line => {
    doc.text(line, margin + 12, y);
    y += 22;
  });

  y += 40;

  // Skills
  doc.font(fonts.bold).fontSize(13).fillColor(colors.accent).text('TECHNICAL SKILLS', margin + 12, y);
  y += 24;
  doc.font(fonts.regular).fontSize(10).fillColor(colors.light);
  resume.skills.forEach((s: string) => {
    doc.text(`• ${s}`, margin + 24, y);
    y += 18;
  });

  // (add Hobbies / License sections similarly if needed)

  // ────────────────────────────────────────────────
  // RIGHT COLUMN
  // ────────────────────────────────────────────────
  y = margin + 20;

  // Summary
  doc.font(fonts.bold).fontSize(14).fillColor(colors.primary).text('PROFESSIONAL SUMMARY', rightColumnX, y);
  y += 22;
  doc.moveTo(rightColumnX, y).lineTo(rightColumnX + contentWidth, y).lineWidth(2).strokeColor(colors.accent).stroke();
  y += 18;

  doc.font(fonts.regular).fontSize(10.5).fillColor(colors.text)
    .text(resume.personalInfo.aboutMe || '', rightColumnX, y, {
      width: contentWidth,
      lineGap: 5,
      align: 'justify',
    });
  y = doc.y + 36;

  // Experience – designation on one line, company + date on next
  doc.font(fonts.bold).fontSize(14).fillColor(colors.primary).text('PROFESSIONAL EXPERIENCE', rightColumnX, y);
  y += 22;
  doc.moveTo(rightColumnX, y).lineTo(rightColumnX + contentWidth, y).lineWidth(2).strokeColor(colors.accent).stroke();
  y += 18;

  resume.experiences.forEach((exp: any) => {
    // Designation
    doc.font(fonts.bold).fontSize(11.5).fillColor(colors.dark)
      .text(exp.designation, rightColumnX, y);

    y = doc.y + 4;

    // Company + dates (next line – left aligned, or change to align: 'right' if preferred)
    const dateLine = `${exp.company}  •  ${formatDate(exp.startDate)} – ${
      exp.isCurrentlyWorking ? 'Present' : formatDate(exp.endDate)
    }`;

    doc.font(fonts.regular).fontSize(10).fillColor(colors.muted)
      .text(dateLine, rightColumnX, y, { width: contentWidth });

    y = doc.y + 10;

    // Bullets
    const bullets = (exp.workDetails || '').split('.').filter((s: string) => s.trim().length > 3);
    doc.font(fonts.regular).fontSize(10).fillColor(colors.text);
    bullets.forEach((point: string) => {
      doc.text(`• ${point.trim()}`, rightColumnX + 10, y, {
        width: contentWidth - 10,
        lineGap: 4,
      });
      y = doc.y;
    });

    y += 28;
  });

  // Education (similar pattern – using Helvetica)

  doc.end();
};

export const pdfHelper = { generatePdf };