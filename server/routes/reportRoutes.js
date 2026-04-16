const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reportController');
const verifyToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const { validateReport, validateStatusUpdate } = require('../validators/reportValidator');

// Public — map pins (no auth needed so Leaflet map loads for everyone)
router.get('/map', ctrl.getMapData);

// Resident — own reports
router.get('/my', verifyToken, ctrl.getMyReports);

// Officer — assigned reports for their authority
router.get('/assigned', verifyToken, authorizeRoles('authority_officer'), ctrl.getAssignedReports);

// Officer — all reports for their authority
router.get('/all', verifyToken, authorizeRoles('authority_officer'), ctrl.getAllAuthorityReports);

// All authenticated users — browse reports
router.get('/', verifyToken, ctrl.getReports);
router.get('/:id', verifyToken, ctrl.getReport);

// Resident — submit + upvote
router.post('/', verifyToken, authorizeRoles('resident'), validateReport, ctrl.createReport);
router.post('/:id/upvote', verifyToken, ctrl.upvoteReport);

// Authority officer + admin — update status
router.patch('/:id/status', verifyToken, authorizeRoles('authority_officer', 'admin'), validateStatusUpdate, ctrl.updateReportStatus);

module.exports = router;
