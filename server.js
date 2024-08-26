const express = require('express');
const path = require('path');
const history = require('connect-history-api-fallback');

const app = express();

// Get the current directory in CommonJS
const __filename = __filename;
const __dirname = path.dirname(__filename);

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
