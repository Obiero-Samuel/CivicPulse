const pool = require('../config/db');

// ════════════════════════════════════════════════════════
//  GET /api/analytics/summary  — platform-wide stats
// ════════════════════════════════════════════════════════
const getSummary = async (req, res) => {
	try {
		const result = await pool.query(
			`SELECT
				 COUNT(*)                                            AS total_reports,
				 COUNT(*) FILTER (WHERE status = 'open')            AS open_reports,
				 COUNT(*) FILTER (WHERE status = 'in_progress')     AS in_progress_reports,
				 COUNT(*) FILTER (WHERE status = 'resolved')        AS resolved_reports,
				 COUNT(*) FILTER (WHERE status = 'escalated')       AS escalated_reports,
				 COUNT(*) FILTER (WHERE status = 'rejected')        AS rejected_reports,
				 ROUND(
					 COUNT(*) FILTER (WHERE status = 'resolved')::numeric
					 / NULLIF(COUNT(*), 0) * 100, 1
				 )                                                   AS resolution_rate_pct,
				 COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') AS reports_this_week
			 FROM reports`
		);

		const users = await pool.query(
			`SELECT COUNT(*) AS total_users,
							COUNT(*) FILTER (WHERE role = 'resident') AS residents,
							COUNT(*) FILTER (WHERE role = 'authority_officer') AS officers
			 FROM users WHERE is_active = true`
		);

		return res.status(200).json({
			reports: result.rows[0],
			users:   users.rows[0],
		});

	} catch (err) {
		console.error('Summary error:', err.message);
		return res.status(500).json({ error: 'Failed to fetch summary.' });
	}
};

// ════════════════════════════════════════════════════════
//  GET /api/analytics/authority-performance
//  — response rates per authority (admin view)
// ════════════════════════════════════════════════════════
const getAuthorityPerformance = async (req, res) => {
	try {
		const result = await pool.query(
			`SELECT
				 a.name                                              AS authority,
				 COUNT(r.id)                                         AS total_assigned,
				 COUNT(r.id) FILTER (WHERE r.status = 'open')       AS unresolved,
				 COUNT(r.id) FILTER (WHERE r.status = 'resolved')   AS resolved,
				 ROUND(
					 COUNT(r.id) FILTER (WHERE r.status = 'resolved')::numeric
					 / NULLIF(COUNT(r.id), 0) * 100, 1
				 )                                                   AS resolution_rate_pct,
				 MAX(r.created_at) FILTER (WHERE r.status = 'open') AS oldest_open_report
			 FROM authorities a
			 LEFT JOIN reports r ON a.id = r.authority_id
			 GROUP BY a.id, a.name
			 ORDER BY unresolved DESC`
		);

		return res.status(200).json({ performance: result.rows });

	} catch (err) {
		console.error('Authority performance error:', err.message);
		return res.status(500).json({ error: 'Failed to fetch authority performance.' });
	}
};

