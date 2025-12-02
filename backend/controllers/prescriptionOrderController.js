const Order = require('../models/Order');
const User = require('../models/User');
const Medicine = require('../models/Medicine');
const DeliveryPackage = require('../models/DeliveryPackage');
const crypto = require('crypto');

// Generate unique order ID
const generateOrderId = () => {
    return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

// Patient uploads prescription and creates order
exports.uploadPrescription = async (req, res) => {
    try {
        const { prescriptionFile } = req.body;
        const patientId = req.user.userId;

        // Get patient's delivery address
        const patient = await User.findById(patientId);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Create new order with "Pending Review" status
        const order = new Order({
            orderId: generateOrderId(),
            patient: patientId,
            prescriptionFile,
            orderItems: [],
            status: 'Pending Review',
            deliveryAddress: patient.address || {}
        });

        await order.save();

        res.status(201).json({
            message: 'Prescription uploaded successfully',
            order
        });
    } catch (error) {
        console.error('Error uploading prescription:', error);
        res.status(500).json({ message: 'Error uploading prescription', error: error.message });
    }
};

// Pharmacist gets all orders with "Pending Review" status
exports.getPendingOrders = async (req, res) => {
    try {
        const orders = await Order.find({ status: 'Pending Review' })
            .populate('patient', 'name')
            .sort({ createdAt: -1 });

        // Return only necessary information to pharmacist (hide delivery address)
        const pharmacistOrders = orders.map(order => ({
            _id: order._id,
            orderId: order.orderId,
            patientName: order.patient?.name || 'Unknown Patient',
            prescriptionFile: order.prescriptionFile,
            status: order.status,
            createdAt: order.createdAt
        }));

        res.json(pharmacistOrders);
    } catch (error) {
        console.error('Error fetching pending orders:', error);
        res.status(500).json({ message: 'Error fetching pending orders', error: error.message });
    }
};

// Pharmacist approves prescription and adds medicines
exports.approvePrescription = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { medicines } = req.body; // Array of {medicineId, quantity, price}

        // Find order
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Verify order is in "Pending Review" status
        if (order.status !== 'Pending Review') {
            return res.status(400).json({ message: 'Order is not in Pending Review status' });
        }

        // Process medicines
        let totalAmount = 0;
        const orderItems = [];

        for (const item of medicines) {
            const medicine = await Medicine.findById(item.medicineId);
            if (!medicine) {
                return res.status(404).json({ message: `Medicine ${item.medicineId} not found` });
            }

            // Check stock
            if (medicine.stock < item.quantity) {
                return res.status(400).json({ 
                    message: `Insufficient stock for ${medicine.name}. Available: ${medicine.stock}, Requested: ${item.quantity}` 
                });
            }

            orderItems.push({
                medicine: medicine._id,
                name: medicine.name,
                quantity: item.quantity,
                price: item.price || medicine.price
            });

            totalAmount += (item.price || medicine.price) * item.quantity;
        }

        // Update order
        order.orderItems = orderItems;
        order.totalAmount = totalAmount;
        order.status = 'Approved - Awaiting Payment';
        order.verifiedBy = req.user.userId;

        await order.save();

        res.json({
            message: 'Prescription approved and medicines added successfully',
            order
        });
    } catch (error) {
        console.error('Error approving prescription:', error);
        res.status(500).json({ message: 'Error approving prescription', error: error.message });
    }
};

// Pharmacist rejects prescription
exports.rejectPrescription = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { rejectionReason } = req.body;

        // Find order
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Verify order is in "Pending Review" status
        if (order.status !== 'Pending Review') {
            return res.status(400).json({ message: 'Order is not in Pending Review status' });
        }

        // Update order
        order.status = 'Rejected';
        order.notes = rejectionReason;
        order.verifiedBy = req.user.userId;

        await order.save();

        res.json({
            message: 'Prescription rejected successfully',
            order
        });
    } catch (error) {
        console.error('Error rejecting prescription:', error);
        res.status(500).json({ message: 'Error rejecting prescription', error: error.message });
    }
};

