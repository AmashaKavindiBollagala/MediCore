const pool = require('../config/appointmentdb');

class AppointmentService {
  // Search doctors by specialty
  async searchDoctorsBySpecialty(specialty) {
    const query = `
      SELECT d.id, d.full_name, d.specialty, d.verified,
             a.day_of_week, a.start_time, a.end_time, a.is_available
      FROM doctors.profiles d
      LEFT JOIN doctors.availability a ON d.id = a.doctor_id
      WHERE d.specialty ILIKE $1 AND d.verified = true
      ORDER BY d.full_name
    `;

    const result = await pool.query(query, [`%${specialty}%`]);
    return result.rows;
  }

  // Get doctor availability for a specific date
  async getDoctorAvailability(doctorId, date) {
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 6 = Saturday

    const query = `
      SELECT day_of_week, start_time, end_time, is_available
      FROM doctors.availability
      WHERE doctor_id = $1 AND day_of_week = $2 AND is_available = true
    `;

    const result = await pool.query(query, [doctorId, dayOfWeek]);
    return result.rows;
  }

  // Book a new appointment
  async bookAppointment(appointmentData, patientId) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const { doctor_id, scheduled_at, consultation_type, symptoms, specialty } = appointmentData;

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
          (patient_id, doctor_id, scheduled_at, consultation_type, symptoms, specialty, status)
        VALUES ($1, $2, $3, $4, $5, $6, 'PENDING_PAYMENT')
        RETURNING *
      `;

      const result = await client.query(insertQuery, [
        patientId,
        doctor_id,
        scheduled_at,
        consultation_type || 'video',
        symptoms || '',
        specialty || '',
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
      SELECT a.*,
             d.full_name as doctor_name, d.specialty
      FROM public.appointments a
      JOIN doctors.profiles d ON a.doctor_id = d.id
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
      SELECT a.*,
             p.full_name as patient_name, p.phone as patient_phone
      FROM public.appointments a
      JOIN patients.profiles p ON a.patient_id = p.id
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
      SELECT a.*,
             d.full_name as doctor_name, d.specialty,
             p.full_name as patient_name, p.phone as patient_phone
      FROM public.appointments a
      LEFT JOIN doctors.profiles d ON a.doctor_id = d.id
      LEFT JOIN patients.profiles p ON a.patient_id = p.id
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
