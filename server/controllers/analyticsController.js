const pool = require('../config/db');

exports.getOverview = async (req, res) => {
	try {
		const [reportCount, userCount, wardCount] = await Promise.all([
			pool.query('SELECT COUNT(*) FROM reports'),
			pool.query('SELECT COUNT(*) FROM users'),
			pool.query('SELECT COUNT(*) FROM wards'),
		]);
		res.json({
			reports: parseInt(reportCount.rows[0].count),
			users: parseInt(userCount.rows[0].count),
			wards: parseInt(wardCount.rows[0].count),
		});
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch analytics.' });
	}
};
