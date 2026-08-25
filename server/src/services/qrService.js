const QRCode = require('qrcode');

/**
 * Generates a QR code (as a data URL) encoding a signed-looking attendance
 * payload. The token itself (registration.attendanceToken) is the source of
 * truth verified server-side in attendanceController - the QR image is just
 * a convenient carrier for it.
 */
async function generateAttendanceQR({ registrationId, eventId, token }) {
  const payload = JSON.stringify({ r: registrationId, e: eventId, t: token });
  return QRCode.toDataURL(payload, { errorCorrectionLevel: 'H', margin: 2, width: 320 });
}

module.exports = { generateAttendanceQR };
