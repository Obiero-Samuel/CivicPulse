const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Rate limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max:      20,
  message:  { error: 'Too many requests. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders:   false,
});

// ─── Routes ───────────────────────────────────────────────────────────
const authRoutes      = require('./routes/authRoutes');
const reportRoutes    = require('./routes/reportRoutes');
const wardRoutes      = require('./routes/wardRoutes');
const categoryRoutes  = require('./routes/categoryRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const adminRoutes     = require('./routes/adminRoutes');

app.use('/api/auth',       authLimiter, authRoutes);
app.use('/api/reports',    reportRoutes);
app.use('/api/wards',      wardRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/analytics',  analyticsRoutes);
app.use('/api/admin',      adminRoutes);

// ─── Root → landing page ─────────────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ─── 404 catch-all ───────────────────────────────────────────────────
app.use((req, res) => {
  // If it's an API route, send JSON
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Endpoint not found.' });
  }
  // Otherwise send the 404 page
  res.status(404).sendFile(path.join(__dirname, '../public/pages/404.html'));
});

module.exports = app;
