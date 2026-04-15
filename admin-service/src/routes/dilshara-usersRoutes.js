// admin-service/src/routes/dilshara-usersRoutes.js

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/dilshara-usersController');

// GET /admin/users?role=all|patient|doctor|admin
router.get('/', controller.getUsers);

module.exports = router;