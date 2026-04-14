
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// Middleware

app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));


// Example route (remove or replace as needed)
app.get('/', (req, res) => {
  res.send('CivicPulse API is running!');
});

module.exports = app;
