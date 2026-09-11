const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST) return null;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
  return transporter;
}

/**
 * Sends an email if SMTP is configured; otherwise logs to console so local
 * development / demo environments never crash on a missing mail server.
 */
async function sendEmail({ to, subject, html }) {
  const t = getTransporter();
  if (!t) {
    console.log(`[emailService] (SMTP not configured) Would send to ${to}: ${subject}`);
    return { simulated: true };
  }
  return t.sendMail({
    from: process.env.EMAIL_FROM || 'EventSphere <no-reply@eventsphere.com>',
    to,
    subject,
    html,
  });
}

function getBaseTemplate(content) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 24px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 6px 0 0; opacity: 0.9; font-size: 14px; }
        .body { padding: 32px 24px; line-height: 1.6; font-size: 15px; color: #334155; }
        .card { background: #f1f5f9; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #4f46e5; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        .badge { display: inline-block; background: #e0e7ff; color: #4338ca; padding: 4px 12px; border-radius: 9999px; font-weight: 600; font-size: 12px; }
        .btn { display: inline-block; background: #4f46e5; color: #ffffff !important; padding: 12px 28px; border-radius: 10px; font-weight: 600; text-decoration: none; margin-top: 16px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>EventSphere</h1>
          <p>College Event Management & Information System</p>
        </div>
        <div class="body">
          ${content}
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} EventSphere. All rights reserved.</p>
          <p>This is an automated notification. Please do not reply directly to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

async function sendWelcomeEmail(user) {
  const html = getBaseTemplate(`
    <h2>Welcome to EventSphere, ${user.fullName}! 🎉</h2>
    <p>Thank you for registering your account with your email: <strong>${user.email}</strong>.</p>
    <p>With EventSphere, you can now:</p>
    <ul>
      <li>Discover and register for upcoming college events, workshops, and competitions.</li>
      <li>Get instant digital tickets with QR codes for fast venue check-in.</li>
      <li>Rate and review events after attending.</li>
      <li>Download certificates of participation and achievement.</li>
    </ul>
    <div style="text-align: center; margin-top: 24px;">
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" class="btn">Log In to Your Account</a>
    </div>
  `);
  return sendEmail({ to: user.email, subject: 'Welcome to EventSphere! 🎉', html });
}

async function sendBookingConfirmationEmail(user, event, registration) {
  const isWaitlisted = registration.status === 'Waitlisted';
  const eventDate = new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const html = getBaseTemplate(`
    <h2>${isWaitlisted ? "You're on the Waitlist ⏳" : 'Registration Confirmed! 🎟️'}</h2>
    <p>Hi <strong>${user.fullName || 'Participant'}</strong>,</p>
    <p>${isWaitlisted 
      ? `The event <strong>${event.title}</strong> is currently full, but we've placed you on the waitlist position <strong>#${registration.waitlistPosition}</strong>.` 
      : `Your registration for <strong>${event.title}</strong> has been successfully confirmed!`}</p>
    
    <div class="card">
      <h3 style="margin-top:0; color:#1e1b4b;">Event Details</h3>
      <p style="margin:4px 0;"><strong>Event:</strong> ${event.title}</p>
      <p style="margin:4px 0;"><strong>Date:</strong> ${eventDate}</p>
      <p style="margin:4px 0;"><strong>Time:</strong> ${event.startTime} - ${event.endTime}</p>
      <p style="margin:4px 0;"><strong>Venue:</strong> ${event.venue}</p>
      <p style="margin:4px 0;"><strong>Status:</strong> <span class="badge">${registration.status}</span></p>
    </div>

    ${!isWaitlisted ? `
      <p>You can view and download your digital ticket PDF from your <strong>Student Dashboard</strong> anytime!</p>
      <div style="text-align: center; margin-top: 24px;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard/registrations" class="btn">View My Ticket</a>
      </div>
    ` : ''}
  `);

  return sendEmail({
    to: user.email,
    subject: isWaitlisted ? `Waitlisted for ${event.title}` : `Booking Confirmed: ${event.title} 🎟️`,
    html,
  });
}

async function sendPendingRegistrationEmail(user, event) {
  const eventDate = new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const html = getBaseTemplate(`
    <h2>Registration Submitted - Pending Approval ⏳</h2>
    <p>Hi <strong>${user.fullName || 'Participant'}</strong>,</p>
    <p>Your registration request for <strong>${event.title}</strong> has been received and sent to the <strong>Admin & Organizer</strong> for approval.</p>

    <div class="card">
      <h3 style="margin-top:0; color:#1e1b4b;">Event Summary</h3>
      <p style="margin:4px 0;"><strong>Event:</strong> ${event.title}</p>
      <p style="margin:4px 0;"><strong>Date:</strong> ${eventDate}</p>
      <p style="margin:4px 0;"><strong>Venue:</strong> ${event.venue}</p>
      <p style="margin:4px 0;"><strong>Status:</strong> <span class="badge" style="background:#fef3c7; color:#92400e;">Pending Approval</span></p>
    </div>

    <p>You will receive an email confirmation and ticket pass once your registration request is reviewed and approved.</p>
  `);

  return sendEmail({
    to: user.email,
    subject: `Registration Pending Approval: ${event.title}`,
    html,
  });
}

async function sendAdminRegistrationNotification(adminEmail, adminName, student, event) {
  const eventDate = new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const html = getBaseTemplate(`
    <h2>New Registration Request Needs Approval 🔔</h2>
    <p>Hi <strong>${adminName || 'Admin'}</strong>,</p>
    <p>A student has submitted a registration request for an event and is <strong>waiting for your approval</strong>.</p>

    <div class="card">
      <h3 style="margin-top:0; color:#1e1b4b;">Student Details</h3>
      <p style="margin:4px 0;"><strong>Name:</strong> ${student.fullName || 'N/A'}</p>
      <p style="margin:4px 0;"><strong>Email:</strong> ${student.email || 'N/A'}</p>
    </div>

    <div class="card" style="border-left-color: #7c3aed;">
      <h3 style="margin-top:0; color:#1e1b4b;">Event Details</h3>
      <p style="margin:4px 0;"><strong>Event:</strong> ${event.title}</p>
      <p style="margin:4px 0;"><strong>Date:</strong> ${eventDate}</p>
      <p style="margin:4px 0;"><strong>Venue:</strong> ${event.venue}</p>
    </div>

    <p>Please log in to the Admin Dashboard to review and approve or reject this request.</p>
    <div style="text-align: center; margin-top: 24px;">
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/admin/registrations" class="btn">Review Registration Requests</a>
    </div>
  `);

  return sendEmail({
    to: adminEmail,
    subject: `New Registration Request: ${event.title} — Action Required`,
    html,
  });
}

module.exports = { sendEmail, sendWelcomeEmail, sendBookingConfirmationEmail, sendPendingRegistrationEmail, sendAdminRegistrationNotification };

