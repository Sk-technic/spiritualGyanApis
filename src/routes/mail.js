const express = require('express');
const router = express.Router();
const { sendMail } = require('../service/mailer.service.js');
const { mailLimiter } = require('../middlewares/rateLimiter');

// Simple validation helper
const validateMailPayload = (body) => {
  const { to, subject, text, html } = body || {};
  if (!to || !subject || (!text && !html)) return false;
  return true;
};

/**
 * POST /mail/send
 * body: { to: string, subject: string, text?: string, html?: string }
 */
router.post('/send', mailLimiter, async (req, res, next) => {
  try {
    if (!validateMailPayload(req.body)) {
      return res.status(400).json({ success: false, message: 'Invalid payload. Required: to, subject, text or html' });
    }

    const { to, subject, text, html } = req.body;

    const info = await sendMail({
      to,
      subject,
      text,
      html
    });

    return res.status(200).json({ success: true, message: 'Email queued/sent', info });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
