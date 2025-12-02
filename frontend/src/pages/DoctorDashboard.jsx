import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';
import DoctorPatientsPage from '../components/DoctorPatientsPage';
import DoctorSchedulePage from '../components/DoctorSchedulePage';
import Sidebar from '../components/Sidebar';
import ProfileDropdown from '../components/ProfileDropdown';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [stats, setStats] = useState({ totalPatients: 0, pendingReports: 0 });
    const [loading, setLoading] = useState(true);

    const { socket } = useSocket();

    useEffect(() => {
        if (activeTab === 'overview') {
            fetchDashboardData();
        }
    }, [activeTab]);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login/doctor');
            return;
        }
        fetchDashboardData();

        if (socket) {
            console.log('DoctorDashboard: Socket available, setting up listeners');
            socket.on('new_appointment', () => {
                console.log('DoctorDashboard: Received new_appointment event');
                fetchDashboardData();
            });
            socket.on('new_patient', () => {
                console.log('DoctorDashboard: Received new_patient event');
                fetchDashboardData();
            });
            socket.on('notification', () => {
                console.log('DoctorDashboard: Received notification event');
                fetchDashboardData();
            });
        }

        // Poll for new notifications every 30 seconds as backup
        const interval = setInterval(() => {
            fetchNotifications();
        }, 30000);

        return () => {
            clearInterval(interval);
            if (socket) {
                socket.off('new_appointment');
                socket.off('new_patient');
                socket.off('notification');
            }
        };
    }, [isAuthenticated, navigate, socket]);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [statsRes, notifRes, countRes] = await Promise.all([
                axios.get('/api/doctor/stats', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('/api/notifications', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('/api/notifications/unread-count', { headers: { Authorization: `Bearer ${token}` } })
            ]);

            setStats(statsRes.data);
            setNotifications(notifRes.data.slice(0, 5));
            setUnreadCount(countRes.data.count);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const [notifRes, countRes] = await Promise.all([
                axios.get('/api/notifications', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('/api/notifications/unread-count', {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setNotifications(notifRes.data.slice(0, 5)); // Show only 5 most recent
            setUnreadCount(countRes.data.count);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch('/api/notifications/mark-all-read', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNotifications();
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const updatedData = {
            name: formData.get('name'), // Assuming name input has name="name"
            specialization: formData.get('specialization'), // Assuming input has name="specialization"
            consultationFee: formData.get('consultationFee'), // Assuming input has name="consultationFee"
            symptoms: formData.get('symptoms').split(',').map(s => s.trim()).filter(s => s)
        };

        try {
            await axios.put(`/api/doctors/${user.userId}`, updatedData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            alert('Profile updated successfully');
            // Optionally refresh user data here
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        }
    };

    const handleUpdateSchedule = async () => {
        // Implement schedule update logic
        alert('Schedule update functionality would go here');
    };



    return (
        <div className="doctor-dashboard">
            <Sidebar
                role="doctor"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                user={user}
            />

            <div className="dashboard-main">
                <div className="dashboard-header">
                    <div className="dashboard-header-left">
                        <h2>Dashboard</h2>
                    </div>
                </div>

                {activeTab === 'overview' && (
                    <div className="dashboard-content">
                        <div className="content-header">
                            <h1>Dashboard Overview</h1>
                            <p>Welcome back, Dr. {user?.name || 'Smith'}</p>
                        </div>

                        <div className="stats-grid">

                            <div className="stat-card">
                                <div className="stat-icon green">👥</div>
                                <div className="stat-info">
                                    <h3>{stats.totalPatients}</h3>
                                    <p>Total Patients</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon purple">📋</div>
                                <div className="stat-info">
                                    <h3>{stats.pendingReports}</h3>
                                    <p>Pending Reports</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon red">🔔</div>
                                <div className="stat-info">
                                    <h3>{unreadCount}</h3>
                                    <p>New Notifications</p>
                                </div>
                            </div>
                        </div>

                        <div className="dashboard-grid">


                            <div className="dashboard-card">
                                <div className="card-header">
                                    <h2>Notifications</h2>
                                    <button className="btn-link" onClick={handleMarkAllRead}>Mark all read</button>
                                </div>
                                <div className="notifications-list">
                                    {notifications.length === 0 ? (
                                        <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>No notifications</p>
                                    ) : (
                                        notifications.map(notif => (
                                            <div key={notif._id} className={`notification-item ${!notif.isRead ? 'unread' : ''}`}>
                                                <div className="notification-content">
                                                    <p>{notif.message}</p>
                                                    <span className="notification-time">
                                                        {new Date(notif.createdAt).toLocaleString()}
                                                    </span>
                                                </div>
                                                {!notif.isRead && <div className="unread-dot"></div>}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}



                {activeTab === 'patients' && <DoctorPatientsPage />}

                {activeTab === 'schedule' && <DoctorSchedulePage />}

                {activeTab === 'profile' && (
                    <div className="dashboard-content">
                        <div className="content-header">
                            <h1>Profile Settings</h1>
                            <p>Manage your professional information</p>
                        </div>

                        <div className="profile-section">
                            <div className="dashboard-card">
                                <h2>Personal Information</h2>
                                <form onSubmit={handleUpdateProfile}>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Full Name</label>
                                            <input type="text" name="name" className="form-input" defaultValue={user?.name} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Specialization</label>
                                            <input type="text" name="specialization" className="form-input" defaultValue={user?.specialization} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Treated Symptoms (comma separated)</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            name="symptoms"
                                            defaultValue={user?.symptoms?.join(', ')}
                                            placeholder="e.g. Fever, Back Pain, Headache"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Consultation Fee (₹)</label>
                                        <input type="number" name="consultationFee" className="form-input" defaultValue={user?.consultationFee || 1500} />
                                    </div>
                                    <button type="submit" className="btn btn-primary">Save Changes</button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorDashboard;
