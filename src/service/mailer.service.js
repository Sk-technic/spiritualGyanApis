const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // true if port=465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
});

async function sendMail(payload = {}) {
  const mailOptions = {
    from: payload.from || process.env.SMTP_USER, // fallback to your inbox identity
    to: process.env.SMTP_USER, // always send to your own inbox
    subject: payload.subject,
    text: payload.text,
    html: payload.html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected
    };
  } catch (err) {
    throw err;
  }
}

module.exports = { sendMail, transporter };
