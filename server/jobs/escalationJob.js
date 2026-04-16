const cron = require('node-cron');
const pool = require('../config/db');

const runEscalation = async () => {
  try {
    // Capture old_status via RETURNING so the history log is accurate
    const result = await pool.query(
      `UPDATE reports
       SET status     = 'escalated',
           is_escalated = TRUE,
           escalated_at = NOW(),
           updated_at = NOW()
       WHERE status IN ('open', 'in_progress')
         AND is_escalated = FALSE
         AND updated_at < NOW() - INTERVAL '7 days'
       RETURNING id, tracking_number, title,
                 (SELECT status FROM reports WHERE id = reports.id) AS old_status`
    );

    if (result.rows.length > 0) {
      console.log(`[Escalation] ${result.rows.length} report(s) auto-escalated:`);

      for (const r of result.rows) {
        console.log(`  → ${r.tracking_number || r.id} — ${r.title}`);

        // Log each escalation in status history (changed_by NULL = system action)
        await pool.query(
          `INSERT INTO report_status_history
             (report_id, changed_by, old_status, new_status, note)
           VALUES ($1, NULL, $2, 'escalated',
             'Auto-escalated: no authority response within 7 days.')`,
          [r.id, r.old_status || 'open']
        );
      }
    } else {
      console.log('[Escalation] No reports to escalate.');
    }
  } catch (err) {
    console.error('[Escalation] Job failed:', err.message);
  }
};

const startEscalationJob = () => {
  // Runs every day at 6:00 AM East Africa Time
  cron.schedule('0 6 * * *', () => {
    console.log('[Escalation] Running daily escalation check...');
    runEscalation();
  });

  console.log('[Escalation] Job scheduled — daily at 06:00.');
};

module.exports = { startEscalationJob, runEscalation };
