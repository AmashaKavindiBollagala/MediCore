const express = require('express');
const router = express.Router();
const { register, login, getMe, getUserById } = require('../controllers/amasha-authcontroller');
const { verifyToken } = require('../middleware/amasha-authmiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyToken, getMe);
router.get('/users/:id', getUserById); // For other services to fetch user contact info

module.exports = router;