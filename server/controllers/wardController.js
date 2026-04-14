const pool = require('../config/db');

// ════════════════════════════════════════════════════════
//  GET /api/wards  — all wards (for dropdowns)
// ════════════════════════════════════════════════════════
const getWards = async (req, res) => {
	try {
		const result = await pool.query(
			`SELECT id, name, subcounty
			 FROM wards
			 ORDER BY subcounty, name`
		);
		return res.status(200).json({ count: result.rows.length, wards: result.rows });
	} catch (err) {
		console.error('Get wards error:', err.message);
		return res.status(500).json({ error: 'Failed to fetch wards.' });
	}
};

// ════════════════════════════════════════════════════════
//  GET /api/wards/:id  — single ward + its open report count
// ════════════════════════════════════════════════════════
const getWard = async (req, res) => {
	try {
		const wardResult = await pool.query(
			`SELECT w.id, w.name, w.subcounty,
							COUNT(r.id) FILTER (WHERE r.status = 'open')       AS open_reports,
							COUNT(r.id) FILTER (WHERE r.status = 'in_progress') AS in_progress_reports,
							COUNT(r.id) FILTER (WHERE r.status = 'resolved')    AS resolved_reports,
							COUNT(r.id)                                          AS total_reports
			 FROM wards w
			 LEFT JOIN reports r ON w.id = r.ward_id
			 WHERE w.id = $1
			 GROUP BY w.id`,
			[req.params.id]
		);

		if (wardResult.rows.length === 0) {
			return res.status(404).json({ error: 'Ward not found.' });
		}

		return res.status(200).json({ ward: wardResult.rows[0] });
	} catch (err) {
		console.error('Get ward error:', err.message);
		return res.status(500).json({ error: 'Failed to fetch ward.' });
	}
};

// ════════════════════════════════════════════════════════
//  GET /api/wards/:id/reports  — all reports in a ward
// ════════════════════════════════════════════════════════
const getWardReports = async (req, res) => {
	try {
		const { status, limit = 50, offset = 0 } = req.query;

		const conditions = ['r.ward_id = $1'];
		const values     = [req.params.id];
		let i = 2;

		if (status) { conditions.push(`r.status = $${i++}`); values.push(status); }

		const result = await pool.query(
			`SELECT r.id, r.title, r.status, r.address,
							r.latitude, r.longitude, r.created_at,
							c.name  AS category_name,
							a.name  AS authority_name,
							COUNT(uv.id) AS upvote_count
			 FROM reports r
			 LEFT JOIN categories  c  ON r.category_id  = c.id
			 LEFT JOIN authorities a  ON r.authority_id = a.id
			 LEFT JOIN upvotes     uv ON r.id           = uv.report_id
			 WHERE ${conditions.join(' AND ')}
			 GROUP BY r.id, c.name, a.name
			 ORDER BY r.created_at DESC
			 LIMIT $${i++} OFFSET $${i++}`,
			[...values, parseInt(limit), parseInt(offset)]
		);

		return res.status(200).json({ count: result.rows.length, reports: result.rows });
	} catch (err) {
		console.error('Ward reports error:', err.message);
		return res.status(500).json({ error: 'Failed to fetch ward reports.' });
	}
};

// ════════════════════════════════════════════════════════
//  GET /api/wards/:id/hotspots  — top recurring issue categories
// ════════════════════════════════════════════════════════
const getWardHotspots = async (req, res) => {
	try {
		const result = await pool.query(
			`SELECT c.name AS category, COUNT(r.id) AS report_count
			 FROM reports r
			 JOIN categories c ON r.category_id = c.id
			 WHERE r.ward_id = $1
			 GROUP BY c.name
			 ORDER BY report_count DESC
			 LIMIT 5`,
			[req.params.id]
		);
		return res.status(200).json({ hotspots: result.rows });
	} catch (err) {
		console.error('Hotspots error:', err.message);
		return res.status(500).json({ error: 'Failed to fetch hotspots.' });
	}
};

module.exports = { getWards, getWard, getWardReports, getWardHotspots };
