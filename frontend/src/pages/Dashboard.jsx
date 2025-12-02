import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import ProfileDropdown from '../components/ProfileDropdown';
import './Dashboard.css';

const Dashboard = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState({
        prescriptions: 0,
        appointments: 0,
        orders: 0
    });
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        // Fetch user stats
        const fetchStats = async () => {
            try {
                if (user?.id) {
                    const presRes = await axios.get(`/api/patients/prescriptions/${user.id}`).catch(() => ({ data: [] }));

                    setStats(prev => ({
                        ...prev,
                        prescriptions: presRes.data.length || 0
                    }));
                }
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };

        fetchStats();
    }, [isAuthenticated, navigate, user]);

    // Handle navigation for external pages
    useEffect(() => {
        if (activeTab === 'doctors') {
            navigate('/doctors');
        } else if (activeTab === 'pharmacy') {
            navigate('/pharmacy');
        } else if (activeTab === 'appointments') {
            navigate('/appointments');
        } else if (activeTab === 'upload-prescription') {
            navigate('/upload-prescription');
        }
    }, [activeTab, navigate]);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        try {
            // Use the main doctors API endpoint with search query
            const response = await axios.get(`/api/doctors?search=${searchQuery}`);
            setDoctors(response.data);
            // Scroll to results
            document.getElementById('search-results')?.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Error searching doctors:', error);
            alert('Failed to search doctors. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="dashboard-content">
                        <section className="hero">
                            <div className="container">
                                <div className="hero-search-section">
                                    <h1 className="hero-title">Welcome back, {user?.name || 'Patient'}</h1>
                                    <p className="hero-subtitle">
                                        Manage your health, book appointments, and order medicines
                                    </p>

                                    <div className="dashboard-stats">
                                        <div className="stat-card">
                                            <h3>{stats.appointments}</h3>
                                            <p>Upcoming Appointments</p>
                                        </div>
                                        <div className="stat-card">
                                            <h3>{stats.prescriptions}</h3>
                                            <p>Active Prescriptions</p>
                                        </div>
                                        <div className="stat-card">
                                            <h3>{stats.orders}</h3>
                                            <p>Pending Orders</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSearch} className="search-container">
                                        <input
                                            type="text"
                                            className="search-input"
                                            placeholder="Search for doctors, specialties, or services"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                        <button type="submit" className="search-btn" disabled={loading}>
                                            {loading ? 'Searching...' : 'Search'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </section>

                        {/* Search Results */}
                        {doctors.length > 0 && (
                            <section id="search-results" className="section">
                                <div className="container">
                                    <h2 className="section-title">Search Results</h2>
                                    <div className="doctors-grid">
                                        {doctors.map(doctor => (
                                            <div key={doctor._id} className="doctor-card">
                                                <div className="doctor-info">
                                                    <h3>Dr. {doctor.name}</h3>
                                                    <p className="specialty">{doctor.specialization}</p>
                                                    <p className="experience">{doctor.experience} years experience</p>
                                                    <Link to={`/doctors/${doctor._id}`} className="btn btn-sm">View Profile</Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Services Section */}
                        <section className="section services">
                            <div className="container">
                                <h2 className="section-title text-center">Quick Actions</h2>

                                <div className="services-grid">
                                    <Link to="/pharmacy" className="service-card">
                                        <div className="service-icon green">💊</div>
                                        <h3>Order Medicines</h3>
                                        <p>Upload prescription or browse medicines</p>
                                        <span className="explore-link">Go to Pharmacy →</span>
                                    </Link>

                                    <Link to="/appointments" className="service-card">
                                        <div className="service-icon blue">📅</div>
                                        <h3>Book Appointment</h3>
                                        <p>Find doctors and schedule visits</p>
                                        <span className="explore-link">Find Doctors →</span>
                                    </Link>

                                    <Link to="/upload-prescription" className="service-card">
                                        <div className="service-icon purple">📄</div>
                                        <h3>Upload Prescription</h3>
                                        <p>Submit a new prescription for review</p>
                                        <span className="explore-link">Upload Now →</span>
                                    </Link>

                                    <div className="service-card service-card-full">
                                        <div className="service-icon red">📋</div>
                                        <h3>Medical History</h3>
                                        <p>View your past records and reports</p>
                                        <span className="explore-link">View Records →</span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                );
            case 'prescriptions':
                return (
                    <div className="dashboard-content">
                        <h1>My Prescriptions</h1>
                        <p>Prescription history will appear here.</p>
                        {/* Placeholder for future implementation */}
                    </div>
                );
            case 'appointments':
                return (
                    <div className="dashboard-content">
                        <h1>My Appointments</h1>
                        <p>Upcoming and past appointments will appear here.</p>
                        {/* Placeholder for future implementation */}
                    </div>
                );
            case 'orders':
                return (
                    <div className="dashboard-content">
                        <h1>My Orders</h1>
                        <p>Order history will appear here.</p>
                        {/* Placeholder for future implementation */}
                    </div>
                );
            case 'profile':
                return (
                    <div className="dashboard-content">
                        <h1>My Profile</h1>
                        <p>Profile settings will appear here.</p>
                        {/* Placeholder for future implementation */}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="dashboard-container" style={{ display: 'flex' }}>
            <Sidebar
                role="patient"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                user={user}
            />
            <div className="dashboard-main" style={{ flex: 1, overflowY: 'auto', height: '100vh' }}>
                <div style={{ padding: '30px' }}>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;