
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const pool    = require('../config/db');
const crypto  = require('crypto');
const nodemailer = require('nodemailer');
const userModel = require('../models/userModel');

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
		const existing = await userModel.findUserByEmail(email.toLowerCase());
		if (existing) {
			return res.status(409).json({ error: 'An account with that email already exists.' });
		}

		// ─── Hash password ────────────────────────────────────
		const salt          = await bcrypt.genSalt(10);
		const password_hash = await bcrypt.hash(password, salt);

		// ─── Generate verification token ─────────────────────
		const verification_token = crypto.randomBytes(32).toString('hex');

		// ─── Insert user with verification ───────────────────
		const user = await userModel.createUserWithVerification({
			full_name: full_name.trim(),
			email: email.toLowerCase(),
			password_hash,
			ward_id,
			verification_token
		});

		// ─── Send verification email ────────────────────────
		const transporter = nodemailer.createTransport({
			service: 'gmail', // or your SMTP provider
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS
			}
		});

		const verifyUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/api/auth/verify/${verification_token}`;
		await transporter.sendMail({
			from: process.env.EMAIL_USER,
			to: user.email,
			subject: 'Verify your CivicPulse account',
			html: `<p>Hi ${user.full_name},</p>
				   <p>Thank you for registering. Please verify your email by clicking the link below:</p>
				   <a href="${verifyUrl}">${verifyUrl}</a>`
		});

		return res.status(201).json({
			message: 'Account created. Please check your email to verify your account.',
		});

	} catch (err) {
		console.error('Register error:', err.message);
		return res.status(500).json({ error: 'Registration failed. Please try again.' });
	}
// ════════════════════════════════════════════════════════════
//  GET /api/auth/verify/:token
// ════════════════════════════════════════════════════════════
const verifyEmail = async (req, res) => {
	const { token } = req.params;
	try {
		const user = await userModel.verifyUserByToken(token);
		if (!user) {
			return res.status(400).send('Invalid or expired verification link.');
		}
		return res.send('Email verified successfully! You can now log in.');
	} catch (err) {
		return res.status(500).send('Verification failed.');
	}
};
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

module.exports = { register, login, getMe, verifyEmail };
