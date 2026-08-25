const PDFDocument = require('pdfkit');
const { v4: uuidv4 } = require('uuid');

/**
 * Renders a simple, professional certificate PDF into a Buffer.
 * In production this buffer would then be uploaded to Cloudinary by the
 * calling controller; here we return the buffer + a generated certificate
 * number so the controller decides where to persist it.
 */
function generateCertificateNumber() {
  return `ES-CERT-${uuidv4().split('-')[0].toUpperCase()}`;
}

function generateCertificatePDF({ studentName, eventTitle, date, type, certificateNumber }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ layout: 'landscape', size: 'A4', margin: 0 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const { width, height } = doc.page;

    // Border
    doc.rect(20, 20, width - 40, height - 40).lineWidth(3).stroke('#4338CA');
    doc.rect(30, 30, width - 60, height - 60).lineWidth(1).stroke('#7C3AED');

    doc.fontSize(12).fillColor('#7C3AED').font('Helvetica-Bold')
      .text('EVENTSPHERE', 0, 70, { align: 'center' });

    doc.fontSize(30).fillColor('#1E1B4B').font('Helvetica-Bold')
      .text('Certificate of ' + (type || 'Participation'), 0, 100, { align: 'center' });

    doc.fontSize(13).fillColor('#475569').font('Helvetica')
      .text('This certificate is proudly presented to', 0, 160, { align: 'center' });

    doc.fontSize(26).fillColor('#4338CA').font('Helvetica-Bold')
      .text(studentName, 0, 190, { align: 'center' });

    doc.fontSize(13).fillColor('#475569').font('Helvetica')
      .text(`for participation in "${eventTitle}"`, 80, 235, { align: 'center', width: width - 160 });

    doc.fontSize(11).fillColor('#64748B')
      .text(`Date: ${date}`, 0, 280, { align: 'center' });

    doc.fontSize(9).fillColor('#94A3B8')
      .text(`Certificate No: ${certificateNumber}`, 0, height - 60, { align: 'center' });

    doc.end();
  });
}

module.exports = { generateCertificateNumber, generateCertificatePDF };
