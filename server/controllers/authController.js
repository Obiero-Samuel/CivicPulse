const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const pool    = require('../config/db');
require('dotenv').config();

// ─── Helper: generate JWT ─────────────────────────────────────
const generateToken = (user) => {
	return jwt.sign(
		{
			id:      user.id,
			email:   user.email,
			role:    user.role,
			ward_id: user.ward_id,
		},
		process.env.JWT_SECRET,
		{ expiresIn: '7d' }
	);
};

// ════════════════════════════════════════════════════════════
//  POST /api/auth/register
// ════════════════════════════════════════════════════════════
const register = async (req, res) => {
	const { full_name, email, password, ward_id } = req.body;

	// ─── Validation ───────────────────────────────────────────
	if (!full_name || !email || !password) {
		return res.status(400).json({ error: 'Full name, email and password are required.' });
	}

	if (password.length < 8) {
		return res.status(400).json({ error: 'Password must be at least 8 characters.' });
	}

	try {
		// ─── Check duplicate email ────────────────────────────
		const existing = await pool.query(
			'SELECT id FROM users WHERE email = $1', [email.toLowerCase()]
		);

		if (existing.rows.length > 0) {
			return res.status(409).json({ error: 'An account with that email already exists.' });
		}

		// ─── Hash password ────────────────────────────────────
		const salt          = await bcrypt.genSalt(10);
		const password_hash = await bcrypt.hash(password, salt);

		// ─── Insert user ──────────────────────────────────────
		const result = await pool.query(
			`INSERT INTO users (full_name, email, password_hash, role, ward_id)
			 VALUES ($1, $2, $3, 'resident', $4)
			 RETURNING id, full_name, email, role, ward_id, created_at`,
			[full_name.trim(), email.toLowerCase(), password_hash, ward_id || null]
		);

		const user  = result.rows[0];
		const token = generateToken(user);

		return res.status(201).json({
			message: 'Account created successfully.',
			token,
			user: {
				id:        user.id,
				full_name: user.full_name,
				email:     user.email,
				role:      user.role,
				ward_id:   user.ward_id,
			},
		});

	} catch (err) {
		console.error('Register error:', err.message);
		return res.status(500).json({ error: 'Registration failed. Please try again.' });
	}
};

// ════════════════════════════════════════════════════════════
//  POST /api/auth/login
// ════════════════════════════════════════════════════════════
const login = async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({ error: 'Email and password are required.' });
	}

	try {
		// ─── Find user ────────────────────────────────────────
		const result = await pool.query(
			`SELECT id, full_name, email, password_hash, role, ward_id, is_active
			 FROM users WHERE email = $1`,
			[email.toLowerCase()]
		);

		if (result.rows.length === 0) {
			return res.status(401).json({ error: 'Invalid email or password.' });
		}

		const user = result.rows[0];

		if (!user.is_active) {
			return res.status(403).json({ error: 'Your account has been deactivated. Contact admin.' });
		}

		// ─── Compare password ─────────────────────────────────
		const isMatch = await bcrypt.compare(password, user.password_hash);

		if (!isMatch) {
			return res.status(401).json({ error: 'Invalid email or password.' });
		}

		const token = generateToken(user);

		return res.status(200).json({
			message: 'Login successful.',
			token,
			user: {
				id:        user.id,
				full_name: user.full_name,
				email:     user.email,
				role:      user.role,
				ward_id:   user.ward_id,
			},
		});

	} catch (err) {
		console.error('Login error:', err.message);
		return res.status(500).json({ error: 'Login failed. Please try again.' });
	}
};

// ════════════════════════════════════════════════════════════
//  GET /api/auth/me  (protected)
// ════════════════════════════════════════════════════════════
const getMe = async (req, res) => {
	try {
		const result = await pool.query(
			`SELECT u.id, u.full_name, u.email, u.role, u.created_at,
							w.name AS ward_name, w.subcounty
			 FROM users u
			 LEFT JOIN wards w ON u.ward_id = w.id
			 WHERE u.id = $1`,
			[req.user.id]
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: 'User not found.' });
		}

		return res.status(200).json({ user: result.rows[0] });

	} catch (err) {
		console.error('GetMe error:', err.message);
		return res.status(500).json({ error: 'Could not fetch profile.' });
	}
};

module.exports = { register, login, getMe };
