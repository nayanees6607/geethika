import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [users, setUsers] = useState({ doctors: [], patients: [], pharmacists: [] });
    const [pendingDoctors, setPendingDoctors] = useState([]);
    const [analytics, setAnalytics] = useState({
        totalUsers: 0,
        totalDoctors: 0,
        totalPharmacists: 0,
        totalOrders: 0,
        totalRevenue: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login/admin');
            return;
        }
        fetchDashboardData();
    }, [isAuthenticated, navigate]);

    const fetchDashboardData = async () => {
        try {
            // In a real app, fetch from API
            // const usersRes = await axios.get('/api/admin/users');
            // const pendingRes = await axios.get('/api/admin/doctors/pending');
            // const analyticsRes = await axios.get('/api/admin/analytics');
            // setUsers(usersRes.data);
            // setPendingDoctors(pendingRes.data);
            // setAnalytics(analyticsRes.data);

            // Mock data for now
            setUsers({
                doctors: [
                    { id: 1, name: 'Dr. John Smith', specialty: 'Cardiologist', status: 'active', patients: 156 },
                    { id: 2, name: 'Dr. Sarah Williams', specialty: 'Pediatrician', status: 'active', patients: 203 },
                    { id: 3, name: 'Dr. Michael Brown', specialty: 'Neurologist', status: 'inactive', patients: 89 },
                ],
                patients: [
                    { id: 1, name: 'John Doe', email: 'john@example.com', joinDate: '2025-01-15', appointments: 12 },
                    { id: 2, name: 'Jane Smith', email: 'jane@example.com', joinDate: '2025-02-20', appointments: 8 },
                ],
                pharmacists: [
                    { id: 1, name: 'Robert Johnson', pharmacy: 'MediConnect Pharmacy', status: 'active', orders: 450 },
                ]
            });

            setPendingDoctors([
                { id: 4, name: 'Dr. Emily Davis', specialty: 'Dermatologist', appliedDate: '2025-11-25', qualifications: 'MBBS, MD' },
                { id: 5, name: 'Dr. James Wilson', specialty: 'Orthopedic', appliedDate: '2025-11-26', qualifications: 'MBBS, MS' },
            ]);

            setAnalytics({
                totalUsers: 1248,
                totalDoctors: 45,
                totalPharmacists: 12,
                totalOrders: 856,
                totalRevenue: 2400000
            });

            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    const approveDoctor = async (doctorId) => {
        try {
            // await axios.put(`/api/admin/doctors/approve/${doctorId}`, { status: 'approved' });
            setPendingDoctors(pendingDoctors.filter(d => d.id !== doctorId));
            alert('Doctor approved successfully!');
        } catch (error) {
            console.error('Error approving doctor:', error);
        }
    };

    const rejectDoctor = async (doctorId) => {
        try {
            // await axios.put(`/api/admin/doctors/approve/${doctorId}`, { status: 'rejected' });
            setPendingDoctors(pendingDoctors.filter(d => d.id !== doctorId));
            alert('Doctor application rejected');
        } catch (error) {
            console.error('Error rejecting doctor:', error);
        }
    };

    const deleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                // await axios.delete(`/api/admin/users/${userId}`);
                // Refresh users list
                alert('User deleted successfully');
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        }
    };

    return (
        <div className="admin-dashboard">
            <div className="dashboard-sidebar">
                <div className="sidebar-header">
                    <div className="admin-avatar">🔐</div>
                    <h3>Admin Portal</h3>
                    <p className="admin-role">System Administrator</p>
                </div>

                <nav className="sidebar-nav">
                    <button
                        className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <span className="nav-icon">📊</span>
                        Analytics
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        <span className="nav-icon">👥</span>
                        User Management
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'approvals' ? 'active' : ''}`}
                        onClick={() => setActiveTab('approvals')}
                    >
                        <span className="nav-icon">✓</span>
                        Doctor Approvals
                        {pendingDoctors.length > 0 && <span className="approval-badge">{pendingDoctors.length}</span>}
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'appointments' ? 'active' : ''}`}
                        onClick={() => setActiveTab('appointments')}
                    >
                        <span className="nav-icon">📅</span>
                        Appointments
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'transactions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('transactions')}
                    >
                        <span className="nav-icon">💰</span>
                        Transactions
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reports')}
                    >
                        <span className="nav-icon">📈</span>
                        Reports
                    </button>
                </nav>
            </div>

            <div className="dashboard-main">
                {activeTab === 'overview' && (
                    <div className="dashboard-content">
                        <div className="content-header">
                            <h1>Analytics Dashboard</h1>
                            <select className="form-select" style={{ width: 'auto' }}>
                                <option>Last 7 Days</option>
                                <option>Last 30 Days</option>
                                <option>Last 3 Months</option>
                            </select>
                        </div>

                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon blue">👥</div>
                                <div className="stat-info">
                                    <h3>{analytics.totalUsers}</h3>
                                    <p>Total Users</p>
                                    <span className="stat-change positive">+12% this month</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon green">👨‍⚕️</div>
                                <div className="stat-info">
                                    <h3>{users.doctors.length}</h3>
                                    <p>Active Doctors</p>
                                    <span className="stat-change positive">+2 new</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon purple">📅</div>
                                <div className="stat-info">
                                    <h3>{analytics.totalOrders}</h3>
                                    <p>Orders & Appointments</p>
                                    <span className="stat-change positive">+8% this week</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon red">💰</div>
                                <div className="stat-info">
                                    <h3>₹{(analytics.totalRevenue / 1000000).toFixed(1)}M</h3>
                                    <p>Total Revenue</p>
                                    <span className="stat-change positive">+15% this month</span>
                                </div>
                            </div>
                        </div>

                        <div className="analytics-grid">
                            <div className="analytics-card">
                                <div className="card-header">
                                    <h2>Appointment Trends</h2>
                                    <button className="btn-link">View Details</button>
                                </div>
                                <div className="chart-container">
                                    <div className="chart-placeholder">
                                        <div className="bar-chart">
                                            <div className="bar" style={{ height: '60%' }}><span>Mon</span></div>
                                            <div className="bar" style={{ height: '75%' }}><span>Tue</span></div>
                                            <div className="bar" style={{ height: '55%' }}><span>Wed</span></div>
                                            <div className="bar" style={{ height: '85%' }}><span>Thu</span></div>
                                            <div className="bar" style={{ height: '70%' }}><span>Fri</span></div>
                                            <div className="bar" style={{ height: '45%' }}><span>Sat</span></div>
                                            <div className="bar" style={{ height: '30%' }}><span>Sun</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="analytics-card">
                                <div className="card-header">
                                    <h2>Revenue Overview</h2>
                                    <button className="btn-link">View Details</button>
                                </div>
                                <div className="chart-container">
                                    <div className="revenue-stats">
                                        <div className="revenue-item">
                                            <span className="revenue-label">Consultations</span>
                                            <span className="revenue-value">₹1.2M</span>
                                            <div className="revenue-bar" style={{ width: '60%' }}></div>
                                        </div>
                                        <div className="revenue-item">
                                            <span className="revenue-label">Medicines</span>
                                            <span className="revenue-value">₹850K</span>
                                            <div className="revenue-bar" style={{ width: '45%' }}></div>
                                        </div>
                                        <div className="revenue-item">
                                            <span className="revenue-label">Lab Tests</span>
                                            <span className="revenue-value">₹350K</span>
                                            <div className="revenue-bar" style={{ width: '20%' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="dashboard-content">
                        <div className="content-header">
                            <h1>User Management</h1>
                            <button className="btn btn-primary">+ Add User</button>
                        </div>

                        <div className="users-section">
                            <div className="users-tabs">
                                <button className="tab-btn active">Doctors ({users.doctors.length})</button>
                                <button className="tab-btn">Patients ({users.patients.length})</button>
                                <button className="tab-btn">Pharmacists ({users.pharmacists.length})</button>
                            </div>

                            <div className="users-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Specialty</th>
                                            <th>Status</th>
                                            <th>Patients</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.doctors.map(doctor => (
                                            <tr key={doctor.id}>
                                                <td>{doctor.name}</td>
                                                <td>{doctor.specialty}</td>
                                                <td>
                                                    <span className={`badge badge-${doctor.status === 'active' ? 'success' : 'warning'}`}>
                                                        {doctor.status}
                                                    </span>
                                                </td>
                                                <td>{doctor.patients}</td>
                                                <td>
                                                    <button className="btn btn-secondary btn-sm">View</button>
                                                    <button className="btn btn-primary btn-sm">Edit</button>
                                                    <button className="btn btn-accent btn-sm" onClick={() => deleteUser(doctor.id)}>Deactivate</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'approvals' && (
                    <div className="dashboard-content">
                        <div className="content-header">
                            <h1>Doctor Approvals</h1>
                            <p>{pendingDoctors.length} pending applications</p>
                        </div>

                        <div className="approvals-section">
                            {pendingDoctors.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">✓</div>
                                    <h3>No Pending Approvals</h3>
                                    <p>All doctor applications have been processed</p>
                                </div>
                            ) : (
                                <div className="approvals-grid">
                                    {pendingDoctors.map(doctor => (
                                        <div key={doctor.id} className="approval-card">
                                            <div className="approval-header">
                                                <div className="doctor-avatar">👨‍⚕️</div>
                                                <div className="doctor-info">
                                                    <h3>{doctor.name}</h3>
                                                    <p>{doctor.specialty}</p>
                                                </div>
                                            </div>
                                            <div className="approval-details">
                                                <div className="detail-row">
                                                    <span className="detail-label">Qualifications:</span>
                                                    <span className="detail-value">{doctor.qualifications}</span>
                                                </div>
                                                <div className="detail-row">
                                                    <span className="detail-label">Applied:</span>
                                                    <span className="detail-value">{doctor.appliedDate}</span>
                                                </div>
                                            </div>
                                            <div className="approval-actions">
                                                <button className="btn btn-accent" onClick={() => approveDoctor(doctor.id)}>
                                                    ✓ Approve
                                                </button>
                                                <button className="btn btn-secondary" onClick={() => rejectDoctor(doctor.id)}>
                                                    × Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'appointments' && (
                    <div className="dashboard-content">
                        <div className="content-header">
                            <h1>Appointments Monitoring</h1>
                            <div className="search-box">
                                <input type="text" placeholder="Search appointments..." className="form-input" />
                            </div>
                        </div>

                        <div className="appointments-section">
                            <div className="appointments-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Patient</th>
                                            <th>Doctor</th>
                                            <th>Date</th>
                                            <th>Time</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>#APT001</td>
                                            <td>John Doe</td>
                                            <td>Dr. Smith</td>
                                            <td>2025-11-29</td>
                                            <td>10:00 AM</td>
                                            <td><span className="badge badge-primary">Scheduled</span></td>
                                            <td><button className="btn btn-secondary btn-sm">View</button></td>
                                        </tr>
                                        <tr>
                                            <td>#APT002</td>
                                            <td>Jane Smith</td>
                                            <td>Dr. Williams</td>
                                            <td>2025-11-29</td>
                                            <td>11:30 AM</td>
                                            <td><span className="badge badge-warning">In Progress</span></td>
                                            <td><button className="btn btn-secondary btn-sm">View</button></td>
                                        </tr>
                                        <tr>
                                            <td>#APT003</td>
                                            <td>Robert Johnson</td>
                                            <td>Dr. Brown</td>
                                            <td>2025-11-28</td>
                                            <td>2:00 PM</td>
                                            <td><span className="badge badge-success">Completed</span></td>
                                            <td><button className="btn btn-secondary btn-sm">View</button></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'transactions' && (
                    <div className="dashboard-content">
                        <div className="content-header">
                            <h1>Transaction History</h1>
                            <select className="form-select" style={{ width: 'auto' }}>
                                <option>All Transactions</option>
                                <option>Consultations</option>
                                <option>Medicines</option>
                                <option>Lab Tests</option>
                            </select>
                        </div>

                        <div className="transactions-section">
                            <div className="transactions-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Transaction ID</th>
                                            <th>User</th>
                                            <th>Type</th>
                                            <th>Amount</th>
                                            <th>Payment Method</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>#TXN001</td>
                                            <td>John Doe</td>
                                            <td>Consultation</td>
                                            <td>₹1,500</td>
                                            <td>Razorpay</td>
                                            <td><span className="badge badge-success">Success</span></td>
                                            <td>2025-11-28</td>
                                        </tr>
                                        <tr>
                                            <td>#TXN002</td>
                                            <td>Jane Smith</td>
                                            <td>Medicine</td>
                                            <td>₹2,480</td>
                                            <td>Stripe</td>
                                            <td><span className="badge badge-success">Success</span></td>
                                            <td>2025-11-28</td>
                                        </tr>
                                        <tr>
                                            <td>#TXN003</td>
                                            <td>Robert Johnson</td>
                                            <td>Lab Test</td>
                                            <td>₹890</td>
                                            <td>COD</td>
                                            <td><span className="badge badge-warning">Pending</span></td>
                                            <td>2025-11-27</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'reports' && (
                    <div className="dashboard-content">
                        <div className="content-header">
                            <h1>Reports & Analytics</h1>
                            <button className="btn btn-primary">Generate Report</button>
                        </div>

                        <div className="reports-section">
                            <div className="reports-grid">
                                <div className="report-card">
                                    <div className="report-icon">📊</div>
                                    <h3>Monthly Report</h3>
                                    <p>Comprehensive monthly analytics</p>
                                    <button className="btn btn-secondary">Download PDF</button>
                                </div>
                                <div className="report-card">
                                    <div className="report-icon">💰</div>
                                    <h3>Revenue Report</h3>
                                    <p>Detailed revenue breakdown</p>
                                    <button className="btn btn-secondary">Download PDF</button>
                                </div>
                                <div className="report-card">
                                    <div className="report-icon">👥</div>
                                    <h3>User Growth Report</h3>
                                    <p>User acquisition metrics</p>
                                    <button className="btn btn-secondary">Download PDF</button>
                                </div>
                                <div className="report-card">
                                    <div className="report-icon">📈</div>
                                    <h3>Performance Report</h3>
                                    <p>Platform performance metrics</p>
                                    <button className="btn btn-secondary">Download PDF</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
