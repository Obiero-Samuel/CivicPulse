
const pool = require('../config/db');

const getUsers = async (req, res) => {
	try {
		const result = await pool.query(
			`SELECT u.id, u.full_name, u.email, u.role, u.is_active, u.is_verified, u.created_at,
							w.name AS ward_name
			 FROM users u
			 LEFT JOIN wards w ON u.ward_id = w.id
			 ORDER BY u.created_at DESC`
		);
		res.json({ users: result.rows });
	} catch (err) {
		console.error('Get users error:', err.message);
		res.status(500).json({ error: 'Failed to fetch users.' });
	}
};

const toggleUserStatus = async (req, res) => {
	try {
		const result = await pool.query(
			`UPDATE users SET is_active = NOT is_active
			 WHERE id = $1 RETURNING id, full_name, is_active`,
			[req.params.id]
		);
		if (!result.rows.length) return res.status(404).json({ error: 'User not found.' });
		res.json({ message: 'User status updated.', user: result.rows[0] });
	} catch (err) {
		res.status(500).json({ error: 'Failed to update user.' });
	}
};

module.exports = { getUsers, toggleUserStatus };
