const pool = require('../config/appointmentdb');

class AppointmentService {
  // Search doctors by specialty - calls doctor service API
  async searchDoctorsBySpecialty(specialty) {
    try {
      // Call doctor service API to get approved doctors
      const doctorServiceUrl = process.env.DOCTOR_SERVICE_URL || 'http://localhost:3003';
      
      const response = await fetch(
        `${doctorServiceUrl}/api/doctors?specialty=${encodeURIComponent(specialty)}`
      );
      
      if (!response.ok) {
        console.error('Failed to fetch doctors from doctor service');
        return [];
      }
      
      const doctors = await response.json();
      
      // For each doctor, fetch their availability
      const doctorsWithAvailability = await Promise.all(
        doctors.map(async (doctor) => {
          try {
            const availResponse = await fetch(
              `${doctorServiceUrl}/api/doctors/${doctor.id}/availability`
            );
            
            if (availResponse.ok) {
              const availability = await availResponse.json();
              return {
                ...doctor,
                availability: availability
              };
            }
          } catch (err) {
            console.error(`Failed to fetch availability for doctor ${doctor.id}:`, err);
          }
          
          return {
            ...doctor,
            availability: []
          };
        })
      );
      
      return doctorsWithAvailability;
    } catch (error) {
      console.error('Search doctors error:', error);
      return [];
    }
  }

  // Get doctor availability for a specific date
  async getDoctorAvailability(doctorId, date) {
    try {
      const doctorServiceUrl = process.env.DOCTOR_SERVICE_URL || 'http://localhost:3003';
      
      const response = await fetch(
        `${doctorServiceUrl}/api/doctors/${doctorId}/availability?date=${encodeURIComponent(date)}`
      );
      
      if (!response.ok) {
        console.error('Failed to fetch doctor availability');
        return [];
      }
      
      const availability = await response.json();
      return availability;
    } catch (error) {
      console.error('Get availability error:', error);
      return [];
    }
  }

  // Book a new appointment
  async bookAppointment(appointmentData, patientId) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const { doctor_id, scheduled_at, consultation_type, symptoms, specialty, patient_name, patient_age, consultation_fee } = appointmentData;

      // Check if slot is already booked
      const conflictQuery = `
        SELECT id FROM public.appointments
        WHERE doctor_id = $1
          AND scheduled_at = $2
          AND status IN ('PENDING_PAYMENT', 'CONFIRMED')
      `;
      const conflictResult = await client.query(conflictQuery, [doctor_id, scheduled_at]);

      if (conflictResult.rows.length > 0) {
        await client.query('ROLLBACK');
        return { error: 'This time slot is already booked', status: 409 };
      }

      const insertQuery = `
        INSERT INTO public.appointments
          (patient_id, doctor_id, scheduled_at, consultation_type, symptoms, specialty, patient_name, patient_age, consultation_fee, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'PENDING_PAYMENT')
        RETURNING *
      `;

      const result = await client.query(insertQuery, [
        patientId,
        doctor_id,
        scheduled_at,
        consultation_type || 'video',
        symptoms || '',
        specialty || '',
        patient_name || '',
        patient_age ? parseInt(patient_age) : null,
        consultation_fee ? parseFloat(consultation_fee) : null,
      ]);

