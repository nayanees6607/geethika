const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const Prescription = require('../models/Prescription'); // Assuming you have this
// const Appointment = require('../models/Appointment'); // Assuming you have this
const { authMiddleware, authorize } = require('../middleware/auth');

// Middleware to ensure admin access
router.use(authMiddleware, authorize('admin'));

// Get all users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// Delete user
// Delete user
router.delete('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        // Find user first to check role if needed, or just proceed
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Cascading delete: Remove related DoctorPatient records
        // This prevents "orphan" records that cause frontend crashes
        const DoctorPatient = require('../models/DoctorPatient');
        await DoctorPatient.deleteMany({ patientId: userId });

        // Also remove if the user was a doctor (remove records where they are the doctor)
        if (user.role === 'doctor') {
            await DoctorPatient.deleteMany({ doctorId: userId });
        }

        await User.findByIdAndDelete(userId);
        res.json({ message: 'User and related data deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user' });
    }
});

// Get pending doctor approvals
router.get('/doctors/pending', async (req, res) => {
    try {
        // Assuming there's a status field or we filter by some criteria
        // For now, let's just get all doctors
        const doctors = await User.find({ role: 'doctor' }).select('-password');
        res.json(doctors);
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({ message: 'Error fetching doctors' });
    }
});

// Approve/Reject doctor
router.put('/doctors/:id/approve', async (req, res) => {
    try {
        const { status } = req.body; // 'active', 'rejected'
        const doctor = await User.findByIdAndUpdate(
            req.params.id,
            { status }, // Assuming User model has a status field, if not, you might need to add it
            { new: true }
        ).select('-password');
        res.json({ message: `Doctor ${status}`, doctor });
    } catch (error) {
        console.error('Error updating doctor status:', error);
        res.status(500).json({ message: 'Error updating doctor status' });
    }
});

// Analytics - Dashboard Stats
router.get('/analytics', async (req, res) => {
    try {
        const totalPatients = await User.countDocuments({ role: 'patient' });
        const totalDoctors = await User.countDocuments({ role: 'doctor' });
        const totalPharmacists = await User.countDocuments({ role: 'pharmacist' });
        const totalOrders = await Order.countDocuments();

        // Calculate total revenue from orders
        const orders = await Order.find({ paymentStatus: 'paid' });
        const totalRevenue = orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);

        res.json({
            users: {
                patients: totalPatients,
                doctors: totalDoctors,
                pharmacists: totalPharmacists
            },
            orders: {
                total: totalOrders,
                revenue: totalRevenue
            }
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ message: 'Error fetching analytics' });
    }
});

module.exports = router;
