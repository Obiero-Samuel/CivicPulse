const pool = require('../config/db');

// Create user with verification token
async function createUserWithVerification({ full_name, email, password_hash, ward_id, verification_token }) {
	const result = await pool.query(
		`INSERT INTO users (full_name, email, password_hash, role, ward_id, is_verified, verification_token)
		 VALUES ($1, $2, $3, 'resident', $4, FALSE, $5)
		 RETURNING id, full_name, email, role, ward_id, is_verified, verification_token, created_at` ,
		[full_name, email, password_hash, ward_id || null, verification_token]
	);
	return result.rows[0];
}

// Verify user by token
async function verifyUserByToken(token) {
	const result = await pool.query(
		`UPDATE users SET is_verified = TRUE, verification_token = NULL
		 WHERE verification_token = $1 RETURNING id, email, is_verified` ,
		[token]
	);
	return result.rows[0];
}

// Find user by email
async function findUserByEmail(email) {
	const result = await pool.query(
		'SELECT * FROM users WHERE email = $1', [email]
	);
	return result.rows[0];
}

module.exports = {
	createUserWithVerification,
	verifyUserByToken,
	findUserByEmail,
};
