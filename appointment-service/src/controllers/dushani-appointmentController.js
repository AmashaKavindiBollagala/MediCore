const appointmentService = require('../services/dushani-appointmentService');

class AppointmentController {

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

  async completeAppointment(req, res) {
    try {
      const { appointmentId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Only doctors can mark appointments as completed
      if (userRole !== 'doctor') {
        return res.status(403).json({ error: 'Only doctors can mark appointments as completed' });
      }

      const result = await appointmentService.updateAppointmentStatus(
        appointmentId,
        'COMPLETED',
        null
      );

      if (result.error) {
        return res.status(result.status).json({ error: result.error });
      }

      // ─── TRIGGER CONSULTATION COMPLETION NOTIFICATIONS ───────────────────
      const appointment = result.data;
      
      // Send notifications asynchronously (don't block the response)
      setImmediate(async () => {
        try {
          console.log('📧 Triggering consultation completion notifications...');
          
          const notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3000';
          const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
          const doctorServiceUrl = process.env.DOCTOR_SERVICE_URL || 'http://localhost:3003';
          
          // Fetch patient info from auth-service
          let patientInfo = null;
          try {
            const patientRes = await fetch(`${authServiceUrl}/api/auth/users/${appointment.patient_id}`);
            if (patientRes.ok) {
              patientInfo = await patientRes.json();
              console.log('✅ Patient info fetched:', patientInfo.email, patientInfo.phone);
            }
          } catch (err) {
            console.error('❌ Failed to fetch patient info:', err.message);
          }
          
          // Fetch doctor info from doctor-service
          let doctorInfo = null;
          try {
            const doctorRes = await fetch(`${doctorServiceUrl}/doctors/${appointment.doctor_id}`);
            if (doctorRes.ok) {
              const doctorData = await doctorRes.json();
              doctorInfo = doctorData.success ? doctorData.data : doctorData;
              console.log('✅ Doctor info fetched:', doctorInfo.email, doctorInfo.phone);
            }
          } catch (err) {
            console.error('❌ Failed to fetch doctor info:', err.message);
          }
          
          // Parse appointment date
          const appointmentDate = new Date(appointment.scheduled_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          
          // Send consultation completion email to patient
          if (patientInfo?.email) {
            const notificationRes = await fetch(`${notificationServiceUrl}/api/notifications/email/consultation-completion`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: patientInfo.email,
                patientName: patientInfo.name || appointment.patient_name,
                doctorName: doctorInfo?.full_name || doctorInfo?.first_name + ' ' + doctorInfo?.last_name || 'Doctor',
                date: appointmentDate,
                notes: 'Thank you for choosing MediCore. Your consultation has been completed successfully.'
              })
            });
            
            if (notificationRes.ok) {
              console.log('✅ Consultation completion notification sent');
            } else {
              console.error('❌ Failed to send completion notification:', await notificationRes.text());
            }
          }
        } catch (err) {
          console.error('❌ Consultation completion notification trigger error:', err.message);
          console.error(err.stack);
        }
      });

      res.json({
        success: true,
        message: 'Appointment marked as completed',
        data: result.data,
      });
    } catch (error) {
      console.error('Complete appointment error:', error);
      res.status(500).json({ error: 'Failed to complete appointment' });
    }
  }


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


  async checkTelemedicineEligibility(req, res) {
    try {
      const { appointmentId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      const result = await appointmentService.checkTelemedicineEligibility(
        appointmentId,
        userId,
        userRole
      );

      if (result.error) {
        return res.status(result.status).json({ error: result.error });
      }

      res.json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      console.error('Check telemedicine eligibility error:', error);
      res.status(500).json({ error: 'Failed to check telemedicine eligibility' });
    }
  }
}

module.exports = new AppointmentController();
