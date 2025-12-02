import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './DoctorProfile.css';

const DoctorProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingForm, setBookingForm] = useState({
        appointmentDate: '',
        timeSlot: { startTime: '', endTime: '' },
        symptoms: '',
        consultationType: 'in-person'
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchDoctor();
    }, [id]);

    const fetchDoctor = async () => {
        try {
            const response = await axios.get(`/api/doctors/${id}`);
            setDoctor(response.data);
        } catch (error) {
            console.error('Error fetching doctor:', error);
            setMessage({ type: 'error', text: 'Failed to load doctor profile' });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'startTime' || name === 'endTime') {
            setBookingForm({
                ...bookingForm,
                timeSlot: { ...bookingForm.timeSlot, [name]: value }
            });
        } else {
            setBookingForm({ ...bookingForm, [name]: value });
        }
    };

    const handleBooking = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        try {
            // First, we need to create a slot in the doctor's schedule or use existing one
            // For now, we'll create the appointment using the old method but also create the doctor-patient relationship
            const token = localStorage.getItem('token');

            // Create appointment using the new patient booking endpoint
            const response = await axios.post('/api/patient/appointments', {
                doctorId: id,
                date: bookingForm.appointmentDate,
                startTime: bookingForm.timeSlot.startTime,
                endTime: bookingForm.timeSlot.endTime,
                symptoms: bookingForm.symptoms,
                consultationType: bookingForm.consultationType
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage({ type: 'success', text: 'Appointment booked successfully! Doctor will review your request.' });
            setTimeout(() => navigate('/appointments'), 2000);
        } catch (error) {
            console.error('Booking error:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to book appointment'
            });
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!doctor) {
        return (
            <div className="container section">
                <div className="empty-state">
                    <h2>Doctor not found</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="doctor-profile-page">
            <div className="container">
                <div className="profile-grid">
                    {/* Doctor Info */}
                    <div className="profile-card">
                        <div className="profile-header">
                            <div className="profile-avatar">
                                {doctor.name.charAt(0)}
                            </div>
                            <div>
                                <h1>{doctor.name}</h1>
                                <p className="profile-spec">
                                    <span className="badge badge-primary">{doctor.specialization || 'General Practice'}</span>
                                </p>
                            </div>
                        </div>

                        <div className="profile-details">
                            <div className="detail-row">
                                <span className="detail-label">🎓 Qualifications</span>
                                <span className="detail-value">{doctor.qualifications || 'Not specified'}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">💼 Experience</span>
                                <span className="detail-value">{doctor.experience || 0} years</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">💰 Consultation Fee</span>
                                <span className="detail-value">${doctor.consultationFee || 50}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">📧 Email</span>
                                <span className="detail-value">{doctor.email}</span>
                            </div>
                            {doctor.phone && (
                                <div className="detail-row">
                                    <span className="detail-label">📞 Phone</span>
                                    <span className="detail-value">{doctor.phone}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Booking Form */}
                    <div className="booking-card">
                        <h2>Book Appointment</h2>

                        {message.text && (
                            <div className={`alert alert-${message.type}`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleBooking} className="booking-form">
                            <div className="form-group">
                                <label htmlFor="appointmentDate" className="form-label">Appointment Date</label>
                                <input
                                    type="date"
                                    id="appointmentDate"
                                    name="appointmentDate"
                                    className="form-input"
                                    value={bookingForm.appointmentDate}
                                    onChange={handleInputChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="startTime" className="form-label">Start Time</label>
                                    <input
                                        type="time"
                                        id="startTime"
                                        name="startTime"
                                        className="form-input"
                                        value={bookingForm.timeSlot.startTime}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="endTime" className="form-label">End Time</label>
                                    <input
                                        type="time"
                                        id="endTime"
                                        name="endTime"
                                        className="form-input"
                                        value={bookingForm.timeSlot.endTime}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="consultationType" className="form-label">Consultation Type</label>
                                <select
                                    id="consultationType"
                                    name="consultationType"
                                    className="form-select"
                                    value={bookingForm.consultationType}
                                    onChange={handleInputChange}
                                >
                                    <option value="in-person">In-Person</option>
                                    <option value="online">Online</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="symptoms" className="form-label">Symptoms / Reason for Visit</label>
                                <textarea
                                    id="symptoms"
                                    name="symptoms"
                                    className="form-textarea"
                                    value={bookingForm.symptoms}
                                    onChange={handleInputChange}
                                    placeholder="Describe your symptoms or reason for the appointment..."
                                    rows="4"
                                ></textarea>
                            </div>

                            <button type="submit" className="btn btn-primary btn-block">
                                Book Appointment
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorProfile;
