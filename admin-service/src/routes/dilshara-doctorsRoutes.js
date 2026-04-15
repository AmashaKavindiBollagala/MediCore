// admin-service/src/routes/dilshara-doctorsRoutes.js

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/dilshara-doctorsController');

// GET  /admin/doctors?status=pending|approved|rejected|all
router.get('/', controller.getDoctors);

// GET  /admin/doctors/:id
router.get('/:id', controller.getDoctorById);

// PATCH /admin/doctors/:id/verify   body: { status, note }
router.patch('/:id/verify', controller.verifyDoctor);

module.exports = router;