
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const userModel = require('../models/userModel');

// ─── Helper: generate JWT ─────────────────────────────────────
const generateToken = (user) => {
	return jwt.sign(
		{
			id: user.id,
			email: user.email,
			role: user.role,
			ward_id: user.ward_id,
		},
		process.env.JWT_SECRET,
		{ expiresIn: '7d' }
	);
};

// ─── Helper: create email transporter ─────────────────────────
const getTransporter = () => {
	return nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS,
		},
	});
};

// ─── Helper: build verification email HTML ────────────────────
const buildVerificationEmail = (fullName, verifyUrl) => {
	return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#0a0e1a;font-family:'Segoe UI',system-ui,-apple-system,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#13162d;border-radius:16px;overflow:hidden;border:1px solid rgba(99,102,241,0.15);">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0f0c29 0%,#302b63 100%);padding:36px 32px;text-align:center;">
      <h1 style="margin:0;font-size:28px;font-weight:800;color:#fff;letter-spacing:-0.02em;">
        Civic<span style="background:linear-gradient(135deg,#00e5ff,#6366f1);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">Pulse</span>
      </h1>
      <p style="margin:8px 0 0;font-size:12px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.08em;">Civic Accountability Engine</p>
    </div>

    <!-- Body -->
    <div style="padding:36px 32px;">
      <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#fff;">Welcome, ${fullName} 👋</h2>
      <p style="margin:0 0 24px;font-size:14px;color:rgba(255,255,255,0.55);line-height:1.7;">
        Thank you for joining CivicPulse. To start reporting civic issues in your ward, 
        please verify your email address by clicking the button below.
      </p>

      <!-- CTA Button -->
      <div style="text-align:center;margin:28px 0;">
        <a href="${verifyUrl}" 
           style="display:inline-block;padding:14px 40px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;letter-spacing:0.02em;">
          ✉️ Verify My Email
        </a>
      </div>

      <p style="margin:0 0 8px;font-size:12px;color:rgba(255,255,255,0.35);line-height:1.6;">
        If the button doesn't work, copy and paste this link into your browser:
      </p>
      <p style="margin:0 0 24px;font-size:12px;color:#6366f1;word-break:break-all;">
        ${verifyUrl}
      </p>

      <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:20px;">
        <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.30);line-height:1.6;">
          If you didn't create a CivicPulse account, you can safely ignore this email.
          This verification link will remain valid until used.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:rgba(0,0,0,0.2);padding:20px 32px;text-align:center;">
      <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.25);">
        CivicPulse © 2026 · Strathmore University · Nairobi, Kenya
      </p>
    </div>
  </div>
</body>
</html>`;
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
		const salt = await bcrypt.genSalt(10);
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
		const verifyUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/api/auth/verify/${verification_token}`;

		try {
			const transporter = getTransporter();
			await transporter.sendMail({
				from: `"CivicPulse" <${process.env.EMAIL_USER}>`,
				to: user.email,
				subject: '✉️ Verify your CivicPulse account',
				html: buildVerificationEmail(user.full_name, verifyUrl),
			});
		} catch (emailErr) {
			console.error('Email send error:', emailErr.message);
			// Don't fail registration if email fails — user can resend
		}

		return res.status(201).json({
			message: 'Account created! Please check your email to verify your account before logging in.',
		});

	} catch (err) {
		console.error('Register error:', err.message);
		return res.status(500).json({ error: 'Registration failed. Please try again.' });
	}
};

// ════════════════════════════════════════════════════════════
//  GET /api/auth/verify/:token — email verification
// ════════════════════════════════════════════════════════════
const verifyEmail = async (req, res) => {
	const { token } = req.params;
	try {
		const user = await userModel.verifyUserByToken(token);
		if (!user) {
			return res.redirect('/pages/index.html?verified=invalid');
		}
		return res.redirect('/pages/index.html?verified=success');
	} catch (err) {
		console.error('Verify error:', err.message);
		return res.redirect('/pages/index.html?verified=error');
	}
};

// ════════════════════════════════════════════════════════════
//  POST /api/auth/resend-verification — resend email
// ════════════════════════════════════════════════════════════
const resendVerification = async (req, res) => {
	const { email } = req.body;
	if (!email) {
		return res.status(400).json({ error: 'Email is required.' });
	}

	try {
		const user = await userModel.findUserByEmail(email.toLowerCase());
		if (!user) {
			// Don't reveal whether the email exists
			return res.status(200).json({ message: 'If that email is registered, a new verification link has been sent.' });
		}

		if (user.is_verified) {
			return res.status(200).json({ message: 'This email is already verified. You can log in.' });
		}

		// Generate new token
		const newToken = crypto.randomBytes(32).toString('hex');
		await pool.query(
			'UPDATE users SET verification_token = $1 WHERE id = $2',
			[newToken, user.id]
		);

		const verifyUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/api/auth/verify/${newToken}`;

		try {
			const transporter = getTransporter();
			await transporter.sendMail({
				from: `"CivicPulse" <${process.env.EMAIL_USER}>`,
				to: user.email,
				subject: '✉️ Verify your CivicPulse account',
				html: buildVerificationEmail(user.full_name, verifyUrl),
			});
		} catch (emailErr) {
			console.error('Resend email error:', emailErr.message);
			return res.status(500).json({ error: 'Failed to send verification email. Try again later.' });
		}

		return res.status(200).json({ message: 'Verification email sent! Check your inbox.' });
	} catch (err) {
		console.error('Resend verification error:', err.message);
		return res.status(500).json({ error: 'Something went wrong. Try again later.' });
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
			`SELECT id, full_name, email, password_hash, role, ward_id, is_active, is_verified
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

		// ─── Check email verification ─────────────────────────
		if (!user.is_verified) {
			return res.status(403).json({
				error: 'Please verify your email before logging in. Check your inbox for a verification link.',
				needsVerification: true,
				email: user.email,
			});
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
				id: user.id,
				full_name: user.full_name,
				email: user.email,
				role: user.role,
				ward_id: user.ward_id,
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

module.exports = { register, login, getMe, verifyEmail, resendVerification };
