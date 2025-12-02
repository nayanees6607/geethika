const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const { authMiddleware } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const doctorController = require('../controllers/doctorController');

// Schedule Management Routes (Protected)
router.get('/schedule', authMiddleware, doctorController.getSchedule);
router.put('/schedule', authMiddleware, doctorController.updateSchedule);

// Helper function to check availability
const checkAvailability = (doctor) => {
    if (!doctor.weeklySchedule || doctor.weeklySchedule.length === 0) {
        return doctor.isAvailable; // Fallback to manual toggle if no schedule
    }

    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = days[now.getDay()];

    // Format current time as HH:mm
    const currentHours = now.getHours().toString().padStart(2, '0');
    const currentMinutes = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${currentHours}:${currentMinutes}`;

    const todaySchedule = doctor.weeklySchedule.find(s => s.day === currentDay);

    console.log(`Checking availability for ${doctor.name}:`);
    console.log(`- Server Time: ${currentTime} (${currentDay})`);
    console.log(`- Schedule: ${todaySchedule ? `${todaySchedule.startTime} - ${todaySchedule.endTime}` : 'None'}`);
    console.log(`- Is Available in Schedule: ${todaySchedule?.isAvailable}`);

    if (!todaySchedule || !todaySchedule.isAvailable) {
        return false;
    }

    const isWithinTime = currentTime >= todaySchedule.startTime && currentTime <= todaySchedule.endTime;
    console.log(`- Is Within Time: ${isWithinTime}`);

    return isWithinTime;
};

// GET /api/doctors - Return all doctors
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;

        let query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { specialization: { $regex: search, $options: 'i' } },
                { symptomsHandled: { $regex: search, $options: 'i' } }
            ];
        }

        const doctors = await Doctor.find(query).select('-passwordHash');

        // Add dynamic availability
        const doctorsWithAvailability = doctors.map(doc => {
            const docObj = doc.toObject();
            docObj.isAvailable = checkAvailability(docObj);

            // Add debug info
            const now = new Date();
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            docObj.debugInfo = {
                serverTime: `${now.getHours()}:${now.getMinutes()}`,
                day: days[now.getDay()],
                schedule: docObj.weeklySchedule.find(s => s.day === days[now.getDay()])
            };

            return docObj;
        });

        res.json(doctorsWithAvailability);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching doctors', error: error.message });
    }
});

// GET /api/doctors/available - Return available doctors
router.get('/available', async (req, res) => {
    try {
        // Get all doctors first, then filter dynamically
        const doctors = await Doctor.find({}).select('-passwordHash');

        const availableDoctors = doctors
            .map(doc => {
                const docObj = doc.toObject();
                docObj.isAvailable = checkAvailability(docObj);

                // Add debug info
                const now = new Date();
                const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                docObj.debugInfo = {
                    serverTime: `${now.getHours()}:${now.getMinutes()}`,
                    day: days[now.getDay()],
                    schedule: docObj.weeklySchedule.find(s => s.day === days[now.getDay()])
                };

                return docObj;
            })
            .filter(doc => doc.isAvailable);

        res.json(availableDoctors);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching available doctors', error: error.message });
    }
});

// GET /api/doctors/specialization/:specialization
router.get('/specialization/:specialization', async (req, res) => {
    try {
        const { specialization } = req.params;
        const doctors = await Doctor.find({
            specialization: { $regex: specialization, $options: 'i' }
        }).select('-passwordHash');

        // Add dynamic availability
        const doctorsWithAvailability = doctors.map(doc => {
            const docObj = doc.toObject();
            docObj.isAvailable = checkAvailability(docObj);

            // Add debug info
            const now = new Date();
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            docObj.debugInfo = {
                serverTime: `${now.getHours()}:${now.getMinutes()}`,
                day: days[now.getDay()],
                schedule: docObj.weeklySchedule.find(s => s.day === days[now.getDay()])
            };

            return docObj;
        });

        res.json(doctorsWithAvailability);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching doctors by specialization', error: error.message });
    }
});

// GET /api/doctors/symptom/:symptom
router.get('/symptom/:symptom', async (req, res) => {
    try {
        const { symptom } = req.params;
        const doctors = await Doctor.find({
            symptomsHandled: { $regex: symptom, $options: 'i' }
        }).select('-passwordHash');

        // Add dynamic availability
        const doctorsWithAvailability = doctors.map(doc => {
            const docObj = doc.toObject();
            docObj.isAvailable = checkAvailability(docObj);

            // Add debug info
            const now = new Date();
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            docObj.debugInfo = {
                serverTime: `${now.getHours()}:${now.getMinutes()}`,
                day: days[now.getDay()],
                schedule: docObj.weeklySchedule.find(s => s.day === days[now.getDay()])
            };

            return docObj;
        });

        res.json(doctorsWithAvailability);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching doctors by symptom', error: error.message });
    }
});

// GET /api/doctors/:id - Return single doctor
router.get('/:id', async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id).select('-passwordHash');
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        res.json(doctor);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching doctor', error: error.message });
    }
});

// POST /api/doctors - Create new doctor
router.post('/', async (req, res) => {
    try {
        const { name, email, specialization, consultationFee, password } = req.body;

        // Basic validation
        if (!name || !email || !specialization || !consultationFee || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const existingDoctor = await Doctor.findOne({ email });
        if (existingDoctor) {
            return res.status(400).json({ message: 'Doctor already exists' });
        }

        const doctor = new Doctor({
            ...req.body,
            passwordHash: password // Will be hashed by pre-save hook
        });

        await doctor.save();

        const doctorResponse = doctor.toObject();
        delete doctorResponse.passwordHash;

        res.status(201).json({ message: 'Doctor created successfully', doctor: doctorResponse });
    } catch (error) {
        res.status(500).json({ message: 'Error creating doctor', error: error.message });
    }
});

// POST /api/doctors/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const doctor = await Doctor.findOne({ email });
        if (!doctor) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await doctor.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: doctor._id, role: 'doctor' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: doctor._id,
                name: doctor.name,
                email: doctor.email,
                role: 'doctor'
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Login error', error: error.message });
    }
});

module.exports = router;
