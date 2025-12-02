const express = require('express');
const router = express.Router();
const DoctorSchedule = require('../models/DoctorSchedule');
const DoctorPatient = require('../models/DoctorPatient');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
// const Patient = require('../models/Patient'); // Removed
const { authMiddleware } = require('../middleware/auth');
const { sendDoctorNotificationEmail } = require('../services/emailService');

// POST /api/patient/appointments
router.post('/appointments', authMiddleware, async (req, res) => {
    try {
        const { doctorId, slotId, date, startTime, endTime, symptoms, consultationType } = req.body;
        const patientId = req.user.userId;

        let appointmentDate, timeSlot;

        // Check if this is a slot-based booking or direct booking
        if (slotId) {
            // SLOT-BASED BOOKING (from schedule page)
            const schedule = await DoctorSchedule.findOne({ doctorId });
            if (!schedule) {
                return res.status(404).json({ message: 'Doctor schedule not found' });
            }

            const slot = schedule.slots.id(slotId);
            if (!slot) {
                return res.status(404).json({ message: 'Slot not found' });
            }

            if (slot.isBooked) {
                return res.status(400).json({ message: 'Slot is already booked' });
            }

            // Mark slot as booked
            slot.isBooked = true;
            slot.patientId = patientId;
            await schedule.save();

            appointmentDate = slot.date;
            timeSlot = `${slot.startTime} - ${slot.endTime}`;
        } else if (date && startTime && endTime) {
            // DIRECT BOOKING (from doctor profile page)
            appointmentDate = new Date(date);
            timeSlot = `${startTime} - ${endTime}`;
        } else {
            return res.status(400).json({ message: 'Either slotId or date/time must be provided' });
        }

        // Create Appointment record
        const appointment = new Appointment({
            patientId,
            doctorId,
            appointmentDate,
            timeSlot,
            status: 'Pending', // Changed from 'Booked' to 'Pending' for doctor review
            symptoms: symptoms || '',
            consultationType: consultationType || 'in-person'
        });
        await appointment.save();

        // Update Doctor-Patient Relationship
        let relation = await DoctorPatient.findOne({ doctorId, patientId });
        if (!relation) {
            relation = new DoctorPatient({
                doctorId,
                patientId,
                status: 'new',
                lastVisit: appointmentDate
            });
            await relation.save();
        } else {
            // Update last visit
            relation.lastVisit = appointmentDate;
            if (relation.status === 'rejected') {
                relation.status = 'new'; // Reset status if previously rejected
            }
            await relation.save();
        }

        // Create notification for doctor
        const patient = await User.findById(patientId);
        const doctor = await Doctor.findById(doctorId);

        if (doctor && patient) {
            // Create in-app notification
            const notification = new Notification({
                userId: doctorId,
                userModel: 'Doctor',
                type: 'new_appointment',
                message: `New appointment request from ${patient.name || patient.firstName + ' ' + patient.lastName}`,
                relatedId: appointment._id,
                relatedModel: 'Appointment'
            });
            await notification.save();

            // Send email notification to doctor (optional, non-blocking)
            if (doctor.email) {
                sendDoctorNotificationEmail(
                    doctor.email,
                    doctor.name,
                    patient.name || `${patient.firstName} ${patient.lastName}`,
                    {
                        date: new Date(appointmentDate).toLocaleDateString(),
                        time: timeSlot
                    }
                ).catch(err => console.error('Email send failed:', err));
            }
        }

        res.status(201).json({
            message: 'Appointment booked successfully',
            appointment,
            slotId: slotId || null
        });

    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({ message: 'Error booking appointment', error: error.message });
    }
});

module.exports = router;
