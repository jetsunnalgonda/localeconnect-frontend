const express = require('express');
const path = require('path');
const history = require('connect-history-api-fallback');

const app = express();

// Redirect HTTP to HTTPS and handle the root domain redirect
app.use((req, res, next) => {
  // Redirect from non-www to www
  if (req.headers.host === 'webconnect.world') {
    return res.redirect(301, `https://www.webconnect.world${req.url}`);
  }

  // Redirect HTTP to HTTPS
  if (req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(`https://${req.hostname}${req.url}`);
  }

  next();
});

// Middleware to handle Vue Router's history mode
app.use(history());

// Serve static files from the 'dist' directory (your built Vue.js app)
app.use(express.static(path.join(__dirname, 'dist')));

// Handle all routes by sending index.html
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3011;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (err) => {
  console.error('Unhandled Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', promise, 'reason:', reason);
});