      await client.query('COMMIT');
      return { success: true, data: result.rows[0] };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Update appointment status
  async updateAppointmentStatus(appointmentId, status, paymentId) {
    const validStatuses = ['PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return { error: 'Invalid status', status: 400 };
    }

    const query = `
      UPDATE public.appointments
      SET status = $1, payment_id = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;

    const result = await pool.query(query, [status, paymentId || null, appointmentId]);

    if (result.rows.length === 0) {
      return { error: 'Appointment not found', status: 404 };
    }

    return { success: true, data: result.rows[0] };
  }

  // Get patient's appointments
  async getPatientAppointments(patientId, status) {
    let query = `
      SELECT a.*
      FROM public.appointments a
      WHERE a.patient_id = $1
    `;

    const params = [patientId];

    if (status) {
      query += ' AND a.status = $2';
      params.push(status);
    }

    query += ' ORDER BY a.scheduled_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  // Get doctor's appointments
  async getDoctorAppointments(doctorId, filters) {
    const { status, date } = filters;

    let query = `
      SELECT a.*
      FROM public.appointments a
      WHERE a.doctor_id = $1
    `;

    const params = [doctorId];

    if (status) {
      query += ' AND a.status = $' + (params.length + 1);
      params.push(status);
    }

    if (date) {
      query += ' AND DATE(a.scheduled_at) = $' + (params.length + 1);
      params.push(date);
    }

    query += ' ORDER BY a.scheduled_at ASC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  // Get single appointment by ID
  async getAppointmentById(appointmentId) {
    const query = `
      SELECT a.*
      FROM public.appointments a
      WHERE a.id = $1
    `;

    const result = await pool.query(query, [appointmentId]);
    return result.rows[0];
  }

  // Cancel appointment
  async cancelAppointment(appointmentId, userId, userRole, reason) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const appointment = await this.getAppointmentById(appointmentId);

      if (!appointment) {
        await client.query('ROLLBACK');
        return { error: 'Appointment not found', status: 404 };
      }

      // Verify authorization
      if (userRole === 'patient' && appointment.patient_id !== userId) {
        await client.query('ROLLBACK');
        return { error: 'Not authorized', status: 403 };
      }

      if (userRole === 'doctor' && appointment.doctor_id !== userId) {
        await client.query('ROLLBACK');
        return { error: 'Not authorized', status: 403 };
      }

      // Update appointment status
      const updateQuery = `
        UPDATE public.appointments
        SET status = 'CANCELLED', cancelled_by = $2, cancellation_reason = $3, updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;

      const result = await client.query(updateQuery, [
        appointmentId,
        userRole,
        reason || '',
      ]);

      // If payment was confirmed, trigger refund via payment service
      if (appointment.payment_id && appointment.status === 'CONFIRMED') {
        try {
          const paymentServiceUrl = process.env.PAYMENT_SERVICE_URL || 'http://localhost:3005';
          
          const refundResponse = await fetch(
            `${paymentServiceUrl}/api/payments/${appointment.payment_id}/refund`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                reason: reason || `Appointment cancelled by ${userRole}`,
              }),
            }
          );

          if (refundResponse.ok) {
            console.log(`Refund processed for appointment ${appointmentId}, payment ${appointment.payment_id}`);
          } else {
            console.error(`Failed to process refund for payment ${appointment.payment_id}`);
          }
        } catch (refundError) {
          console.error('Error processing refund:', refundError);
          // Don't fail the cancellation if refund fails - it can be processed manually
        }
      }

      await client.query('COMMIT');
      return { success: true, data: result.rows[0] };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Reschedule appointment
  async rescheduleAppointment(appointmentId, newScheduledAt, userId, userRole) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const appointment = await this.getAppointmentById(appointmentId);

      if (!appointment) {
        await client.query('ROLLBACK');
        return { error: 'Appointment not found', status: 404 };
      }

      // Only the patient who owns the appointment can reschedule
      if (userRole === 'patient' && appointment.patient_id !== userId) {
        await client.query('ROLLBACK');
        return { error: 'Not authorized', status: 403 };
      }

      // Check new slot availability
      const conflictQuery = `
        SELECT id FROM public.appointments
        WHERE doctor_id = $1
          AND scheduled_at = $2
          AND status IN ('PENDING_PAYMENT', 'CONFIRMED')
          AND id != $3
      `;
      const conflictResult = await client.query(conflictQuery, [
        appointment.doctor_id,
        newScheduledAt,
        appointmentId
      ]);

      if (conflictResult.rows.length > 0) {
        await client.query('ROLLBACK');
        return { error: 'This time slot is already booked', status: 409 };
      }

      const result = await client.query(
        `UPDATE public.appointments
         SET scheduled_at = $2, updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [appointmentId, newScheduledAt]
      );

      await client.query('COMMIT');
      return { success: true, data: result.rows[0] };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Reject appointment (doctor only)
  async rejectAppointment(appointmentId, doctorId) {
    const query = `
      UPDATE public.appointments
      SET status = 'REJECTED', updated_at = NOW()
      WHERE id = $1 AND doctor_id = $2 AND status = 'PENDING_PAYMENT'
      RETURNING *
    `;

    const result = await pool.query(query, [appointmentId, doctorId]);

    if (result.rows.length === 0) {
      return { error: 'Appointment not found or cannot be rejected', status: 404 };
    }

    return { success: true, data: result.rows[0] };
  }
}

module.exports = new AppointmentService();
