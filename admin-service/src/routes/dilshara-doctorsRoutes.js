// admin-service/src/routes/dilshara-doctorsRoutes.js

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/dilshara-doctorsController');

// GET  /admin/doctors?status=pending|approved|rejected|all
router.get('/', controller.getDoctors);

// GET  /admin/doctors/active-status  - Get all doctors with online/active status
router.get('/active-status', controller.getDoctorsActiveStatus);

// GET  /admin/doctors/:id
router.get('/:id', controller.getDoctorById);

// PATCH /admin/doctors/:id/verify   body: { status, note }
router.patch('/:id/verify', controller.verifyDoctor);

// GET  /admin/doctors/:id/availability  - View doctor availability schedule
router.get('/:id/availability', controller.getDoctorAvailability);

// PUT  /admin/doctors/:id/suspend  - Suspend/deactivate doctor account
router.put('/:id/suspend', controller.suspendDoctor);

// PUT  /admin/doctors/:id/reactivate  - Reactivate suspended doctor
router.put('/:id/reactivate', controller.reactivateDoctor);

module.exports = router;