// ════════════════════════════════════════════════════════
//  GET /api/analytics/weekly-report
//  — the automated weekly accountability report
// ════════════════════════════════════════════════════════
const getWeeklyReport = async (req, res) => {
	try {
		const since = new Date();
		since.setDate(since.getDate() - 7);

		// New reports this week
		const newReports = await pool.query(
			`SELECT r.id, r.title, r.status, r.created_at,
							w.name AS ward, c.name AS category, a.name AS authority
			 FROM reports r
			 LEFT JOIN wards       w ON r.ward_id      = w.id
			 LEFT JOIN categories  c ON r.category_id  = c.id
			 LEFT JOIN authorities a ON r.authority_id = a.id
			 WHERE r.created_at >= $1
			 ORDER BY r.created_at DESC`,
			[since]
		);

		// Resolved this week
		const resolved = await pool.query(
			`SELECT r.id, r.title, w.name AS ward,
							a.name AS authority, r.updated_at AS resolved_at
			 FROM reports r
			 LEFT JOIN wards       w ON r.ward_id      = w.id
			 LEFT JOIN authorities a ON r.authority_id = a.id
			 WHERE r.status = 'resolved' AND r.updated_at >= $1
			 ORDER BY r.updated_at DESC`,
			[since]
		);

		// Still unresolved older than 7 days
		const overdue = await pool.query(
			`SELECT r.id, r.title, r.status, r.created_at,
							w.name AS ward, a.name AS authority,
							EXTRACT(DAY FROM NOW() - r.created_at)::int AS days_open
			 FROM reports r
			 LEFT JOIN wards       w ON r.ward_id      = w.id
			 LEFT JOIN authorities a ON r.authority_id = a.id
			 WHERE r.status IN ('open','in_progress')
				 AND r.created_at < $1
			 ORDER BY r.created_at ASC`,
			[since]
		);

		// Top wards by volume this week
		const topWards = await pool.query(
			`SELECT w.name AS ward, COUNT(r.id) AS report_count
			 FROM reports r
			 JOIN wards w ON r.ward_id = w.id
			 WHERE r.created_at >= $1
			 GROUP BY w.name
			 ORDER BY report_count DESC
			 LIMIT 5`,
			[since]
		);

		return res.status(200).json({
			period:      { from: since, to: new Date() },
			new_reports: { count: newReports.rows.length, data: newReports.rows },
			resolved:    { count: resolved.rows.length,  data: resolved.rows },
			overdue:     { count: overdue.rows.length,   data: overdue.rows },
			top_wards:   topWards.rows,
		});

	} catch (err) {
		console.error('Weekly report error:', err.message);
		return res.status(500).json({ error: 'Failed to generate weekly report.' });
	}
};

// ════════════════════════════════════════════════════════
//  GET /api/analytics/categories
//  — most reported issue types overall
// ════════════════════════════════════════════════════════
const getCategoryBreakdown = async (req, res) => {
	try {
		const result = await pool.query(
			`SELECT c.name AS category, COUNT(r.id) AS report_count,
							ROUND(COUNT(r.id)::numeric / NULLIF(SUM(COUNT(r.id)) OVER (), 0) * 100, 1) AS pct
			 FROM categories c
			 LEFT JOIN reports r ON c.id = r.category_id
			 GROUP BY c.name
			 ORDER BY report_count DESC`
		);
		return res.status(200).json({ categories: result.rows });
	} catch (err) {
		console.error('Category breakdown error:', err.message);
		return res.status(500).json({ error: 'Failed to fetch category breakdown.' });
	}
};

