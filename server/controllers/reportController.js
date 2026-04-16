const pool        = require('../config/db');
const reportModel = require('../models/reportModel');

// ════════════════════════════════════════════════════════
//  POST /api/reports  — resident submits a new report
// ════════════════════════════════════════════════════════
exports.createReport = async (req, res) => {
	const { title, description, category_id, ward_id, latitude, longitude, address } = req.body;

	try {
		// Look up which authority handles this category
		const catResult = await pool.query(
			'SELECT id, name, default_authority_id FROM categories WHERE id = $1',
			[category_id]
		);
		if (catResult.rows.length === 0) {
			return res.status(400).json({ error: 'Invalid category.' });
		}

		const category     = catResult.rows[0];
		const authority_id = category.default_authority_id || null;

		const report = await reportModel.createReport({
			title:       title.trim(),
			description: description.trim(),
			category_id,
			ward_id:     ward_id || req.user.ward_id,
			user_id:     req.user.id,
			latitude:    latitude  || null,
			longitude:   longitude || null,
			address:     address   || null,
		});

		// Assign authority immediately
		if (authority_id) {
			await pool.query(
				'UPDATE reports SET authority_id = $1 WHERE id = $2',
				[authority_id, report.id]
			);
		}


		// Log the opening entry in status history
		await reportModel.addStatusHistory(
			report.id, req.user.id, null, 'open',
			`Report submitted. Routed to: ${category.name}.`
		);

		// Emit real-time event to all connected clients
		const io = req.app.get('io');
		if (io) {
			io.emit('newReport', { ...report, authority_id });
		}

		return res.status(201).json({
			message: `Report submitted. Tracking: ${report.tracking_number}`,
			report: { ...report, authority_id },
		});

	} catch (err) {
		console.error('Submit report error:', err.message);
		return res.status(500).json({ error: 'Failed to submit report.' });
	}
};

// ════════════════════════════════════════════════════════
//  GET /api/reports  — all reports (with filters)
// ════════════════════════════════════════════════════════
exports.getReports = async (req, res) => {
	try {
		const { ward_id, status, category_id, limit, offset } = req.query;
		const filters = {};

		if (ward_id)     filters.ward_id     = ward_id;
		if (status)      filters.status      = status;
		if (category_id) filters.category_id = category_id;
		if (limit)       filters.limit       = parseInt(limit);
		if (offset)      filters.offset      = parseInt(offset);

		const reports = await reportModel.getAllReports(filters);
		return res.status(200).json({ count: reports.length, reports });

	} catch (err) {
		console.error('Get reports error:', err.message);
		return res.status(500).json({ error: 'Failed to fetch reports.' });
	}
};

// ════════════════════════════════════════════════════════
//  GET /api/reports/my  — resident's own reports
// ════════════════════════════════════════════════════════
exports.getMyReports = async (req, res) => {
	try {
		const reports = await reportModel.getReportsByUser(req.user.id);
		return res.status(200).json({ count: reports.length, reports });
	} catch (err) {
		console.error('My reports error:', err.message);
		return res.status(500).json({ error: 'Failed to fetch your reports.' });
	}
};

// ════════════════════════════════════════════════════════
//  GET /api/reports/map  — map pins (public, no auth)
// ════════════════════════════════════════════════════════
exports.getMapData = async (req, res) => {
	try {
		const reports = await reportModel.getMapReports(req.query.ward_id || null);
		return res.status(200).json({ count: reports.length, reports });
	} catch (err) {
		console.error('Map data error:', err.message);
		return res.status(500).json({ error: 'Failed to fetch map data.' });
	}
};

// ════════════════════════════════════════════════════════
//  GET /api/reports/:id  — single report + status history
// ════════════════════════════════════════════════════════
exports.getReport = async (req, res) => {
	try {
		const report = await reportModel.getReportById(req.params.id);
		if (!report) return res.status(404).json({ error: 'Report not found.' });

		const history = await reportModel.getStatusHistory(report.id);
		return res.status(200).json({ report, history });

	} catch (err) {
		console.error('Get report error:', err.message);
		return res.status(500).json({ error: 'Failed to fetch report.' });
	}
};

// ════════════════════════════════════════════════════════
//  GET /api/reports/assigned  — officer's assigned reports
// ════════════════════════════════════════════════════════
exports.getAssignedReports = async (req, res) => {
	try {
		const authorityId = req.user.authority_id;
		if (!authorityId) {
			return res.status(200).json({ reports: [] });
		}
		const reports = await reportModel.getReportsByAuthority(authorityId);
		res.json({ reports });
	} catch (err) {
		console.error('Assigned reports error:', err.message);
		res.status(500).json({ error: 'Failed to fetch assigned reports.' });
	}
};

// ════════════════════════════════════════════════════════
//  GET /api/reports/all  — all reports for officer's authority
// ════════════════════════════════════════════════════════
exports.getAllAuthorityReports = async (req, res) => {
	try {
		const authorityId = req.user.authority_id;
		const filters = authorityId ? { authority_id: authorityId } : {};
		const reports = await reportModel.getAllReports(filters);
		res.json({ reports });
	} catch (err) {
		console.error('All authority reports error:', err.message);
		res.status(500).json({ error: 'Failed to fetch reports.' });
	}
};

// ════════════════════════════════════════════════════════
//  PATCH /api/reports/:id/status  — update status (officer/admin)
// ════════════════════════════════════════════════════════
exports.updateReportStatus = async (req, res) => {
	const { status, newStatus, note } = req.body;
	const finalStatus = status || newStatus; // support both field names

	try {
		const existing = await reportModel.getReportById(req.params.id);
		if (!existing) return res.status(404).json({ error: 'Report not found.' });

		const updated = await reportModel.updateReportStatus(req.params.id, finalStatus);

		await reportModel.addStatusHistory(
			existing.id, req.user.id, existing.status, finalStatus,
			note || `Status updated to ${finalStatus}.`
		);

		return res.status(200).json({ success: true, message: 'Status updated.', report: updated });

	} catch (err) {
		console.error('Update status error:', err.message);
		return res.status(500).json({ error: 'Failed to update report status.' });
	}
};

// ════════════════════════════════════════════════════════
//  POST /api/reports/:id/upvote  — resident upvote
// ════════════════════════════════════════════════════════
exports.upvoteReport = async (req, res) => {
	try {
		const report = await reportModel.getReportById(req.params.id);
		if (!report) return res.status(404).json({ error: 'Report not found.' });

		const result = await reportModel.upvoteReport(req.params.id, req.user.id);

		if (result.alreadyVoted) {
			return res.status(409).json({ error: 'You have already upvoted this report.' });
		}

		return res.status(200).json({ message: 'Upvote recorded.' });

	} catch (err) {
		console.error('Upvote error:', err.message);
		return res.status(500).json({ error: 'Failed to record upvote.' });
	}
};
