require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');

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
  client: process.env.CLIENT_URL
});

const app = express();

// Security & parsing middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: false,
}));
// app.use(cors())
app.use(morgan('combined'));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.set('trust proxy', 1);
app.use('/public',express.static(path.join(__dirname, 'public')));

// Global rate limit
app.use(globalLimiter);

// Routes
app.use('/mail', mailRoutes);

// Add this route above your 404 middleware
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Mailer Server</title>
      <style>
        body {
          margin: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #00c6ff 0%, #0072ff 100%);
          color: #fff;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
        }

        .container {
          text-align: center;
          background: rgba(0,0,0,0.4);
          padding: 50px;
          border-radius: 20px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.3);
        }

        h1 {
          font-size: 3rem;
          margin-bottom: 10px;
        }

        p {
          font-size: 1.2rem;
          margin-bottom: 30px;
        }

        a.button {
          display: inline-block;
          padding: 12px 25px;
          background: #00ffab;
          color: #00720f;
          font-weight: bold;
          text-decoration: none;
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        a.button:hover {
          background: #00e09e;
          transform: translateY(-3px);
        }

        footer {
          margin-top: 20px;
          font-size: 0.9rem;
          color: rgba(255,255,255,0.8);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>📬 Mailer Server</h1>
        <p>Your server is running and ready to send emails!</p>
        <a href="/mail/health" class="button">View Sample API Data</a>
        <footer>© ${new Date().getFullYear()} SpiritualGyan Mailer Server</footer>
      </div>
    </body>
    </html>
  `);
});


// Unknown routes -> 404
app.use(notFound);

// Centralized error handler
app.use(errorHandler);

// Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Mailer server listening on port ${PORT}`);
});
