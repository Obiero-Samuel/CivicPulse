const jwt = require('jsonwebtoken');
const pool = require('../config/db');

module.exports = async function (req, res, next) {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];
	if (!token) return res.status(401).json({ error: 'No token provided' });
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
		// Attach user info to req.user (including authority_id for officers)
		const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
		if (!userRes.rows.length) return res.status(401).json({ error: 'User not found' });
		req.user = userRes.rows[0];
		// If officer, get authority_id
		if (req.user.role === 'officer') {
			// Find authority by officer's email (assuming 1:1 mapping for demo)
			const authRes = await pool.query(
				`SELECT a.id FROM authorities a WHERE a.contact_email = $1`,
				[req.user.email]
			);
			req.user.authority_id = authRes.rows[0]?.id || null;
		}
		next();
	} catch (err) {
		res.status(401).json({ error: 'Invalid token' });
	}
};
