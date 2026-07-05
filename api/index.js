// Vercel Entry Point
// Vercel auto-detects this because it is located in the root /api folder.
// This ensures serverless functions are configured correctly.

let app;

try {
  app = require('../server/index');
} catch (error) {
  console.error('❌ Critical Startup Error during module resolution:', error);
  // Fallback app to return CORS + 500
  app = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Function failed to initialize', details: error.message }));
  };
}

module.exports = app;
