const express = require('express');
const router = express.Router();

const { register, login, getMe, verifyEmail, resendVerification } = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');
const { validateRegister, validateLogin } = require('../validators/authValidator');

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Email verification routes
router.get('/verify/:token', verifyEmail);
router.post('/resend-verification', resendVerification);

// Protected route
router.get('/me', verifyToken, getMe);

module.exports = router;
