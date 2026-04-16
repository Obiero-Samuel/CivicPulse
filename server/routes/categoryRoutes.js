const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.name, c.description,
              a.name AS authority
       FROM categories c
       LEFT JOIN authorities a ON c.default_authority_id = a.id
       ORDER BY c.name`
    );
    return res.status(200).json({ count: result.rows.length, categories: result.rows });
  } catch (err) {
    console.error('Categories error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch categories.' });
  }
});

module.exports = router;
