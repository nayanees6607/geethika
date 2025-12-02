import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import ProfileDropdown from '../components/ProfileDropdown';
import './PharmacistDashboard.css';
// Import the components directly
import PrescriptionReview from './PrescriptionReview.jsx';
import UpdateOrderStatus from './UpdateOrderStatus.jsx';
import AddMedicinesToOrder from './AddMedicinesToOrder.jsx';
import InventoryManagement from './InventoryManagement.jsx';

const PharmacistDashboard = () => {
    const { isAuthenticated, user, logout, getRoleDashboard, ensureAuthHeaders } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    useEffect(() => {
        console.log('PharmacistDashboard useEffect triggered', { isAuthenticated, user });
        
        if (!isAuthenticated) {
            console.log('User not authenticated, redirecting to login');
            navigate('/login/pharmacist');
            return;
        }
        
        // Check if user is a pharmacist
        if (user?.role !== 'pharmacist') {
            console.log('User is not a pharmacist, redirecting to appropriate dashboard');
            // Redirect to appropriate dashboard based on role
            const dashboardPath = getRoleDashboard(user?.role);
            navigate(dashboardPath);
            return;
        }
        
        console.log('Fetching dashboard stats for pharmacist');
        fetchDashboardStats();
    }, [isAuthenticated, user, navigate, getRoleDashboard]);

    const fetchDashboardStats = async () => {
        try {
            // Ensure auth headers are set before making API call
            ensureAuthHeaders();
            console.log('Making API call to /api/prescription-orders/pending');
            const response = await axios.get('/api/prescription-orders/pending');
            console.log('API response:', response.data);
            setPendingOrdersCount(response.data.length);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            console.error('Error response:', error.response?.data);
            setLoading(false);
        }
    };

    // Handle navigation to add medicines page
    useEffect(() => {
        if (activeTab.startsWith('add-medicines-')) {
            const orderId = activeTab.replace('add-medicines-', '');
            setSelectedOrderId(orderId);
        }
    }, [activeTab]);

    return (
        <div className="pharmacist-dashboard">
            <Sidebar
                role="pharmacist"
                activeTab={activeTab.startsWith('add-medicines-') ? 'prescription-review' : activeTab}
                setActiveTab={setActiveTab}
                user={user}
            />

            <div className="dashboard-main">
                <div className="dashboard-header">
                    <h2>Pharmacy Dashboard</h2>
                </div>

                {activeTab === 'overview' && (
                    <div className="dashboard-content">
                        <div className="content-header">
                            <h1>Dashboard Overview</h1>
                            <p>Welcome to your pharmacy portal, {user?.name}</p>
                        </div>

                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon blue">📋</div>
                                <div className="stat-info">
                                    <h3>{pendingOrdersCount}</h3>
                                    <p>Pending Prescriptions</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon green">📦</div>
                                <div className="stat-info">
                                    <h3>0</h3>
                                    <p>Total Medicines</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon red">⚠️</div>
                                <div className="stat-info">
                                    <h3>0</h3>
                                    <p>Low Stock Alerts</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon purple">💰</div>
                                <div className="stat-info">
                                    <h3>₹0</h3>
                                    <p>Today's Revenue</p>
                                </div>
                            </div>
                        </div>

                        <div className="dashboard-grid">
                            <div className="dashboard-card">
                                <div className="card-header">
                                    <h2>Quick Actions</h2>
                                </div>
                                <div className="quick-actions">
                                    <button 
                                        className="btn btn-primary"
                                        onClick={() => setActiveTab('prescription-review')}
                                    >
                                        Review Prescriptions ({pendingOrdersCount})
                                    </button>
                                    <button 
                                        className="btn btn-secondary"
                                        onClick={() => setActiveTab('update-status')}
                                    >
                                        Update Order Status
                                    </button>
                                    <button 
                                        className="btn btn-accent"
                                        onClick={() => setActiveTab('inventory')}
                                    >
                                        Manage Inventory
                                    </button>
                                </div>
                            </div>

                            <div className="dashboard-card">
                                <div className="card-header">
                                    <h2>Recent Activity</h2>
                                </div>
                                <div className="recent-activity">
                                    <p>No recent activity</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'prescription-review' && <PrescriptionReview setActiveTab={setActiveTab} />}

                {activeTab.startsWith('add-medicines-') && (
                    <AddMedicinesToOrder 
                        orderId={selectedOrderId} 
                        setActiveTab={setActiveTab} 
                    />
                )}

                {activeTab === 'update-status' && <UpdateOrderStatus />}

                {activeTab === 'inventory' && <InventoryManagement />}
            </div>
        </div>
    );
};

export default PharmacistDashboard;