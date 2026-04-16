const express = require('express');
const router = express.Router();


const { getUsers, toggleUserStatus } = require('../controllers/adminController');
const verifyToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

router.get('/users', verifyToken, authorizeRoles('admin'), getUsers);
router.patch('/users/:id/toggle', verifyToken, authorizeRoles('admin'), toggleUserStatus);

module.exports = router;
