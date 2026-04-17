const appointmentService = require('../services/dushani-appointmentService');

class AppointmentController {
  // Search doctors by specialty
  async searchDoctors(req, res) {
    try {
      const { specialty } = req.query;

      if (!specialty) {
        return res.status(400).json({ error: 'Specialty query parameter is required' });
      }

      const doctors = await appointmentService.searchDoctorsBySpecialty(specialty);

      res.json({
        success: true,
        data: doctors,
        count: doctors.length,
      });
    } catch (error) {
      console.error('Search doctors error:', error);
      res.status(500).json({ error: 'Failed to search doctors' });
    }
  }

  // Get doctor availability
  async getDoctorAvailability(req, res) {
    try {
      const { doctorId } = req.params;
      const { date } = req.query;

      if (!date) {
        return res.status(400).json({ error: 'date query parameter is required' });
      }

      const availability = await appointmentService.getDoctorAvailability(doctorId, date);

      res.json({
        success: true,
        data: availability,
      });
    } catch (error) {
      console.error('Get availability error:', error);
      res.status(500).json({ error: 'Failed to get doctor availability' });
    }
  }

  // Book appointment
  async bookAppointment(req, res) {
    try {
      const { doctor_id, scheduled_at, consultation_type, symptoms, specialty, patient_name, patient_age, consultation_fee } = req.body;
      const patient_id = req.user.id;

      if (!doctor_id || !scheduled_at) {
        return res.status(400).json({ error: 'Doctor ID and scheduled time are required' });
      }

      const result = await appointmentService.bookAppointment(
        { doctor_id, scheduled_at, consultation_type, symptoms, specialty, patient_name, patient_age, consultation_fee },
        patient_id
      );

      if (result.error) {
        return res.status(result.status).json({ error: result.error });
      }

      res.status(201).json({
        success: true,
        message: 'Appointment created. Please proceed to payment.',
        data: result.data,
      });
    } catch (error) {
      console.error('Book appointment error:', error);
      res.status(500).json({ error: 'Failed to book appointment' });
    }
  }

  // Update appointment status
  async updateAppointmentStatus(req, res) {
    try {
      const { appointmentId } = req.params;
      const { status, payment_id } = req.body;

      const result = await appointmentService.updateAppointmentStatus(
        appointmentId,
        status,
        payment_id
      );

      if (result.error) {
        return res.status(result.status).json({ error: result.error });
      }

      res.json({
        success: true,
        message: 'Appointment status updated',
        data: result.data,
      });
    } catch (error) {
      console.error('Update status error:', error);
      res.status(500).json({ error: 'Failed to update appointment status' });
    }
  }

  // Get patient's appointments
  async getPatientAppointments(req, res) {
    try {
      const patient_id = req.user.id;
      const { status } = req.query;

      const appointments = await appointmentService.getPatientAppointments(patient_id, status);

      res.json({
        success: true,
        data: appointments,
      });
    } catch (error) {
      console.error('Get patient appointments error:', error);
      res.status(500).json({ error: 'Failed to fetch appointments' });
    }
  }

  // Get doctor's appointments
  async getDoctorAppointments(req, res) {
    try {
      const doctor_id = req.user.id;
      const { status, date } = req.query;

      const appointments = await appointmentService.getDoctorAppointments(doctor_id, {
        status,
        date
      });

      res.json({
        success: true,
        data: appointments,
      });
    } catch (error) {
      console.error('Get doctor appointments error:', error);
      res.status(500).json({ error: 'Failed to fetch appointments' });
    }
  }

  // Get single appointment
  async getAppointment(req, res) {
    try {
      const { appointmentId } = req.params;

      const appointment = await appointmentService.getAppointmentById(appointmentId);

      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      res.json({
        success: true,
        data: appointment,
      });
    } catch (error) {
      console.error('Get appointment error:', error);
      res.status(500).json({ error: 'Failed to fetch appointment' });
    }
  }

  // Cancel appointment
  async cancelAppointment(req, res) {
    try {
      const { appointmentId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;
      const { reason } = req.body;

      const result = await appointmentService.cancelAppointment(
        appointmentId,
        userId,
        userRole,
        reason
      );

      if (result.error) {
        return res.status(result.status).json({ error: result.error });
      }

      res.json({
        success: true,
        message: 'Appointment cancelled',
        data: result.data,
      });
    } catch (error) {
      console.error('Cancel appointment error:', error);
      res.status(500).json({ error: 'Failed to cancel appointment' });
    }
  }

  // Reschedule appointment
  async rescheduleAppointment(req, res) {
    try {
      const { appointmentId } = req.params;
      const { new_scheduled_at } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      if (!new_scheduled_at) {
        return res.status(400).json({ error: 'New scheduled time is required' });
      }

      const result = await appointmentService.rescheduleAppointment(
        appointmentId,
        new_scheduled_at,
        userId,
        userRole
      );

      if (result.error) {
        return res.status(result.status).json({ error: result.error });
      }

      res.json({
        success: true,
        message: 'Appointment rescheduled successfully',
        data: result.data,
      });
    } catch (error) {
      console.error('Reschedule appointment error:', error);
      res.status(500).json({ error: 'Failed to reschedule appointment' });
    }
  }

  // Reject appointment
  async rejectAppointment(req, res) {
    try {
      const { appointmentId } = req.params;
      const doctor_id = req.user.id;

      const result = await appointmentService.rejectAppointment(appointmentId, doctor_id);

      if (result.error) {
        return res.status(result.status).json({ error: result.error });
      }

      res.json({
        success: true,
        message: 'Appointment rejected',
        data: result.data,
      });
    } catch (error) {
      console.error('Reject appointment error:', error);
      res.status(500).json({ error: 'Failed to reject appointment' });
    }
  }
}

module.exports = new AppointmentController();
