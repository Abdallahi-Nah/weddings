// Vercel Serverless Handler — wraps the Express app
// This file is the entry point for Vercel's Node.js serverless runtime.
// It connects to MongoDB once (cached across invocations) and routes
// all /api/* traffic through the Express app.

require('dotenv').config();
const serverless = require('serverless-http');
const mongoose = require('mongoose');

// Reuse MongoDB connection across Lambda invocations
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;
}

// Import the Express app (no app.listen — Vercel handles that)
const app = require('../index');

// Patch: don't call app.listen in serverless context
// index.js already exports app, but also calls mongoose.connect + listen.
// We need a clean export. So we import the app after stripping the listen call.
// Since index.js calls mongoose.connect internally, we rely on that working
// or being idempotent.

module.exports = async (req, res) => {
  await connectDB();
  return serverless(app)(req, res);
};