module.exports = {
	getSummary, getAuthorityPerformance,
	getWeeklyReport, getCategoryBreakdown,

				       FROM reports`
				    );

				    const users = await pool.query(
				      `SELECT COUNT(*) AS total_users,
				              COUNT(*) FILTER (WHERE role = 'resident') AS residents,
				              COUNT(*) FILTER (WHERE role = 'authority_officer') AS officers
				       FROM users WHERE is_active = true`
				    );

				    return res.status(200).json({
				      reports: result.rows[0],
				      users:   users.rows[0],
				    });

				  } catch (err) {
				    console.error('Summary error:', err.message);
				    return res.status(500).json({ error: 'Failed to fetch summary.' });
				  }
				};

				// ════════════════════════════════════════════════════════
				//  GET /api/analytics/authority-performance
				//  — response rates per authority (admin view)
				// ════════════════════════════════════════════════════════
				const getAuthorityPerformance = async (req, res) => {
				  try {
				    const result = await pool.query(
				      `SELECT
				         a.name                                              AS authority,
				         COUNT(r.id)                                         AS total_assigned,
				         COUNT(r.id) FILTER (WHERE r.status = 'open')       AS unresolved,
				         COUNT(r.id) FILTER (WHERE r.status = 'resolved')   AS resolved,
				         ROUND(
				           COUNT(r.id) FILTER (WHERE r.status = 'resolved')::numeric
				           / NULLIF(COUNT(r.id), 0) * 100, 1
				         )                                                   AS resolution_rate_pct,
				         MAX(r.created_at) FILTER (WHERE r.status = 'open') AS oldest_open_report
				       FROM authorities a
				       LEFT JOIN reports r ON a.id = r.authority_id
				       GROUP BY a.id, a.name
				       ORDER BY unresolved DESC`
				    );

				    return res.status(200).json({ performance: result.rows });

				  } catch (err) {
				    console.error('Authority performance error:', err.message);
				    return res.status(500).json({ error: 'Failed to fetch authority performance.' });
				  }
				};

				// ════════════════════════════════════════════════════════
				//  GET /api/analytics/weekly-report
				//  — the automated weekly accountability report
				// ════════════════════════════════════════════════════════
				const getWeeklyReport = async (req, res) => {
				  try {
				    const since = new Date();
				    since.setDate(since.getDate() - 7);

				    // New reports this week
				    const newReports = await pool.query(
				      `SELECT r.id, r.title, r.status, r.created_at,
				              w.name AS ward, c.name AS category, a.name AS authority
				       FROM reports r
				       LEFT JOIN wards       w ON r.ward_id      = w.id
				       LEFT JOIN categories  c ON r.category_id  = c.id
				       LEFT JOIN authorities a ON r.authority_id = a.id
				       WHERE r.created_at >= $1
				       ORDER BY r.created_at DESC`,
				      [since]
				    );

				    // Resolved this week
				    const resolved = await pool.query(
				      `SELECT r.id, r.title, w.name AS ward,
				              a.name AS authority, r.updated_at AS resolved_at
				       FROM reports r
				       LEFT JOIN wards       w ON r.ward_id      = w.id
				       LEFT JOIN authorities a ON r.authority_id = a.id
				       WHERE r.status = 'resolved' AND r.updated_at >= $1
				       ORDER BY r.updated_at DESC`,
				      [since]
				    );

				    // Still unresolved older than 7 days
				    const overdue = await pool.query(
				      `SELECT r.id, r.title, r.status, r.created_at,
				              w.name AS ward, a.name AS authority,
				              EXTRACT(DAY FROM NOW() - r.created_at)::int AS days_open
				       FROM reports r
				       LEFT JOIN wards       w ON r.ward_id      = w.id
				       LEFT JOIN authorities a ON r.authority_id = a.id
				       WHERE r.status IN ('open','in_progress')
				         AND r.created_at < $1
				       ORDER BY r.created_at ASC`,
				      [since]
				    );

				    // Top wards by volume this week
				    const topWards = await pool.query(
				      `SELECT w.name AS ward, COUNT(r.id) AS report_count
				       FROM reports r
				       JOIN wards w ON r.ward_id = w.id
				       WHERE r.created_at >= $1
				       GROUP BY w.name
				       ORDER BY report_count DESC
				       LIMIT 5`,
				      [since]
				    );

				    return res.status(200).json({
				      period:      { from: since, to: new Date() },
				      new_reports: { count: newReports.rows.length, data: newReports.rows },
				      resolved:    { count: resolved.rows.length,  data: resolved.rows },
				      overdue:     { count: overdue.rows.length,   data: overdue.rows },
				      top_wards:   topWards.rows,
				    });

				  } catch (err) {
				    console.error('Weekly report error:', err.message);
				    return res.status(500).json({ error: 'Failed to generate weekly report.' });
				  }
				};

				// ════════════════════════════════════════════════════════
				//  GET /api/analytics/categories
				//  — most reported issue types overall
				// ════════════════════════════════════════════════════════
				const getCategoryBreakdown = async (req, res) => {
				  try {
				    const result = await pool.query(
				      `SELECT c.name AS category, COUNT(r.id) AS report_count,
				              ROUND(COUNT(r.id)::numeric / NULLIF(SUM(COUNT(r.id)) OVER (), 0) * 100, 1) AS pct
				       FROM categories c
				       LEFT JOIN reports r ON c.id = r.category_id
				       GROUP BY c.name
				       ORDER BY report_count DESC`
				    );
				    return res.status(200).json({ categories: result.rows });
				  } catch (err) {
				    console.error('Category breakdown error:', err.message);
				    return res.status(500).json({ error: 'Failed to fetch category breakdown.' });
				  }
				};

				module.exports = {
				  getSummary, getAuthorityPerformance,
				  getWeeklyReport, getCategoryBreakdown,
				};
