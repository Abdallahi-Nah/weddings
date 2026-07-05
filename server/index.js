require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const eventsRoutes = require('./routes/events');
const contributionsRoutes = require('./routes/contributions');
const expensesRoutes = require('./routes/expenses');
const friendsRoutes = require('./routes/friends');
const reportsRoutes = require('./routes/reports');

const app = express();

// CORS
// CORS - Manual Middleware for robust Vercel Serverless support
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(express.json());

// Rate limiting on auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  message: { error: 'Too many login attempts, please try again later.' }
});

// Request Logger for debugging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/events', contributionsRoutes);
app.use('/api/events', expensesRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/events', reportsRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Connect to MongoDB
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('✅ Connected to MongoDB');
      if (process.env.NODE_ENV !== 'production') {
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
      }
    })
    .catch(err => {
      console.error('❌ MongoDB connection error:', err);
    });
} else {
  console.error('❌ CRITICAL: MONGODB_URI is not set in environment variables!');
}

module.exports = app;
