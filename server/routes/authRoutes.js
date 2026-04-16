const express = require('express');
const router = express.Router();

const { register, login, getMe, verifyEmail } = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');
const { validateRegister, validateLogin } = require('../validators/authValidator');

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);


// Email verification route
router.get('/verify/:token', verifyEmail);

// Protected route
router.get('/me', verifyToken, getMe);

module.exports = router;
