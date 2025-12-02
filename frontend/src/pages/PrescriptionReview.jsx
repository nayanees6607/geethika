import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './PharmacistDashboard.css';

// Create a context for communication between components
const PharmacistContext = React.createContext();

const PrescriptionReview = ({ setActiveTab }) => {
    const { user, isAuthenticated, ensureAuthHeaders } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        console.log('PrescriptionReview useEffect triggered', { isAuthenticated, user });
        if (isAuthenticated && user?.role === 'pharmacist') {
            console.log('Fetching pending orders for pharmacist');
            fetchPendingOrders();
        }
    }, [isAuthenticated, user]);

    const fetchPendingOrders = async () => {
        try {
            // Ensure auth headers are set before making API call
            ensureAuthHeaders();
            console.log('Making API call to /api/prescription-orders/pending');
            const response = await axios.get('/api/prescription-orders/pending');
            console.log('API response:', response.data);
            setOrders(response.data);
        } catch (err) {
            console.error('Error fetching orders:', err);
            console.error('Error response:', err.response?.data);
            setError(err.response?.data?.message || 'Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = (order) => {
        console.log('Handling approve for order:', order);
        // Navigate to the add medicines tab with the order ID
        if (setActiveTab) {
            setActiveTab(`add-medicines-${order._id}`);
        } else {
            // Fallback to navigation if setActiveTab is not provided
            navigate(`/pharmacist/add-medicines/${order._id}`);
        }
    };

    const handleReject = async (orderId) => {
        if (!window.confirm('Are you sure you want to reject this prescription?')) {
            return;
        }

        try {
            // Ensure auth headers are set before making API call
            ensureAuthHeaders();
            console.log(`Making API call to patch /api/prescription-orders/${orderId}/reject`);
            const response = await axios.patch(`/api/prescription-orders/${orderId}/reject`, {
                rejectionReason
            });
            
            if (response.data.order) {
                alert('Prescription rejected successfully');
                fetchPendingOrders(); // Refresh the list
                setRejectionReason('');
            }
        } catch (err) {
            console.error('Error rejecting prescription:', err);
            console.error('Error response:', err.response?.data);
            alert(err.response?.data?.message || 'Failed to reject prescription');
        }
    };

    if (loading) {
        return <div className="loading">Loading pending prescriptions...</div>;
    }

    if (error) {
        return (
            <div className="dashboard-content">
                <div className="dashboard-header">
                    <h2>Prescription Review</h2>
                </div>
                <div className="error-message">{error}</div>
            </div>
        );
    }

    if (!isAuthenticated || user?.role !== 'pharmacist') {
        return (
            <div className="dashboard-content">
                <div className="dashboard-header">
                    <h2>Prescription Review</h2>
                </div>
                <div className="error-message">Access denied. Please log in as a pharmacist.</div>
            </div>
        );
    }

    return (
        <div className="dashboard-content">
            <div className="dashboard-header">
                <h2>Prescription Review</h2>
                <p>Review and validate patient prescriptions</p>
            </div>
            
            {orders.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <h3>No Pending Prescriptions</h3>
                    <p>All prescriptions have been reviewed.</p>
                </div>
            ) : (
                <div className="prescriptions-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Patient Name</th>
                                <th>Prescription</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order._id}>
                                    <td>#{order.orderId}</td>
                                    <td>{order.patientName}</td>
                                    <td>{order.prescriptionFile}</td>
                                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <button 
                                            className="btn btn-primary btn-sm"
                                            onClick={() => handleApprove(order)}
                                        >
                                            Approve
                                        </button>
                                        <button 
                                            className="btn btn-danger btn-sm"
                                            onClick={() => {
                                                const reason = prompt('Enter rejection reason:');
                                                if (reason) {
                                                    setRejectionReason(reason);
                                                    handleReject(order._id);
                                                }
                                            }}
                                        >
                                            Reject
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default PrescriptionReview;