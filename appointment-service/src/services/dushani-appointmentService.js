const pool = require('../config/appointmentdb');

class AppointmentService {

  async searchDoctorsBySpecialty(specialty) {
    try {

      const doctorServiceUrl = process.env.DOCTOR_SERVICE_URL || 'http://localhost:3003';
      
      const response = await fetch(
        `${doctorServiceUrl}/doctors?specialty=${encodeURIComponent(specialty)}`
      );
      
      if (!response.ok) {
        console.error('Failed to fetch doctors from doctor service');
        return [];
      }
      
      const doctors = await response.json();
      

      const doctorsWithAvailability = await Promise.all(
        doctors.map(async (doctor) => {
          try {
            console.log(`Fetching availability from: ${doctorServiceUrl}/doctors/${doctor.id}/availability`);
            const availResponse = await fetch(
              `${doctorServiceUrl}/doctors/${doctor.id}/availability`
            );
            
            if (availResponse.ok) {
              const availability = await availResponse.json();
              console.log(`Fetched ${availability.length} slots for doctor ${doctor.id}`);
              return {
                ...doctor,
                availability: availability
              };
            } else {
              console.error(`Failed to fetch availability (status ${availResponse.status}) for ${doctor.id}`);
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


  async getDoctorAvailability(doctorId, date) {
    try {
      const doctorServiceUrl = process.env.DOCTOR_SERVICE_URL || 'http://localhost:3003';
      
      const response = await fetch(
        `${doctorServiceUrl}/doctors/${doctorId}/availability?date=${encodeURIComponent(date)}`
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


  async bookAppointment(appointmentData, patientId) {
    const client = await pool.connect();

    try {
      console.log('Booking appointment with data:', appointmentData);
      console.log('Patient ID:', patientId);
      
      await client.query('BEGIN');

      const { doctor_id, scheduled_at, consultation_type, symptoms, specialty, patient_name, patient_age, consultation_fee } = appointmentData;


      const doctorServiceUrl = process.env.DOCTOR_SERVICE_URL || 'http://doctor-service:3000';
      let correctConsultationFee = consultation_fee ? parseFloat(consultation_fee) : 0;
      
      try {
        const doctorResponse = await fetch(`${doctorServiceUrl}/doctors/${doctor_id}`);
        if (doctorResponse.ok) {
          const doctorData = await doctorResponse.json();
          const doctor = doctorData.success ? doctorData.data : doctorData;
          

          if (consultation_type === 'video' || consultation_type === 'online') {
            correctConsultationFee = doctor.consultation_fee_online || correctConsultationFee;
          } else if (consultation_type === 'physical') {
            correctConsultationFee = doctor.consultation_fee_physical || correctConsultationFee;
          }
          
          console.log('Doctor consultation fees:', {
            online: doctor.consultation_fee_online,
            physical: doctor.consultation_fee_physical,
            selected: correctConsultationFee,
            type: consultation_type
          });
        }
      } catch (err) {
        console.error('Warning: Could not fetch doctor details for consultation fee:', err.message);
      }



      // Use the patient ID as-is (auth-service uses integer IDs, not UUIDs)
      const finalPatientId = patientId.toString();


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
        finalPatientId,
        doctor_id,
        scheduled_at,
        consultation_type || 'video',
        symptoms || '',
        specialty || '',
        patient_name || '',
        patient_age ? parseInt(patient_age) : null,
        correctConsultationFee,  
      ]);

      await client.query('COMMIT');
      
      const appointment = result.rows[0];
      
      console.log('\n=== APPOINTMENT CREATED SUCCESSFULLY ===');
      console.log('Appointment ID:', appointment.id);
      console.log('Patient ID:', finalPatientId);
      console.log('Doctor ID:', doctor_id);
      console.log('Scheduled at:', appointment.scheduled_at);
      console.log('=========================================\n');
      
      // ─── TRIGGER APPOINTMENT BOOKING NOTIFICATIONS ───────────────────
      // Send notifications asynchronously (don't block the response)
      console.log('🚀 About to trigger notifications...');
      
      setImmediate(async () => {
        try {
          console.log('\n📧 Triggering appointment booking notifications...');
          
          const notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3000';
          const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
          const doctorServiceUrl = process.env.DOCTOR_SERVICE_URL || 'http://localhost:3003';
          
          // Fetch patient info from auth-service
          let patientInfo = null;
          try {
            console.log(`📡 Fetching patient info from: ${authServiceUrl}/api/auth/users/${finalPatientId}`);
            const patientRes = await fetch(`${authServiceUrl}/api/auth/users/${finalPatientId}`);
            if (patientRes.ok) {
              patientInfo = await patientRes.json();
              console.log('✅ Patient info fetched:', patientInfo.email, patientInfo.phone);
            } else {
              console.log(`⚠️  Auth-service returned ${patientRes.status} - will try alternative method`);
            }
          } catch (err) {
            console.error('❌ Failed to fetch patient info:', err.message);
            console.log('💡 Tip: Make sure auth-service is running on port 3001');
          }
          
          // Fetch doctor info from doctor-service
          let doctorInfo = null;
          try {
            console.log(`📡 Fetching doctor info from: ${doctorServiceUrl}/doctors/${doctor_id}`);
            const doctorRes = await fetch(`${doctorServiceUrl}/doctors/${doctor_id}`);
            if (doctorRes.ok) {
              const doctorData = await doctorRes.json();
              doctorInfo = doctorData.success ? doctorData.data : doctorData;
              console.log('✅ Doctor info fetched:', doctorInfo.email, doctorInfo.phone);
            } else {
              console.log(`⚠️  Doctor-service returned ${doctorRes.status}`);
            }
          } catch (err) {
            console.error('❌ Failed to fetch doctor info:', err.message);
            console.log('💡 Tip: Make sure doctor-service is running on port 3003');
          }
          
          // If patient info not available, use appointment data as fallback
          if (!patientInfo?.email) {
            console.log('⚠️  Patient email not available from auth-service');
            console.log('💡 Using fallback: Check if patient_email column exists in appointments table');
          }
          
          // If doctor info not available, use minimal data
          if (!doctorInfo?.email) {
            console.log('⚠️  Doctor email not available from doctor-service');
            console.log('💡 Notification will be sent with limited doctor info');
          }
          
          // Only send notifications if we have at least one email
          if (patientInfo?.email || doctorInfo?.email) {
            // Parse appointment date and time
            const appointmentDate = new Date(appointment.scheduled_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
            const appointmentTime = new Date(appointment.scheduled_at).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            });
            
            console.log('\n📨 Sending notification request...');
            console.log(`   Patient Email: ${patientInfo?.email || 'NOT AVAILABLE'}`);
            console.log(`   Doctor Email: ${doctorInfo?.email || 'NOT AVAILABLE'}`);
            console.log(`   Appointment ID: ${appointment.id}`);
            console.log(`   Date: ${appointmentDate} ${appointmentTime}`);
            
            const notificationRes = await fetch(`${notificationServiceUrl}/api/notifications/appointment-booking`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                patientEmail: patientInfo?.email || null,
                patientPhone: patientInfo?.phone || null,
                patientName: patientInfo?.name || appointment.patient_name || 'Patient',
                doctorEmail: doctorInfo?.email || null,
                doctorPhone: doctorInfo?.phone || null,
                doctorName: doctorInfo?.full_name || doctorInfo?.first_name + ' ' + doctorInfo?.last_name || 'Doctor',
                appointmentId: appointment.id,
                appointmentDate,
                appointmentTime,
                amount: appointment.consultation_fee
              })
            });
            
            if (notificationRes.ok) {
              const notificationResult = await notificationRes.json();
              console.log('✅ Appointment booking notifications sent successfully!');
              console.log('   Jobs queued:', notificationResult.jobsQueued);
              console.log('   Details:', JSON.stringify(notificationResult.jobs, null, 2));
            } else {
              const errorText = await notificationRes.text();
              console.error('❌ Failed to send booking notifications');
              console.error('   Error:', errorText);
            }
          } else {
            console.log('\n⚠️  SKIPPING NOTIFICATIONS: No email addresses available');
            console.log('   To fix this, ensure:');
            console.log('   1. Auth-service is running (port 3001)');
            console.log('   2. Doctor-service is running (port 3003)');
            console.log('   3. Patient has an email in the users table');
            console.log('   4. Doctor has an email in the doctors table');
          }
        } catch (err) {
          console.error('❌ Appointment booking notification trigger error:', err.message);
          console.error(err.stack);
        }
      });
      
      return { success: true, data: appointment };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }


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


  async getPatientAppointments(patientId, status) {

    // Use the patient ID as-is (auth-service uses integer IDs, not UUIDs)
    const finalPatientId = patientId.toString();

    let query = `
      SELECT a.*
      FROM public.appointments a
      WHERE a.patient_id = $1
    `;

    const params = [finalPatientId];

    if (status) {
      query += ' AND a.status = $2';
      params.push(status);
    }

    query += ' ORDER BY a.scheduled_at DESC';

    const result = await pool.query(query, params);
    const appointments = result.rows;


    const doctorServiceUrl = process.env.DOCTOR_SERVICE_URL || 'http://doctor-service:3000';
    
    const enrichedAppointments = await Promise.all(
      appointments.map(async (appointment) => {
        try {

          const doctorResponse = await fetch(`${doctorServiceUrl}/doctors/${appointment.doctor_id}`);
          
          if (doctorResponse.ok) {
            const doctorData = await doctorResponse.json();
            const doctor = doctorData.success ? doctorData.data : doctorData;
            

            let correctFee = appointment.consultation_fee;
            if (appointment.consultation_type === 'video' || appointment.consultation_type === 'online') {
              correctFee = doctor.consultation_fee_online || appointment.consultation_fee;
            } else if (appointment.consultation_type === 'physical') {
              correctFee = doctor.consultation_fee_physical || appointment.consultation_fee;
            }
            
            return {
              ...appointment,
              doctor_name: doctor.full_name || doctor.first_name + ' ' + doctor.last_name,
              doctor_specialty: doctor.specialty,
              doctor_photo: doctor.profile_photo_url,
              consultation_fee: correctFee,
            };
          }
        } catch (err) {
          console.error('Error fetching doctor details:', err.message);
        }
        

        return {
          ...appointment,
          doctor_name: appointment.doctor_name || 'Unknown Doctor',
        };
      })
    );

    return enrichedAppointments;
  }


  async getDoctorAppointments(doctorId, filters) {
    const { status, date } = filters;

    let query = `
      SELECT a.*
      FROM public.appointments a
      WHERE a.doctor_id = $1
        AND a.status NOT IN ('CANCELLED', 'PENDING_PAYMENT')
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


  async getAppointmentById(appointmentId) {
    const query = `
      SELECT a.*
      FROM public.appointments a
      WHERE a.id = $1
    `;

    const result = await pool.query(query, [appointmentId]);
    const appointment = result.rows[0];
    
    if (!appointment) {
      return null;
    }
    
    // Enrich with doctor details
    try {
      const doctorServiceUrl = process.env.DOCTOR_SERVICE_URL || 'http://doctor-service:3000';
      const doctorResponse = await fetch(`${doctorServiceUrl}/doctors/${appointment.doctor_id}`);
      
      if (doctorResponse.ok) {
        const doctorData = await doctorResponse.json();
        const doctor = doctorData.success ? doctorData.data : doctorData;
        
        return {
          ...appointment,
          doctor_name: doctor.full_name || (doctor.first_name + ' ' + doctor.last_name),
          doctor_specialty: doctor.specialty,
          doctor_photo: doctor.profile_photo_url,
        };
      }
    } catch (err) {
      console.error('Error fetching doctor details for appointment:', err.message);
    }
    
    return {
      ...appointment,
      doctor_name: appointment.doctor_name || 'Unknown Doctor',
    };
  }


  async cancelAppointment(appointmentId, userId, userRole, reason) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const appointment = await this.getAppointmentById(appointmentId);

      if (!appointment) {
        await client.query('ROLLBACK');
        return { error: 'Appointment not found', status: 404 };
      }


      console.log('Cancel appointment - User ID from JWT:', userId, 'Type:', typeof userId);
      console.log('Cancel appointment - Patient ID from DB:', appointment.patient_id, 'Type:', typeof appointment.patient_id);
      console.log('Cancel appointment - User Role:', userRole);


      if (userRole === 'patient') {
        // Use the user ID as-is (auth-service uses integer IDs)
        const userIdStr = userId.toString();
        
        console.log('Cancel appointment - User ID from JWT:', userIdStr);
        console.log('Cancel appointment - Patient ID from DB:', appointment.patient_id);
        
        if (appointment.patient_id !== userIdStr) {
          console.log('Authorization failed - Patient IDs do not match');
          await client.query('ROLLBACK');
          return { error: 'Not authorized', status: 403 };
        }
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


      try {
        const doctorServiceUrl = process.env.DOCTOR_SERVICE_URL || 'http://localhost:3003';
        

        const scheduledDate = new Date(appointment.scheduled_at);
        const slotDate = scheduledDate.toISOString().split('T')[0]; 
        const startTime = scheduledDate.toTimeString().split(' ')[0]; 
        
        console.log(`Deleting availability slot for doctor ${appointment.doctor_id} on ${slotDate} at ${startTime}`);
        

        const deleteSlotResponse = await fetch(
          `${doctorServiceUrl}/api/doctors/${appointment.doctor_id}/availability/delete-by-slot`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              slot_date: slotDate,
              start_time: startTime,
            }),
          }
        );

        if (deleteSlotResponse.ok) {
          console.log(`Availability slot deleted successfully for appointment ${appointmentId}`);
        } else {
          console.error(`Failed to delete availability slot for appointment ${appointmentId}`);
        }
      } catch (slotError) {
        console.error('Error deleting availability slot:', slotError);

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


  async rescheduleAppointment(appointmentId, newScheduledAt, userId, userRole) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const appointment = await this.getAppointmentById(appointmentId);

      if (!appointment) {
        await client.query('ROLLBACK');
        return { error: 'Appointment not found', status: 404 };
      }


      if (userRole === 'patient') {
        // Use the user ID as-is (auth-service uses integer IDs)
        const userIdStr = userId.toString();
        
        if (appointment.patient_id !== userIdStr) {
          await client.query('ROLLBACK');
          return { error: 'Not authorized', status: 403 };
        }
      }


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



      const newScheduledAtStr = newScheduledAt.toString();
      const [slotDate, timePart] = newScheduledAtStr.split('T');
      const startTime = timePart || '00:00:00';
      
      // Ensure startTime is in HH:MM:SS format
      const startTimeFormatted = startTime.length === 5 ? `${startTime}:00` : startTime; 
      
      console.log('Rescheduling - Appointment ID:', appointmentId);
      console.log('Rescheduling - New scheduled_at string:', newScheduledAtStr);
      console.log('Rescheduling - Extracted slot date:', slotDate);
      console.log('Rescheduling - Extracted start time:', startTimeFormatted);
      console.log('Rescheduling - Doctor ID:', appointment.doctor_id);
      console.log('Rescheduling - Old consultation type:', appointment.consultation_type);
      console.log('Rescheduling - Old fee:', appointment.consultation_fee);
      

      const doctorServiceUrl = process.env.DOCTOR_SERVICE_URL || 'http://doctor-service:3000';
      const availabilityUrl = `${doctorServiceUrl}/doctors/${appointment.doctor_id}/availability?date=${slotDate}`;
      console.log('Rescheduling - Fetching availability from:', availabilityUrl);
      
      const availabilityResponse = await fetch(availabilityUrl);
      
      let newConsultationType = appointment.consultation_type; 
      let newConsultationFee = appointment.consultation_fee; 
      
      if (availabilityResponse.ok) {
        const availabilitySlots = await availabilityResponse.json();
        console.log('Rescheduling - Available slots count:', availabilitySlots.length);
        console.log('Rescheduling - Available slots:', JSON.stringify(availabilitySlots, null, 2));
        

        const matchingSlot = availabilitySlots.find(slot => {
          const slotStart = slot.start_time.toString().padStart(8, '0'); 
          const match = slotStart === startTimeFormatted;
          if (match) {
            console.log('Rescheduling - ✅ MATCH FOUND! Slot start:', slotStart, 'requested:', startTimeFormatted);
          }
          return match;
        });
        
        if (matchingSlot) {
          console.log('Rescheduling - Found matching availability slot:', JSON.stringify(matchingSlot, null, 2));
          newConsultationType = matchingSlot.consultation_type || 'online';
          

          if (newConsultationType === 'both') {
            newConsultationType = 'online';
          }
          
          console.log('Rescheduling - New consultation type from slot:', newConsultationType);
          

          try {
            const doctorUrl = `${doctorServiceUrl}/doctors/${appointment.doctor_id}`;
            console.log('Rescheduling - Fetching doctor details from:', doctorUrl);
            
            const doctorResponse = await fetch(doctorUrl);
            
            if (doctorResponse.ok) {
              const doctor = await doctorResponse.json();
              console.log('Rescheduling - Doctor details:', JSON.stringify({
                id: doctor.id,
                consultation_fee_online: doctor.consultation_fee_online,
                consultation_fee_physical: doctor.consultation_fee_physical
              }));
              

              if (newConsultationType === 'online' || newConsultationType === 'video') {
                newConsultationFee = doctor.consultation_fee_online || 0;
              } else if (newConsultationType === 'physical') {
                newConsultationFee = doctor.consultation_fee_physical || doctor.consultation_fee_online || 0;
              }
              
              console.log('Rescheduling - Final consultation type:', newConsultationType, 'Final fee:', newConsultationFee);
            } else {
              console.error('Rescheduling - Failed to fetch doctor details, status:', doctorResponse.status);
            }
          } catch (err) {
            console.error('Rescheduling - Error fetching doctor details:', err.message);
          }
        } else {
          console.warn('Rescheduling - No matching slot found! Using old consultation type and fee.');
        }
      } else {
        console.error('Rescheduling - Failed to fetch availability, status:', availabilityResponse.status);
      }


      const result = await client.query(
        `UPDATE public.appointments
         SET scheduled_at = $2, consultation_type = $3, consultation_fee = $4, updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [appointmentId, newScheduledAt, newConsultationType, newConsultationFee]
      );


      try {
        const doctorServiceUrl = process.env.DOCTOR_SERVICE_URL || 'http://doctor-service:3000';
        

        const oldScheduledAtStr = appointment.scheduled_at.toString();
        const [oldSlotDate, oldTimePart] = oldScheduledAtStr.split('T');
        const oldStartTime = oldTimePart ? (oldTimePart.length === 5 ? `${oldTimePart}:00` : oldTimePart) : '00:00:00';
        
        console.log(`Rescheduling - Deleting OLD availability slot for doctor ${appointment.doctor_id} on ${oldSlotDate} at ${oldStartTime}`);
        

        const deleteSlotResponse = await fetch(
          `${doctorServiceUrl}/doctors/${appointment.doctor_id}/availability/delete-by-slot`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              slot_date: oldSlotDate,
              start_time: oldStartTime,
            }),
          }
        );

        if (deleteSlotResponse.ok) {
          console.log(`Rescheduling - ✅ Old availability slot deleted successfully for appointment ${appointmentId}`);
        } else {
          const errorText = await deleteSlotResponse.text();
          console.error(`Rescheduling - ❌ Failed to delete old availability slot:`, errorText);
        }
      } catch (slotError) {
        console.error('Rescheduling - Error deleting old availability slot:', slotError.message);

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


  async checkTelemedicineEligibility(appointmentId, userId, userRole) {
    try {
      // Get appointment details
      const appointment = await this.getAppointmentById(appointmentId);
      
      if (!appointment) {
        return { error: 'Appointment not found', status: 404 };
      }

      // Verify user is part of this appointment
      if (userRole === 'patient') {
        // Use the user ID as-is (auth-service uses integer IDs)
        const userIdStr = userId.toString();
        
        if (appointment.patient_id !== userIdStr) {
          return { error: 'Not authorized for this appointment', status: 403 };
        }
      } else if (userRole === 'doctor') {
        if (appointment.doctor_id !== userId) {
          return { error: 'Not authorized for this appointment', status: 403 };
        }
      }

      // Check eligibility criteria:
      // 1. Status must be CONFIRMED
      // 2. Consultation type must be video/online
      const isConfirmed = appointment.status === 'CONFIRMED';
      const isVideoConsultation = appointment.consultation_type === 'video' || 
                                   appointment.consultation_type === 'online';

      const eligible = isConfirmed && isVideoConsultation;

      return {
        success: true,
        data: {
          appointment_id: appointment.id,
          eligible: eligible,
          status: appointment.status,
          consultation_type: appointment.consultation_type,
          scheduled_at: appointment.scheduled_at,
          doctor_id: appointment.doctor_id,
          patient_id: appointment.patient_id,
          reason: !eligible 
            ? (isConfirmed ? 'This is not a video consultation' : 'Appointment is not confirmed yet') 
            : null
        }
      };
    } catch (error) {
      console.error('Check telemedicine eligibility error:', error);
      return { error: 'Failed to check eligibility', status: 500 };
    }
  }
}

module.exports = new AppointmentService();
