const reportModel = require('../models/reportModel');

// Get all reports assigned to officer's authority
exports.getAssignedReports = async (req, res) => {
	try {
		// Officer's authority_id should come from user session or JWT
		const authorityId = req.user.authority_id;
		const reports = await reportModel.getReportsByAuthority(authorityId);
		res.json({ reports });
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch assigned reports.' });
	}
};

// Get all reports for officer's authority
exports.getAllAuthorityReports = async (req, res) => {
	try {
		const authorityId = req.user.authority_id;
		const reports = await reportModel.getAllReportsForAuthority(authorityId);
		res.json({ reports });
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch all reports.' });
	}
};

// Officer updates report status and adds note
exports.updateReportStatus = async (req, res) => {
	try {
		const { reportId } = req.params;
		const { newStatus, note } = req.body;
		const officerId = req.user.id;
		await reportModel.updateReportStatus({ reportId, newStatus, note, officerId });
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: 'Failed to update report status.' });
	}
};
