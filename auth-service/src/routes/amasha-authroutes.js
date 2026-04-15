const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/amasha-authcontroller');
const { verifyToken } = require('../middleware/amasha-authmiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyToken, getMe);

module.exports = router;