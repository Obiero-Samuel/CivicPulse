const pool = require('../config/db');

// Get all reports assigned to a specific authority (for officer portal)
async function getReportsByAuthority(authorityId) {
	const result = await pool.query(
		`SELECT r.*, c.name AS category_name, w.name AS ward_name, u.full_name AS resident_name
		 FROM reports r
		 JOIN categories c ON r.category_id = c.id
		 JOIN wards w ON r.ward_id = w.id
		 JOIN users u ON r.resident_id = u.id
		 WHERE r.assigned_to = $1
		 ORDER BY r.created_at DESC`,
		[authorityId]
	);
	return result.rows;
}

// Get all reports for an authority (regardless of assignment)
async function getAllReportsForAuthority(authorityId) {
	const result = await pool.query(
		`SELECT r.*, c.name AS category_name, w.name AS ward_name, u.full_name AS resident_name
		 FROM reports r
		 JOIN categories c ON r.category_id = c.id
		 JOIN wards w ON r.ward_id = w.id
		 JOIN users u ON r.resident_id = u.id
		 WHERE c.authority_id = $1
		 ORDER BY r.created_at DESC`,
		[authorityId]
	);
	return result.rows;
}

// Update report status and add a note (resolution)
async function updateReportStatus({ reportId, newStatus, note, officerId }) {
	// Get current status
	const current = await pool.query('SELECT status FROM reports WHERE id = $1', [reportId]);
	if (!current.rows.length) throw new Error('Report not found');
	const oldStatus = current.rows[0].status;

	// Update report status
	await pool.query('UPDATE reports SET status = $1 WHERE id = $2', [newStatus, reportId]);

	// Insert into status history
	await pool.query(
		`INSERT INTO report_status_history (report_id, changed_by, old_status, new_status, note)
		 VALUES ($1, $2, $3, $4, $5)`,
		[reportId, officerId, oldStatus, newStatus, note]
	);
}

module.exports = {
	getReportsByAuthority,
	getAllReportsForAuthority,
	updateReportStatus,
};
