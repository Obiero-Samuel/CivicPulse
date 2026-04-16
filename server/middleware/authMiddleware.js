const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// JWT authentication middleware — attaches user info + authority_id for officers
module.exports = async function (req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        console.error('FATAL: JWT_SECRET is not set in environment variables.');
        return res.status(500).json({ error: 'Server configuration error.' });
    }

    try {
        const decoded = jwt.verify(token, secret);

        const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
        if (!userRes.rows.length) return res.status(401).json({ error: 'User not found' });

        req.user = userRes.rows[0];

        // If authority_officer, look up their authority_id by matching email
        if (req.user.role === 'authority_officer') {
            const authRes = await pool.query(
                `SELECT a.id FROM authorities a WHERE a.contact_email = $1`,
                [req.user.email]
            );
            req.user.authority_id = authRes.rows[0]?.id || null;
        }

        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};
