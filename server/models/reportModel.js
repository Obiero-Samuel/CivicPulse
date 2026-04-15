const pool = require('../config/db');

// Escalate reports not resolved in 7 days
async function escalateStaleReports() {
    // Find reports in 'in_progress' or 'submitted' older than 7 days and not escalated
    const result = await pool.query(
        `UPDATE reports
       SET status = 'escalated', is_escalated = TRUE, escalated_at = NOW()
     WHERE (status = 'in_progress' OR status = 'submitted')
       AND is_escalated = FALSE
       AND created_at < NOW() - INTERVAL '7 days'
     RETURNING id, tracking_number`);
    return result.rows;
}

// Generate a unique tracking number (e.g. CP-2026-00042)
async function generateTrackingNumber() {
    const year = new Date().getFullYear();
    const result = await pool.query("SELECT nextval(pg_get_serial_sequence('reports', 'id')) AS seq");
    const seq = result.rows[0].seq;
    return `CP-${year}-${String(seq).padStart(5, '0')}`;
}

// Create a new report with tracking number (legacy)
async function createReportWithTracking(report) {
    const tracking_number = await generateTrackingNumber();
    const result = await pool.query(
        `INSERT INTO reports (tracking_number, title, description, category_id, ward_id, resident_id, latitude, longitude)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [tracking_number, report.title, report.description, report.category_id, report.ward_id, report.resident_id, report.latitude, report.longitude]
    );
    return result.rows[0];
}

// Advanced/modern createReport
const createReport = async (data) => {
    const { title, description, category_id, ward_id, user_id, latitude, longitude, address } = data;
    const result = await pool.query(
        `INSERT INTO reports
         (title, description, category_id, ward_id, user_id, latitude, longitude, address, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'open')
     RETURNING *`,
        [title, description, category_id, ward_id, user_id, latitude, longitude, address || null]
    );
    return result.rows[0];

    const getAllReports = async (filters = {}) => {
        const { ward_id, status, category_id, authority_id, limit = 50, offset = 0 } = filters;
        const conditions = [];
        const values = [];
        let i = 1;

        if (ward_id) { conditions.push(`r.ward_id = $${i++}`); values.push(ward_id); }
        if (status) { conditions.push(`r.status = $${i++}`); values.push(status); }
        if (category_id) { conditions.push(`r.category_id = $${i++}`); values.push(category_id); }
        if (authority_id) { conditions.push(`r.authority_id = $${i++}`); values.push(authority_id); }

        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const result = await pool.query(
            `SELECT
         r.id, r.title, r.description, r.status, r.address,
         r.latitude, r.longitude, r.created_at, r.updated_at,
         u.full_name  AS submitted_by,
         w.name       AS ward_name,
         c.name       AS category_name,
         a.name       AS authority_name,
         COUNT(uv.id) AS upvote_count
     FROM reports r
     LEFT JOIN users       u  ON r.user_id       = u.id
     LEFT JOIN wards       w  ON r.ward_id        = w.id
     LEFT JOIN categories  c  ON r.category_id    = c.id
     LEFT JOIN authorities a  ON r.authority_id   = a.id
     LEFT JOIN upvotes     uv ON r.id             = uv.report_id
     ${where}
     GROUP BY r.id, u.full_name, w.name, c.name, a.name
     ORDER BY r.created_at DESC
     LIMIT $${i++} OFFSET $${i++}`,
            [...values, limit, offset]
        );
        return result.rows;
    };

    const getReportById = async (id) => {
        const result = await pool.query(
            `SELECT
         r.*,
         u.full_name  AS submitted_by,
         w.name       AS ward_name,
         c.name       AS category_name,
         a.name       AS authority_name,
         a.contact_email AS authority_email,
         COUNT(uv.id) AS upvote_count
     FROM reports r
     LEFT JOIN users       u  ON r.user_id      = u.id
     LEFT JOIN wards       w  ON r.ward_id       = w.id
     LEFT JOIN categories  c  ON r.category_id   = c.id
     LEFT JOIN authorities a  ON r.authority_id  = a.id
     LEFT JOIN upvotes     uv ON r.id            = uv.report_id
     WHERE r.id = $1
     GROUP BY r.id, u.full_name, w.name, c.name, a.name, a.contact_email`,
            [id]
        );
        return result.rows[0] || null;
    };

    const updateReportStatus = async (id, status, authority_id) => {
        const updates = ['status = $2', 'updated_at = NOW()'];
        const values = [id, status];
        if (authority_id) { updates.push(`authority_id = $${values.length + 1}`); values.push(authority_id); }
        const result = await pool.query(
            `UPDATE reports SET ${updates.join(', ')} WHERE id = $1 RETURNING *`,
            values
        );
        return result.rows[0] || null;
    };

    const getReportsByUser = async (user_id) => {
        const result = await pool.query(
            `SELECT r.id, r.title, r.status, r.created_at,
            c.name AS category_name, w.name AS ward_name,
            COUNT(uv.id) AS upvote_count
     FROM reports r
     LEFT JOIN categories c  ON r.category_id = c.id
     LEFT JOIN wards      w  ON r.ward_id      = w.id
     LEFT JOIN upvotes    uv ON r.id           = uv.report_id
     WHERE r.user_id = $1
     GROUP BY r.id, c.name, w.name
     ORDER BY r.created_at DESC`,
            [user_id]
        );
        return result.rows;
    };

    const addStatusHistory = async (report_id, changed_by, old_status, new_status, note) => {
        await pool.query(
            `INSERT INTO report_status_history
         (report_id, changed_by, old_status, new_status, note)
     VALUES ($1,$2,$3,$4,$5)`,
            [report_id, changed_by, old_status, new_status, note || null]
        );
    };

    const getStatusHistory = async (report_id) => {
        const result = await pool.query(
            `SELECT rsh.*, u.full_name AS changed_by_name
     FROM report_status_history rsh
     LEFT JOIN users u ON rsh.changed_by = u.id
     WHERE rsh.report_id = $1
     ORDER BY rsh.changed_at ASC`,
            [report_id]
        );
        return result.rows;
    };

    const upvoteReport = async (report_id, user_id) => {
        const exists = await pool.query(
            'SELECT id FROM upvotes WHERE report_id = $1 AND user_id = $2',
            [report_id, user_id]
        );
        if (exists.rows.length > 0) return { alreadyVoted: true };
        await pool.query(
            'INSERT INTO upvotes (report_id, user_id) VALUES ($1, $2)',
            [report_id, user_id]
        );
        return { alreadyVoted: false };
    };

    const getMapReports = async (ward_id) => {
        const where = ward_id ? 'WHERE r.ward_id = $1 AND r.latitude IS NOT NULL' : 'WHERE r.latitude IS NOT NULL';
        const values = ward_id ? [ward_id] : [];
        const result = await pool.query(
            `SELECT r.id, r.title, r.status, r.latitude, r.longitude,
            c.name AS category_name, w.name AS ward_name
     FROM reports r
     LEFT JOIN categories c ON r.category_id = c.id
     LEFT JOIN wards      w ON r.ward_id      = w.id
     ${where}
     ORDER BY r.created_at DESC
     LIMIT 200`,
            values
        );
        return result.rows;
    };

    module.exports = {
        escalateStaleReports,
        generateTrackingNumber,
        createReportWithTracking,
        createReport,
        getAllReports,
        getReportById,
        updateReportStatus,
        getReportsByUser,
        addStatusHistory,
        getStatusHistory,
        upvoteReport,
        getMapReports,
    };
};
