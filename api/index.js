// Vercel Entry Point
// Vercel auto-detects this because it is located in the root /api folder.
// This ensures serverless functions are configured correctly.

const app = require('../server/index');

module.exports = app;
