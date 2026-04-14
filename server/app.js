
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


// Quick categories endpoint
app.get('/api/categories', async (req, res) => {
  try {
    const pool = require('./config/db');
    const result = await pool.query(
      `SELECT c.id, c.name, a.name AS authority
       FROM categories c 
       JOIN authorities a ON c.authority_id = a.id 
       ORDER BY c.name`
    );
    res.json({ categories: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories.' });
  }
});

module.exports = app;
