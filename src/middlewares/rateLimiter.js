const rateLimit = require('express-rate-limit');

const globalLimiter = rateLimit({
  windowMs: Number(process.env.GLOBAL_RATE_WINDOW_MS || 60_000), // 1 minute
  max: Number(process.env.GLOBAL_RATE_MAX || 300), // max requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' }
});

// Specific limiter for the mail sending endpoint (strict)
const mailLimiter = rateLimit({
  windowMs: Number(process.env.MAIL_RATE_WINDOW_MS || 60_000), // 1 minute
  max: Number(process.env.MAIL_RATE_MAX || 5), // e.g., 5 mails per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many mail requests, slow down.' }
});

module.exports = { globalLimiter, mailLimiter };
