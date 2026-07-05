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

// 1. ROBUST CORS PREFLIGHT (Always executes first)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*'); 
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

// Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
});

// 2. SERVERLESS MONGOOSE CONNECTION CACHING
let cached = global._mongoose;
if (!cached) cached = global._mongoose = { conn: null, promise: null };

async function connectDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error('Missing required env var: MONGODB_URI');
  }
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
    }).then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Global DB Middleware
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('❌ Mongoose Connection Error:', err);
    res.status(500).json({ error: 'Database connection failed', details: err.message });
  }
});

// Rate limiting on auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts, please try again later.' }
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/events', contributionsRoutes);
app.use('/api/events', expensesRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/events', reportsRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Vercel Lambda Alive' }));

// 3. GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  console.error('❌ Unhandled Exception:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// Local Development Server Binding
if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  // Initialize DB locally before listening, optional but clean
  connectDB().then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  }).catch(err => console.error(err));
}

module.exports = app;