// Patient makes payment
exports.makePayment = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { paymentMethod, transactionId } = req.body;

        // Find order
        const order = await Order.findById(orderId).populate('patient', 'name phone');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Verify order belongs to patient
        if (order.patient._id.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Verify order is in "Approved - Awaiting Payment" status
        if (order.status !== 'Approved - Awaiting Payment') {
            return res.status(400).json({ message: 'Order is not awaiting payment' });
        }

        // Update order
        order.status = 'Paid';
        order.paymentStatus = 'completed';
        order.paymentMethod = paymentMethod;
        order.transactionId = transactionId;

        await order.save();

        res.json({
            message: 'Payment completed successfully',
            order
        });
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ message: 'Error processing payment', error: error.message });
    }
};

// Pharmacist updates order status to Processing
exports.startProcessing = async (req, res) => {
    try {
        const { orderId } = req.params;

        // Find order
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Verify order is in "Paid" status
        if (order.status !== 'Paid') {
            return res.status(400).json({ message: 'Order is not in Paid status' });
        }

        // Update order
        order.status = 'Processing';

        await order.save();

        res.json({
            message: 'Order status updated to Processing',
            order
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Error updating order status', error: error.message });
    }
};

// Pharmacist marks order as Ready for Dispatch and creates DeliveryPackage
exports.markReadyForDispatch = async (req, res) => {
    try {
        const { orderId } = req.params;

        // Find order
        const order = await Order.findById(orderId).populate('patient', 'name phone');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Verify order is in "Processing" status
        if (order.status !== 'Processing') {
            return res.status(400).json({ message: 'Order is not in Processing status' });
        }

        // Update order
        order.status = 'Ready for Dispatch';

        await order.save();

        // Create delivery package (this is where we attach the delivery address)
        const deliveryPackage = new DeliveryPackage({
            order: order._id,
            patient: {
                name: order.patient.name,
                phone: order.patient.phone
            },
            deliveryAddress: order.deliveryAddress,
            status: 'pending'
        });

        await deliveryPackage.save();

        res.json({
            message: 'Order marked as Ready for Dispatch and delivery package created',
            order,
            deliveryPackage
        });
    } catch (error) {
        console.error('Error marking order as ready for dispatch:', error);
        res.status(500).json({ message: 'Error marking order as ready for dispatch', error: error.message });
    }
};

// Get order details for patient (includes all details except delivery package info)
exports.getOrderDetails = async (req, res) => {
    try {
        const { orderId } = req.params;

        // Find order
        const order = await Order.findById(orderId)
            .populate('patient', 'name')
            .populate('verifiedBy', 'name')
            .populate('orderItems.medicine');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Verify order belongs to patient
        if (req.user.role === 'patient' && order.patient._id.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(order);
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ message: 'Error fetching order details', error: error.message });
    }
};

// Get all orders for pharmacist (without delivery addresses)
exports.getAllPharmacistOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('patient', 'name')
            .populate('verifiedBy', 'name')
            .sort({ createdAt: -1 });

        // Return only necessary information to pharmacist (hide delivery address)
        const pharmacistOrders = orders.map(order => ({
            _id: order._id,
            orderId: order.orderId,
            patientName: order.patient?.name || 'Unknown Patient',
            prescriptionFile: order.prescriptionFile,
            orderItems: order.orderItems.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price
            })),
            totalAmount: order.totalAmount,
            status: order.status,
            verifiedBy: order.verifiedBy?.name || null,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt
        }));

        res.json(pharmacistOrders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
};

// Search medicines for pharmacist
exports.searchMedicines = async (req, res) => {
    try {
        const { query } = req.query;

        let searchQuery = {};
        if (query) {
            searchQuery.$or = [
                { name: { $regex: query, $options: 'i' } },
                { genericName: { $regex: query, $options: 'i' } }
            ];
        }

        const medicines = await Medicine.find(searchQuery)
            .select('name genericName price stock category')
            .sort({ name: 1 });

        res.json(medicines);
    } catch (error) {
        console.error('Error searching medicines:', error);
        res.status(500).json({ message: 'Error searching medicines', error: error.message });
    }
};