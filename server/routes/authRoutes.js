const express = require('express');
const router = express.Router();

const { register, login, getMe } = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');
const { validateRegister, validateLogin } = require('../validators/authValidator');

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Protected route
router.get('/me', verifyToken, getMe);

module.exports = router;
