const required = [
	'PORT',
	'DB_HOST',
	'DB_PORT',
	'DB_NAME',
	'DB_USER',
	'DB_PASSWORD',
	'JWT_SECRET',
];

const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
	console.error(`❌ Missing environment variables: ${missing.join(', ')}`);
	process.exit(1);
}

module.exports = {
	port:      process.env.PORT || 5000,
	jwtSecret: process.env.JWT_SECRET,
	db: {
		host:     process.env.DB_HOST,
		port:     process.env.DB_PORT,
		name:     process.env.DB_NAME,
		user:     process.env.DB_USER,
		password: process.env.DB_PASSWORD,
	},
};
