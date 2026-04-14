const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');


// Resident: Create a new report (with tracking number)
router.post('/', auth, reportController.createReport);

// Officer: Get assigned reports
router.get('/assigned', auth, role('officer'), reportController.getAssignedReports);

// Officer: Get all reports for their authority
router.get('/all', auth, role('officer'), reportController.getAllAuthorityReports);

// Officer: Update report status and add note
router.post('/:reportId/status', auth, role('officer'), reportController.updateReportStatus);

module.exports = router;
