const User = require('../models/User');
const Medicine = require('../models/Medicine');
const Prescription = require('../models/Prescription');
const PrescriptionOrder = require('../models/PrescriptionOrder');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require('../services/emailService');
const { sendOrderStatusNotification } = require('../services/notificationService');

// Pharmacist Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find pharmacist user
        const user = await User.findOne({ email, role: 'pharmacist' });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials or not a pharmacist' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'your_jwt_secret_key_here_change_in_production',
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                employeeId: user.employeeId,
                pharmacyName: user.pharmacyName,
                licenseNumber: user.licenseNumber
            }
        });
    } catch (error) {
        console.error('Pharmacist login error:', error);
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};

// Get all prescriptions for review
exports.getPrescriptionsForReview = async (req, res) => {
    try {
        const prescriptions = await Prescription.find({ status: 'pending' })
            .populate('patient', 'name email phone')
            .populate('doctor', 'name email specialization')
            .sort({ createdAt: -1 });

        res.json(prescriptions);
    } catch (error) {
        console.error('Error fetching prescriptions:', error);
        res.status(500).json({ message: 'Error fetching prescriptions', error: error.message });
    }
};

// Approve prescription
exports.approvePrescription = async (req, res) => {
    try {
        const { prescriptionId } = req.params;
        const { pharmacistNotes } = req.body;

        // Find prescription
        const prescription = await Prescription.findById(prescriptionId);
        if (!prescription) {
            return res.status(404).json({ message: 'Prescription not found' });
        }

        // Update prescription status
        prescription.status = 'approved';
        prescription.pharmacyNotes = pharmacistNotes;
        await prescription.save();

        res.json({ 
            message: 'Prescription approved successfully',
            prescription 
        });
    } catch (error) {
        console.error('Error approving prescription:', error);
        res.status(500).json({ message: 'Error approving prescription', error: error.message });
    }
};

// Reject prescription
exports.rejectPrescription = async (req, res) => {
    try {
        const { prescriptionId } = req.params;
        const { rejectionReason, pharmacistNotes } = req.body;

        // Find prescription
        const prescription = await Prescription.findById(prescriptionId);
        if (!prescription) {
            return res.status(404).json({ message: 'Prescription not found' });
        }

        // Update prescription status
        prescription.status = 'rejected';
        prescription.pharmacyNotes = pharmacistNotes;
        prescription.rejectionReason = rejectionReason;
        await prescription.save();

        res.json({ 
            message: 'Prescription rejected successfully',
            prescription 
        });
    } catch (error) {
        console.error('Error rejecting prescription:', error);
        res.status(500).json({ message: 'Error rejecting prescription', error: error.message });
    }
};

// Get all prescription orders
exports.getPrescriptionOrders = async (req, res) => {
    try {
        const orders = await PrescriptionOrder.find()
            .populate('patient', 'name email phone')
            .populate('doctor', 'name email specialization')
            .populate('reviewedBy', 'name email')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        console.error('Error fetching prescription orders:', error);
        res.status(500).json({ message: 'Error fetching prescription orders', error: error.message });
    }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status, notes } = req.body;

        // Validate status
        const validStatuses = ['Pending', 'Approved', 'Rejected', 'Processing', 'Ready for Dispatch', 'Completed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // Find order
        const order = await PrescriptionOrder.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Store previous status for notification
        const previousStatus = order.status;

        // Update order
        order.status = status;
        if (notes) {
            order.pharmacistNotes = notes;
        }
        
        // Set reviewedBy if it's the first update
        if (!order.reviewedBy) {
            order.reviewedBy = req.user.userId;
        }

        await order.save();

        // Send notification to patient
        try {
            await sendOrderStatusNotification(orderId, order.patient, status, notes || '');
        } catch (notificationError) {
            console.error('Error sending notification:', notificationError);
        }

        res.json({ 
            message: 'Order status updated successfully',
            order 
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Error updating order status', error: error.message });
    }
};

// Get all medicines (inventory)
exports.getMedicines = async (req, res) => {
    try {
        const medicines = await Medicine.find().sort({ name: 1 });
        res.json(medicines);
    } catch (error) {
        console.error('Error fetching medicines:', error);
        res.status(500).json({ message: 'Error fetching medicines', error: error.message });
    }
};

// Add new medicine
exports.addMedicine = async (req, res) => {
    try {
        const medicine = new Medicine(req.body);
        await medicine.save();
        res.status(201).json({ 
            message: 'Medicine added successfully', 
            medicine 
        });
    } catch (error) {
        console.error('Error adding medicine:', error);
        res.status(500).json({ message: 'Error adding medicine', error: error.message });
    }
};

// Update medicine
exports.updateMedicine = async (req, res) => {
    try {
        const { medicineId } = req.params;
        
        // Find medicine
        const medicine = await Medicine.findById(medicineId);
        if (!medicine) {
            return res.status(404).json({ message: 'Medicine not found' });
        }

        // Update medicine
        Object.keys(req.body).forEach(key => {
            medicine[key] = req.body[key];
        });

        await medicine.save();

        res.json({ 
            message: 'Medicine updated successfully', 
            medicine 
        });
    } catch (error) {
        console.error('Error updating medicine:', error);
        res.status(500).json({ message: 'Error updating medicine', error: error.message });
    }
};

// Get pharmacist dashboard stats
exports.getDashboardStats = async (req, res) => {
    try {
        const stats = {
            totalOrders: await PrescriptionOrder.countDocuments(),
            pendingOrders: await PrescriptionOrder.countDocuments({ status: 'Pending' }),
            approvedOrders: await PrescriptionOrder.countDocuments({ status: 'Approved' }),
            rejectedOrders: await PrescriptionOrder.countDocuments({ status: 'Rejected' }),
            processingOrders: await PrescriptionOrder.countDocuments({ status: 'Processing' }),
            readyForDispatchOrders: await PrescriptionOrder.countDocuments({ status: 'Ready for Dispatch' }),
            completedOrders: await PrescriptionOrder.countDocuments({ status: 'Completed' }),
            totalMedicines: await Medicine.countDocuments(),
            outOfStockMedicines: await Medicine.countDocuments({ stock: 0 }),
            expiringSoonMedicines: await Medicine.countDocuments({ 
                expiryDate: { 
                    $lt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
                },
                stock: { $gt: 0 }
            })
        };

        res.json(stats);
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
    }
};