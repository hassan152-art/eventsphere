const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

/**
 * Generates an event ticket PDF Buffer including QR code and event details.
 */
async function generateTicketPDF({ registration, event, user }) {
  // Generate QR Code data URL -> Buffer
  const qrDataUrl = await QRCode.toDataURL(registration.attendanceToken, { width: 250, margin: 1 });
  const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A5', layout: 'landscape', margin: 0 });
    const chunks = [];

    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const { width, height } = doc.page;

    // Outer Background
    doc.rect(0, 0, width, height).fill('#f8fafc');

    // Decorative Header bar
    doc.rect(0, 0, width, 80).fill('#4f46e5');

    // Title
    doc.fontSize(22).fillColor('#ffffff').font('Helvetica-Bold')
      .text('EVENT TICKET', 24, 22);

    doc.fontSize(10).fillColor('#c7d2fe').font('Helvetica')
      .text('EventSphere • Official Pass', 24, 48);

    // Main Card Body
    doc.roundedRect(20, 95, width - 40, height - 115, 12).fill('#ffffff').stroke('#e2e8f0');

    // Left Column: Event details
    doc.fontSize(16).fillColor('#1e1b4b').font('Helvetica-Bold')
      .text(event.title, 40, 115, { width: width - 210 });

    const eventDate = new Date(event.date).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });

    doc.fontSize(10).fillColor('#475569').font('Helvetica');
    doc.text(`📅 Date: ${eventDate}`, 40, 145);
    doc.text(`⏰ Time: ${event.startTime} - ${event.endTime}`, 40, 163);
    doc.text(`📍 Venue: ${event.venue}`, 40, 181);

    doc.rect(40, 205, width - 230, 1).fill('#cbd5e1');

    doc.fontSize(11).fillColor('#1e293b').font('Helvetica-Bold')
      .text(`Attendee: ${user.fullName || 'Participant'}`, 40, 218);

    doc.fontSize(9).fillColor('#64748B').font('Helvetica')
      .text(`Email: ${user.email}`, 40, 236)
      .text(`Ticket ID: ${registration._id}`, 40, 252)
      .text(`Status: ${registration.status}`, 40, 268);

    // Right Column: QR Code & Scan text
    doc.image(qrBuffer, width - 165, 115, { width: 130, height: 130 });
    doc.fontSize(8).fillColor('#64748B').font('Helvetica')
      .text('Scan for Fast Check-in', width - 165, 252, { width: 130, align: 'center' });

    doc.end();
  });
}

module.exports = { generateTicketPDF };
