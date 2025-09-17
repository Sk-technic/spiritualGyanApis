const nodemailer = require('nodemailer');

// Build transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true' || false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  pool: true,                // use pooled connections
  maxConnections: 5,         // limit concurrency to avoid explosion
  maxMessages: 100           // max messages per connection before new one
});

/**
 * sendMail(payload)
 * payload: { to, subject, text, html, from? }
 * returns nodemailer response
 */
async function sendMail(payload = {}) {
  const mailOptions = {
    from: process.env.MAIL_FROM || payload.from || `no-reply@${process.env.SMTP_HOST}`,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html
  };

  // Optionally implement small retry on transient failures (lightweight)
  try {
    const info = await transporter.sendMail(mailOptions);
    // nodemailer returns an info object (messageId, accepted, rejected, response...)
    return { messageId: info.messageId, accepted: info.accepted, rejected: info.rejected };
  } catch (err) {
    // For serious production, classify transient errors and retry (or queue)
    // Here rethrow so centralized handler logs it and responds accordingly
    throw err;
  }
}

module.exports = { sendMail, transporter };
