const express      = require('express');
const router       = express.Router();
const ctrl         = require('../controllers/wardController');
const verifyToken  = require('../middleware/authMiddleware');

// All ward routes are public — the map needs wards without forcing login
router.get('/',                ctrl.getWards);
router.get('/:id',             ctrl.getWard);
router.get('/:id/reports',     verifyToken, ctrl.getWardReports);
router.get('/:id/hotspots',    ctrl.getWardHotspots);

module.exports = router;
