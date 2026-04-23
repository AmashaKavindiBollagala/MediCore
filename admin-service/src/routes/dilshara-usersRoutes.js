// admin-service/src/routes/dilshara-usersRoutes.js

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/dilshara-usersController');

// GET /admin/users/stats - Get user statistics
router.get('/stats', controller.getUserStats);

// GET /admin/users?role=all|patient|doctor|admin&status=all|active|suspended|banned&search=email
router.get('/', controller.getUsers);

// GET /admin/users/:id - Get single user details
router.get('/:id', controller.getUserById);

// PUT /admin/users/:id/suspend - Suspend user
router.put('/:id/suspend', controller.suspendUser);

// PUT /admin/users/:id/activate - Activate suspended user
router.put('/:id/activate', controller.activateUser);

// PUT /admin/users/:id/ban - Ban user permanently
router.put('/:id/ban', controller.banUser);

module.exports = router;