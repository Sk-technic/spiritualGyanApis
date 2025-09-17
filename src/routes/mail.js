const express = require('express');
const router = express.Router();
const { sendMail } = require('../service/mailer.service.js');
const { mailLimiter } = require('../middlewares/rateLimiter');
require("dotenv").config(); // must come first

/**
 * POST /mail/send
 * body: { to: string, subject: string, text?: string, html?: string }
 */
router.post('/send', mailLimiter, async (req, res, next) => {
  try {
    const { from, subject, text, html } = req.body;

    if (!subject || (!text && !html)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payload. Required: subject, and text or html'
      });
    }

    const info = await sendMail({ from, subject, text, html });
    console.log("response------:", info);

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      info
    });
  } catch (err) {
    next(err);
  }
});


module.exports = router;
