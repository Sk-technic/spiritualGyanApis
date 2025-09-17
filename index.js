require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const mailRoutes = require('./src/routes/mail.js');
const { globalLimiter } = require('./src/middlewares/rateLimiter');
const notFound = require('./src/middlewares/notfound');
const errorHandler = require('./src/middlewares/errorHandler');
// 2️⃣ Debug environment variables
console.log("Loaded ENV:", {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  user: process.env.SMTP_USER ? "✔️ set" : "❌ missing",
  pass: process.env.SMTP_PASS ? "✔️ set" : "❌ missing",
});
const app = express();

// Security & parsing middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL,            // adjust to specific origin or list in production
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10kb' })); // small JSON limit to reduce attack surface
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Global rate limit for all requests (helps prevent crash on floods)
app.use(globalLimiter);

// Routes
app.use('/mail', mailRoutes);

// Unknown routes -> security aware 404
app.use(notFound);

// Centralized error handler
app.use(errorHandler);

// Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Mailer server listening on port ${PORT}`);
});
