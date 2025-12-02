const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const DoctorPatient = require('../models/DoctorPatient');
const { authMiddleware } = require('../middleware/auth');

// POST /api/appointments - Book new appointment
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { doctorId, appointmentDate, timeSlot, reason } = req.body;

        if (!doctorId || !appointmentDate || !timeSlot) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const appointment = new Appointment({
            patientId: req.user.userId,
            doctorId,
            appointmentDate,
            timeSlot,
            reason,
            status: 'Booked'
        });

        await appointment.save();

        // Create or update Doctor-Patient relationship
        const existingRelation = await DoctorPatient.findOne({
            doctorId,
            patientId: req.user.userId
        });

        if (!existingRelation) {
            await DoctorPatient.create({
                doctorId,
                patientId: req.user.userId,
                status: 'new',
                lastVisit: appointmentDate
            });
        } else {
            existingRelation.lastVisit = appointmentDate;
            await existingRelation.save();
        }

        res.status(201).json({ message: 'Appointment booked successfully', appointment });
    } catch (error) {
        res.status(500).json({ message: 'Error booking appointment', error: error.message });
    }
});

// GET /api/appointments/my - Get patient's appointments
router.get('/my', authMiddleware, async (req, res) => {
    try {
        const appointments = await Appointment.find({ patientId: req.user.userId })
            .populate('doctorId', 'name specialization consultationFee location')
            .sort({ appointmentDate: 1 });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching appointments', error: error.message });
    }
});

// GET /api/appointments/doctor/:doctorId - Get doctor's appointments
router.get('/doctor/:doctorId', async (req, res) => {
    try {
        const appointments = await Appointment.find({ doctorId: req.params.doctorId })
            .select('appointmentDate timeSlot status')
            .sort({ appointmentDate: 1 });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching doctor appointments', error: error.message });
    }
});

// PATCH /api/appointments/:id/cancel - Cancel appointment
router.patch('/:id/cancel', authMiddleware, async (req, res) => {
    try {
        const appointment = await Appointment.findOne({
            _id: req.params.id,
            patientId: req.user.userId
        });

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        if (appointment.status === 'Cancelled') {
            return res.status(400).json({ message: 'Appointment is already cancelled' });
        }

        appointment.status = 'Cancelled';
        await appointment.save();

        res.json({ message: 'Appointment cancelled successfully', appointment });
    } catch (error) {
        res.status(500).json({ message: 'Error cancelling appointment', error: error.message });
    }
});

module.exports = router;
