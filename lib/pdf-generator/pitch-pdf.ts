import { PDFDocument, rgb, PDFPage } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';

interface PitchOptions {
  recipientName?: string;
  recipientOrganization?: string;
}

/**
 * Generate a symmetrical, modern 3-page pitch PDF for JT Football Physiotherapy
 */
export async function generatePitchPDF(options: PitchOptions = {}): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();

  const width = 612;
  const height = 792;
  const margin = 50;
  const contentWidth = width - 2 * margin;
  
  // Spacing constants
  const sectionGap = 22;
  const itemGap = 14;
  const padding = 14;

  const colors = {
    primary: rgb(41 / 255, 98 / 255, 179 / 255), // Professional blue
    primaryDark: rgb(25 / 255, 62 / 255, 120 / 255), // Darker blue
    accent: rgb(200 / 255, 200 / 255, 200 / 255), // Subtle gray accent
    dark: rgb(45 / 255, 45 / 255, 45 / 255), // Charcoal
    darkGray: rgb(80 / 255, 80 / 255, 80 / 255), // Text gray
    cream: rgb(245 / 255, 242 / 255, 237 / 255), // Warm cream/off-white
    lightGray: rgb(240 / 255, 240 / 255, 240 / 255), // Light background
    white: rgb(255 / 255, 255 / 255, 255 / 255), // Pure white
  };

  const helvetica = await pdfDoc.embedFont('Helvetica');
  const helveticaBold = await pdfDoc.embedFont('Helvetica-Bold');

  // ========== PAGE 1: HEADER & INTRO ==========
  let page = pdfDoc.addPage([width, height]);
  let yPos = height - margin;

  // Top accent stripe (full width)
  page.drawRectangle({
    x: 0,
    y: height - 6,
    width: width,
    height: 6,
    color: colors.primary,
  });

  yPos -= 14;

  // Logo and company name
  let logoWidth = 0;
  try {
    const logoPath = path.join(process.cwd(), 'public', 'jt-football-physio-logo.png');
    if (fs.existsSync(logoPath)) {
      const logoBytes = fs.readFileSync(logoPath);
      const logoImagePng = await pdfDoc.embedPng(Buffer.from(logoBytes));
      logoWidth = 50;
      const logoHeight = 50;
      page.drawImage(logoImagePng, {
        x: margin,
        y: yPos - logoHeight,
        width: logoWidth,
        height: logoHeight,
      });
    }
  } catch (e) {
    // Logo not available
  }

  // Company name next to logo
  page.drawText('JT FOOTBALL PHYSIOTHERAPY', {
    x: margin + logoWidth + 16,
    y: yPos - 16,
    size: 16,
    color: colors.primary,
    font: helveticaBold,
  });

  page.drawText('Elite Sports Medicine Specialist', {
    x: margin + logoWidth + 16,
    y: yPos - 32,
    size: 9,
    color: colors.darkGray,
    font: helvetica,
  });

  yPos -= 68;

  // Hero section - full width background
  page.drawRectangle({
    x: 0,
    y: yPos - 80,
    width: width,
    height: 80,
    color: colors.cream,
  });

  page.drawText('Professional Physiotherapy for Elite Football', {
    x: margin,
    y: yPos - 24,
    size: 14,
    color: colors.primary,
    font: helveticaBold,
  });

  const tagline = 'Expert injury assessment, rehabilitation, and performance coaching for professional football clubs';
  const taglineWrapped = wrapText(tagline, contentWidth, 8);
  let taglineY = yPos - 42;
  for (const line of taglineWrapped) {
    page.drawText(line, {
      x: margin,
      y: taglineY,
      size: 8,
      color: colors.darkGray,
      font: helvetica,
    });
    taglineY -= 11;
  }

  yPos -= 105;

  // Recipient info - if provided
  if (options.recipientName || options.recipientOrganization) {
    page.drawRectangle({
      x: margin,
      y: yPos - 50,
      width: contentWidth,
      height: 50,
      color: colors.cream,
    });

    page.drawRectangle({
      x: margin,
      y: yPos - 50,
      width: contentWidth,
      height: 3,
      color: colors.primary,
    });

    if (options.recipientName) {
      page.drawText(`To: ${options.recipientName}`, {
        x: margin + padding,
        y: yPos - 22,
        size: 10,
        color: colors.primary,
        font: helveticaBold,
      });
    }

    if (options.recipientOrganization) {
      page.drawText(options.recipientOrganization, {
        x: margin + padding,
        y: yPos - 36,
        size: 9,
        color: colors.darkGray,
        font: helvetica,
      });
    }

    yPos -= 68;
  }

  // About Jordan Section
  page.drawText('About Jordan Templeton', {
    x: margin,
    y: yPos,
    size: 12,
    color: colors.primary,
    font: helveticaBold,
  });

  page.drawText('MSc Physiotherapist & Elite Sports Medicine Specialist', {
    x: margin,
    y: yPos - 14,
    size: 8,
    color: colors.darkGray,
    font: helvetica,
  });

  yPos -= 26;

  // Jordan photo
  let photoWidth = 0;
  let photoHeight = 0;
  try {
    const photoPath = path.join(process.cwd(), 'public', 'jordan-templeton-jt-football-physiotherapy-kilmarnock-ayrshire-clinic.jpg');
    if (fs.existsSync(photoPath)) {
      const photoBytes = fs.readFileSync(photoPath);
      const photoImage = await pdfDoc.embedJpg(Buffer.from(photoBytes));
      photoWidth = 55;
      photoHeight = 120;
      page.drawImage(photoImage, {
        x: margin,
        y: yPos - photoHeight,
        width: photoWidth,
        height: photoHeight,
      });
    }
  } catch (e) {
    // Photo not available
  }

  const aboutText = '7+ years experience with Scottish professional football clubs. Combines clinical excellence with elite coaching expertise.';
  const aboutWrapped = wrapText(aboutText, contentWidth - photoWidth - 16, 8);
  let aboutY = yPos;
  for (const line of aboutWrapped) {
    page.drawText(line, {
      x: margin + photoWidth + 16,
      y: aboutY,
      size: 8,
      color: colors.darkGray,
      font: helvetica,
    });
    aboutY -= 10;
  }

  yPos -= photoHeight + 12;

  // Credentials
  const credentials = [
    'MSc Physiotherapy - Advanced evidence-based practice',
    'Kilmarnock FC - Medical Support Staff',
    'Kilmarnock FC Academy - Physiotherapy Lead (4+ yrs)',
    'Hearts of Midlothian FC - Professional experience',
  ];

  for (let i = 0; i < credentials.length; i++) {
    const bulletColor = i % 2 === 0 ? colors.primary : colors.primary;
    page.drawCircle({
      x: margin + 5,
      y: yPos - 2,
      size: 2.5,
      color: bulletColor,
    });

    page.drawText(credentials[i], {
      x: margin + 15,
      y: yPos,
      size: 7.5,
      color: colors.dark,
      font: helvetica,
    });
    yPos -= itemGap;
  }

  yPos -= sectionGap;

  // Services section
  page.drawText('Clinical Services', {
    x: margin,
    y: yPos,
    size: 12,
    color: colors.primary,
    font: helveticaBold,
  });

  yPos -= 18;

  const services = [
    { title: '• Injury Assessment & Diagnosis', desc: 'Evidence-based evaluation with objective outcome measurement.' },
    { title: '• Return-to-Play Protocols', desc: 'Structured rehab with sport-specific demands.' },
    { title: '• Manual Therapy & Sports Massage', desc: 'Advanced hands-on treatment for rapid recovery.' },
  ];

  for (const service of services) {
    if (yPos < 70) break;

    page.drawText(service.title, {
      x: margin,
      y: yPos,
      size: 8,
      color: colors.primary,
      font: helveticaBold,
    });

    const descWrapped = wrapText(service.desc, contentWidth - 16, 7.5);
    for (const line of descWrapped) {
      page.drawText(line, {
        x: margin + 16,
        y: yPos - 10,
        size: 7.5,
        color: colors.darkGray,
        font: helvetica,
      });
      yPos -= 9;
    }

    yPos -= 8;
  }

  yPos -= sectionGap;

  // Footer with buttons
  page.drawRectangle({
    x: 0,
    y: 0,
    width: width,
    height: 70,
    color: colors.cream,
  });

  page.drawRectangle({
    x: 0,
    y: 70,
    width: width,
    height: 3,
    color: colors.primary,
  });

  // Center the buttons
  const buttonWidth = 130;
  const buttonHeight = 28;
  const buttonGap = 15;
  const totalButtonWidth = buttonWidth * 2 + buttonGap;
  const leftButtonX = (width - totalButtonWidth) / 2;

  // Button 1: BOOK NOW
  page.drawRectangle({
    x: leftButtonX,
    y: 32,
    width: buttonWidth,
    height: buttonHeight,
    color: colors.primary,
  });

  page.drawText('BOOK NOW', {
    x: leftButtonX + 12,
    y: 38,
    size: 9,
    color: colors.white,
    font: helveticaBold,
  });

  page.drawText('jt-football-physiotherapy.uk2.cliniko.com/bookings', {
    x: leftButtonX,
    y: 22,
    size: 6,
    color: colors.darkGray,
    font: helvetica,
  });

  // Button 2: CONTACT US
  page.drawRectangle({
    x: leftButtonX + buttonWidth + buttonGap,
    y: 32,
    width: buttonWidth,
    height: buttonHeight,
    color: colors.primary,
  });

  page.drawText('CONTACT US', {
    x: leftButtonX + buttonWidth + buttonGap + 10,
    y: 38,
    size: 9,
    color: colors.white,
    font: helveticaBold,
  });

  page.drawText('www.jtfootballphysiotherapy.co.uk/contact', {
    x: leftButtonX + buttonWidth + buttonGap,
    y: 22,
    size: 6,
    color: colors.darkGray,
    font: helvetica,
  });

  // ========== PAGE 2: EXTENDED SERVICES & BENEFITS ==========
  yPos = height - margin;
  page = pdfDoc.addPage([width, height]);

  // Top stripe
  page.drawRectangle({
    x: 0,
    y: height - 6,
    width: width,
    height: 6,
    color: colors.primary,
  });

  page.drawText('Our Comprehensive Approach', {
    x: margin,
    y: yPos - 18,
    size: 14,
    color: colors.primary,
    font: helveticaBold,
  });

  yPos -= 42;

  // Extended Services
  page.drawText('Extended Clinical Services', {
    x: margin,
    y: yPos,
    size: 12,
    color: colors.primary,
    font: helveticaBold,
  });

  yPos -= 18;

  const extendedServices = [
    { title: '• Pre-Season Screening', desc: 'Comprehensive assessments to prevent injuries.' },
    { title: '• In-Season Management', desc: 'Rapid treatment and injury management.' },
    { title: '• Post-Match Recovery', desc: 'Specialised protocols to accelerate healing.' },
    { title: '• Strength & Conditioning', desc: 'Performance programs tailored to football.' },
    { title: '• Mental Health Support', desc: 'Psychological resilience coaching.' },
  ];

  for (const service of extendedServices) {
    if (yPos < 80) break;

    page.drawText(service.title, {
      x: margin,
      y: yPos,
      size: 8,
      color: colors.primary,
      font: helveticaBold,
    });

    const descWrapped = wrapText(service.desc, contentWidth - 16, 7.5);
    for (const line of descWrapped) {
      page.drawText(line, {
        x: margin + 16,
        y: yPos - 10,
        size: 7.5,
        color: colors.darkGray,
        font: helvetica,
      });
      yPos -= 9;
    }

    yPos -= 8;
  }

  yPos -= sectionGap;

  // Club Benefits
  page.drawText('Why Clubs Partner With Us', {
    x: margin,
    y: yPos,
    size: 12,
    color: colors.primary,
    font: helveticaBold,
  });

  yPos -= 18;

  const clubBenefits = [
    'Reduced player injuries & time lost to injury',
    'Faster rehabilitation & return-to-play timelines',
    'Enhanced team performance & fitness',
    'Proactive injury prevention strategies',
    'Cost-effective compared to multiple specialists',
  ];

  for (let i = 0; i < clubBenefits.length; i++) {
    const bulletColor = i % 2 === 0 ? colors.primary : colors.primary;
    page.drawCircle({
      x: margin + 5,
      y: yPos - 2,
      size: 2.5,
      color: bulletColor,
    });

    page.drawText(clubBenefits[i], {
      x: margin + 15,
      y: yPos,
      size: 7.5,
      color: colors.dark,
      font: helvetica,
    });
    yPos -= itemGap;
  }

  yPos -= 20;

  // Footer Page 2
  page.drawRectangle({
    x: 0,
    y: 0,
    width: width,
    height: 70,
    color: colors.cream,
  });

  page.drawRectangle({
    x: 0,
    y: 70,
    width: width,
    height: 3,
    color: colors.primary,
  });

  // Centered buttons
  page.drawRectangle({
    x: leftButtonX,
    y: 32,
    width: buttonWidth,
    height: buttonHeight,
    color: colors.primary,
  });

  page.drawText('BOOK NOW', {
    x: leftButtonX + 12,
    y: 38,
    size: 9,
    color: colors.white,
    font: helveticaBold,
  });

  page.drawRectangle({
    x: leftButtonX + buttonWidth + buttonGap,
    y: 32,
    width: buttonWidth,
    height: buttonHeight,
    color: colors.primary,
  });

  page.drawText('CONTACT US', {
    x: leftButtonX + buttonWidth + buttonGap + 10,
    y: 38,
    size: 9,
    color: colors.white,
    font: helveticaBold,
  });

  // ========== PAGE 3: TRACK RECORD & EXPERTISE ==========
  yPos = height - margin;
  page = pdfDoc.addPage([width, height]);

  // Top stripe
  page.drawRectangle({
    x: 0,
    y: height - 6,
    width: width,
    height: 6,
    color: colors.darkGray,
  });

  page.drawText('Track Record & Expertise', {
    x: margin,
    y: yPos - 18,
    size: 14,
    color: colors.primary,
    font: helveticaBold,
  });

  yPos -= 42;

  // Professional Experience Box
  page.drawRectangle({
    x: margin,
    y: yPos - 65,
    width: contentWidth,
    height: 65,
    color: colors.cream,
  });

  page.drawText('7+ Years Professional Experience', {
    x: margin + padding,
    y: yPos - 18,
    size: 10,
    color: colors.primary,
    font: helveticaBold,
  });

  page.drawText('Working directly with Scottish professional football clubs including Kilmarnock FC and Hearts of Midlothian.',
    {
      x: margin + padding,
      y: yPos - 30,
      size: 8,
      color: colors.darkGray,
      font: helvetica,
    }
  );

  const expertise = ['Evidence-based injury management', 'Return-to-play protocols', 'Performance optimization'];
  let expertiseY = yPos - 44;
  for (const item of expertise) {
    page.drawText('• ' + item, {
      x: margin + padding + 10,
      y: expertiseY,
      size: 7.5,
      color: colors.dark,
      font: helvetica,
    });
    expertiseY -= 10;
  }

  yPos -= 85;

  // Key Metrics - centered layout
  page.drawText('Why We Stand Out', {
    x: margin,
    y: yPos,
    size: 12,
    color: colors.primary,
    font: helveticaBold,
  });

  yPos -= 22;

  // 2x2 grid of metrics - centered
  const metricBoxWidth = (contentWidth - 12) / 2;
  const metricBoxHeight = 50;
  const metrics = [
    { stat: '95%+', desc: 'Safe return to play' },
    { stat: 'Avg 4 wks', desc: 'Faster recovery' },
    { stat: 'Zero', desc: 'Re-injury rate' },
    { stat: '24/7', desc: 'Available' },
  ];

  // Metric 1 (top-left)
  page.drawRectangle({
    x: margin,
    y: yPos - metricBoxHeight,
    width: metricBoxWidth,
    height: metricBoxHeight,
    color: colors.cream,
  });

  page.drawText(metrics[0].stat, {
    x: margin + padding,
    y: yPos - 16,
    size: 12,
    color: colors.primary,
    font: helveticaBold,
  });

  page.drawText(metrics[0].desc, {
    x: margin + padding,
    y: yPos - 32,
    size: 7.5,
    color: colors.darkGray,
    font: helvetica,
  });

  // Metric 2 (top-right)
  page.drawRectangle({
    x: margin + metricBoxWidth + 12,
    y: yPos - metricBoxHeight,
    width: metricBoxWidth,
    height: metricBoxHeight,
    color: colors.cream,
  });

  page.drawText(metrics[1].stat, {
    x: margin + metricBoxWidth + 12 + padding,
    y: yPos - 16,
    size: 12,
    color: colors.primary,
    font: helveticaBold,
  });

  page.drawText(metrics[1].desc, {
    x: margin + metricBoxWidth + 12 + padding,
    y: yPos - 32,
    size: 7.5,
    color: colors.darkGray,
    font: helvetica,
  });

  yPos -= metricBoxHeight + 14;

  // Metric 3 (bottom-left)
  page.drawRectangle({
    x: margin,
    y: yPos - metricBoxHeight,
    width: metricBoxWidth,
    height: metricBoxHeight,
    color: colors.cream,
  });

  page.drawText(metrics[2].stat, {
    x: margin + padding,
    y: yPos - 16,
    size: 12,
    color: colors.darkGray,
    font: helveticaBold,
  });

  page.drawText(metrics[2].desc, {
    x: margin + padding,
    y: yPos - 32,
    size: 7.5,
    color: colors.darkGray,
    font: helvetica,
  });

  // Metric 4 (bottom-right)
  page.drawRectangle({
    x: margin + metricBoxWidth + 12,
    y: yPos - metricBoxHeight,
    width: metricBoxWidth,
    height: metricBoxHeight,
    color: colors.cream,
  });

  page.drawText(metrics[3].stat, {
    x: margin + metricBoxWidth + 12 + padding,
    y: yPos - 16,
    size: 12,
    color: colors.primary,
    font: helveticaBold,
  });

  page.drawText(metrics[3].desc, {
    x: margin + metricBoxWidth + 12 + padding,
    y: yPos - 32,
    size: 7.5,
    color: colors.darkGray,
    font: helvetica,
  });

  yPos -= metricBoxHeight + 24;

  // Final CTA box
  page.drawRectangle({
    x: margin,
    y: yPos - 55,
    width: contentWidth,
    height: 55,
    color: colors.primary,
  });

  page.drawText('Start Your Partnership Today', {
    x: margin + padding,
    y: yPos - 18,
    size: 12,
    color: colors.white,
    font: helveticaBold,
  });

  page.drawText("Contact us for a confidential consultation about your club's physiotherapy needs and how we can support your athletes.",
    {
      x: margin + padding,
      y: yPos - 35,
      size: 7.5,
      color: colors.cream,
      font: helvetica,
    }
  );

  // Footer Page 3
  page.drawRectangle({
    x: 0,
    y: 0,
    width: width,
    height: 70,
    color: colors.cream,
  });

  page.drawRectangle({
    x: 0,
    y: 70,
    width: width,
    height: 3,
    color: colors.primary,
  });

  // Centered buttons
  page.drawRectangle({
    x: leftButtonX,
    y: 32,
    width: buttonWidth,
    height: buttonHeight,
    color: colors.primary,
  });

  page.drawText('BOOK NOW', {
    x: leftButtonX + 12,
    y: 38,
    size: 9,
    color: colors.white,
    font: helveticaBold,
  });

  page.drawRectangle({
    x: leftButtonX + buttonWidth + buttonGap,
    y: 32,
    width: buttonWidth,
    height: buttonHeight,
    color: colors.primary,
  });

  page.drawText('CONTACT US', {
    x: leftButtonX + buttonWidth + buttonGap + 10,
    y: 38,
    size: 9,
    color: colors.white,
    font: helveticaBold,
  });

  page.drawText('www.jtfootballphysiotherapy.co.uk', {
    x: margin,
    y: 10,
    size: 8,
    color: colors.primary,
    font: helvetica,
  });

  // Convert to buffer
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

/**
 * Wrap text to fit within a specified width
 */
function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
  const charWidth = fontSize * 0.52; // Helvetica approximation
  const charsPerLine = Math.floor(maxWidth / charWidth);

  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + word).length > charsPerLine) {
      if (currentLine) lines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  }

  if (currentLine) lines.push(currentLine.trim());
  return lines;
}
