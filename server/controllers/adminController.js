const reportModel = require('../models/reportModel');
// Admin: escalate stale reports (manual trigger)
exports.escalateStaleReports = async (req, res) => {
	try {
		const escalated = await reportModel.escalateStaleReports();
		res.json({ escalated });
	} catch (err) {
		res.status(500).json({ error: 'Failed to escalate reports.' });
	}
};
