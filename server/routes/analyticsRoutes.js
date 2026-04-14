const express        = require('express');
const router         = express.Router();
const ctrl           = require('../controllers/analyticsController');
const verifyToken    = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// Admin only
router.get('/summary',              verifyToken, authorizeRoles('admin'), ctrl.getSummary);
router.get('/authority-performance',verifyToken, authorizeRoles('admin'), ctrl.getAuthorityPerformance);
router.get('/weekly-report',        verifyToken, authorizeRoles('admin'), ctrl.getWeeklyReport);
router.get('/categories',           verifyToken, authorizeRoles('admin'), ctrl.getCategoryBreakdown);

module.exports = router;
