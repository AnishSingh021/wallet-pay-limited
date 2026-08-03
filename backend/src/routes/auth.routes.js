const express = require('express');
const router = express.Router();
const { register, login, refresh, logout, firebaseAuth } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validators/auth.validators');

// POST /api/auth/register
router.post('/register', validate({ body: registerSchema }), register);

// POST /api/auth/login
router.post('/login', validate({ body: loginSchema }), login);

// POST /api/auth/refresh
router.post('/refresh', refresh);

// POST /api/auth/logout
router.post('/logout', authenticate, logout);

// POST /api/auth/firebase
router.post('/firebase', firebaseAuth);

module.exports = router;
