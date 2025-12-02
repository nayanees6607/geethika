import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Appointments.css';

const Appointments = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        fetchAppointments();
    }, [isAuthenticated]);

    const fetchAppointments = async () => {
        try {
            const response = await axios.get('/api/appointments/my');
            setAppointments(response.data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) {
            return;
        }

        try {
            await axios.patch(`/api/appointments/${id}/cancel`);
            fetchAppointments(); // Refresh list
            alert('Appointment cancelled successfully');
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            alert('Error cancelling appointment');
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'Booked': return 'badge-booked';
            case 'Completed': return 'badge-completed';
            case 'Cancelled': return 'badge-cancelled';
            default: return '';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const isUpcoming = (appointmentDate) => {
        return new Date(appointmentDate) >= new Date().setHours(0, 0, 0, 0);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="appointments-page">
            <div className="container">
                <div className="page-header">
                    <h1>My Appointments</h1>
                    <p>View and manage your healthcare appointments</p>
                </div>

                {appointments.length > 0 ? (
                    <div className="appointments-list">
                        {appointments.map((appointment) => (
                            <div key={appointment._id} className="appointment-card">
                                <div className="appointment-header">
                                    <div className="appointment-info">
                                        <h3>{appointment.doctorId?.name || 'Doctor'}</h3>
                                        <p className="appointment-spec">
                                            {appointment.doctorId?.specialization || 'Specialist'}
                                        </p>
                                    </div>
                                    <span className={`badge ${getStatusBadgeClass(appointment.status)}`}>
                                        {appointment.status}
                                    </span>
                                </div>

                                <div className="appointment-details">
                                    <div className="detail-item">
                                        <span className="detail-icon">📅</span>
                                        <span>{formatDate(appointment.appointmentDate)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-icon">🕐</span>
                                        <span>{appointment.timeSlot}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-icon">💵</span>
                                        <span>₹{appointment.doctorId?.consultationFee || 0}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-icon">📍</span>
                                        <span>{appointment.doctorId?.location || 'Clinic'}</span>
                                    </div>
                                </div>

                                {appointment.reason && (
                                    <div className="appointment-reason">
                                        <strong>Reason:</strong> {appointment.reason}
                                    </div>
                                )}

                                {appointment.status === 'Booked' && isUpcoming(appointment.appointmentDate) && (
                                    <div className="card-actions">
                                        <button
                                            className="cancel-btn"
                                            onClick={() => handleCancel(appointment._id)}
                                        >
                                            Cancel Appointment
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">📅</div>
                        <h3>No appointments yet</h3>
                        <p>Book your first appointment with a doctor</p>
                        <button onClick={() => navigate('/doctors')} className="btn btn-primary">
                            Find Doctors
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Appointments;
