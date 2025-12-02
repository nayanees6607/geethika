import React, { useState, useEffect } from 'react';

import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Doctors.css';

const Doctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState(null); // 'specialization' or 'symptom'
    const [filterValue, setFilterValue] = useState('');
    const [view, setView] = useState('categories'); // 'categories' or 'list'
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [bookingData, setBookingData] = useState({
        appointmentDate: '',
        timeSlot: '',
        reason: ''
    });

    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const specializations = [
        { name: 'Cardiology', icon: '❤️' },
        { name: 'Dermatology', icon: '🧴' },
        { name: 'Neurology', icon: '🧠' },
        { name: 'Pediatrics', icon: '👶' },
        { name: 'General Medicine', icon: '🩺' },
        { name: 'Orthopedics', icon: '🦴' },
        { name: 'Gynecology', icon: '👩' },
        { name: 'Dentistry', icon: '🦷' }
    ];

    const commonSymptoms = [
        { name: 'Fever', icon: '🌡️' },
        { name: 'Cold & Cough', icon: '🤧' },
        { name: 'Headache', icon: '🤕' },
        { name: 'Stomach Pain', icon: '🤢' },
        { name: 'Skin Rash', icon: '🔴' },
        { name: 'Back Pain', icon: '🔙' }
    ];

    useEffect(() => {
        if (view === 'list') {
            fetchDoctors();
        }
    }, [view, activeFilter, filterValue, searchTerm]);

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            let url = '/api/doctors';
            let params = {};

            if (activeFilter === 'specialization') {
                url = `/api/doctors/specialization/${filterValue}`;
            } else if (activeFilter === 'symptom') {
                url = `/api/doctors/symptom/${filterValue}`;
            } else if (searchTerm) {
                // If searching, use query params for search
                params = { search: searchTerm };
            }

            const response = await axios.get(url, { params });
            console.log('Doctors data received:', response.data);
            response.data.forEach(d => {
                console.log(`Doctor: ${d.name}`);
                console.log(`- isAvailable: ${d.isAvailable}`);
                console.log(`- Debug Info:`, d.debugInfo);
            });
            setDoctors(response.data);
        } catch (error) {
            console.error('Error fetching doctors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryClick = (type, value) => {
        setActiveFilter(type);
        setFilterValue(value);
        setView('list');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm) {
            setActiveFilter(null);
            setFilterValue('');
            setView('list');
        }
    };

    const handleBookClick = (doctor) => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        setSelectedDoctor(doctor);
        setShowBookingModal(true);
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/appointments', {
                doctorId: selectedDoctor._id,
                ...bookingData
            });
            alert('Appointment booked successfully!');
            setShowBookingModal(false);
            setBookingData({ appointmentDate: '', timeSlot: '', reason: '' });
            navigate('/appointments'); // Redirect to My Appointments
        } catch (error) {
            console.error('Error booking appointment:', error);
            alert(error.response?.data?.message || 'Error booking appointment');
        }
    };

    return (
        <div className="doctors-page">
            <div className="container">
                {/* Search Bar */}
                <div className="search-container">
                    <form onSubmit={handleSearch} className="search-form">
                        <input
                            type="text"
                            placeholder="Search doctors, specializations, or symptoms..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <button type="submit" className="search-btn">Search</button>
                    </form>
                </div>

                {view === 'categories' ? (
                    <>
                        {/* Specializations Grid */}
                        <section className="category-section">
                            <h2>Find by Specialization</h2>
                            <div className="category-grid">
                                {specializations.map((spec) => (
                                    <div
                                        key={spec.name}
                                        className="category-card"
                                        onClick={() => handleCategoryClick('specialization', spec.name)}
                                    >
                                        <div className="category-icon">{spec.icon}</div>
                                        <h3>{spec.name}</h3>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Symptoms Grid */}
                        <section className="category-section">
                            <h2>Find by Symptoms</h2>
                            <div className="category-grid">
                                {commonSymptoms.map((sym) => (
                                    <div
                                        key={sym.name}
                                        className="category-card"
                                        onClick={() => handleCategoryClick('symptom', sym.name)}
                                    >
                                        <div className="category-icon">{sym.icon}</div>
                                        <h3>{sym.name}</h3>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </>
                ) : (
                    /* Doctors List View */
                    <div className="doctors-list-container">
                        <button className="back-btn" onClick={() => setView('categories')}>
                            ← Back to Categories
                        </button>

                        <h2>
                            {activeFilter === 'specialization' ? `${filterValue} Doctors` :
                                activeFilter === 'symptom' ? `Doctors treating ${filterValue}` :
                                    'Search Results'}
                        </h2>

                        {loading ? (
                            <div className="loading-spinner">Loading...</div>
                        ) : doctors.length > 0 ? (
                            <div className="doctors-grid">
                                {doctors.map((doctor) => (
                                    <div key={doctor._id} className="doctor-card">
                                        <div className="doctor-header">
                                            <h3>{doctor.name}</h3>
                                            <span className={`status-badge ${doctor.isAvailable ? 'available' : 'unavailable'}`}>
                                                {doctor.isAvailable ? 'Available Now' : 'Not Available'}
                                            </span>
                                        </div>
                                        <p className="specialization">{doctor.specialization}</p>
                                        <div className="doctor-details">
                                            <p><strong>Experience:</strong> {doctor.experienceYears} years</p>
                                            <p><strong>Location:</strong> {doctor.location}</p>
                                            <p><strong>Fee:</strong> ₹{doctor.consultationFee}</p>
                                            <p><strong>Rating:</strong> ⭐ {doctor.rating}</p>
                                        </div>
                                        {doctor.symptomsHandled && (
                                            <div className="symptoms-tags">
                                                {doctor.symptomsHandled.map((s, i) => (
                                                    <span key={i} className="tag">{s}</span>
                                                ))}
                                            </div>
                                        )}
                                        <div className="card-actions">
                                            <button
                                                className="book-btn"
                                                disabled={!doctor.isAvailable}
                                                onClick={() => handleBookClick(doctor)}
                                                title={!doctor.isAvailable ? "Currently not available" : "Book Appointment"}
                                            >
                                                {doctor.isAvailable ? 'Book Appointment' : 'Not Available'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-icon">🔍</div>
                                <h3>No doctors found</h3>
                                <p>Try adjusting your search criteria or browse by category</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Booking Modal */}
                {showBookingModal && selectedDoctor && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>Book Appointment</h3>
                            <div className="doctor-summary">
                                <p><strong>Doctor:</strong> {selectedDoctor.name}</p>
                                <p><strong>Specialization:</strong> {selectedDoctor.specialization}</p>
                            </div>
                            <form onSubmit={handleBookingSubmit}>
                                <div className="form-group">
                                    <label>Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={bookingData.appointmentDate}
                                        onChange={(e) => setBookingData({ ...bookingData, appointmentDate: e.target.value })}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Time Slot</label>
                                    <select
                                        required
                                        value={bookingData.timeSlot}
                                        onChange={(e) => setBookingData({ ...bookingData, timeSlot: e.target.value })}
                                    >
                                        <option value="">Select a slot</option>
                                        <option value="09:00 AM - 09:30 AM">09:00 AM - 09:30 AM</option>
                                        <option value="09:30 AM - 10:00 AM">09:30 AM - 10:00 AM</option>
                                        <option value="10:00 AM - 10:30 AM">10:00 AM - 10:30 AM</option>
                                        <option value="10:30 AM - 11:00 AM">10:30 AM - 11:00 AM</option>
                                        <option value="11:00 AM - 11:30 AM">11:00 AM - 11:30 AM</option>
                                        <option value="11:30 AM - 12:00 PM">11:30 AM - 12:00 PM</option>
                                        <option value="02:00 PM - 02:30 PM">02:00 PM - 02:30 PM</option>
                                        <option value="02:30 PM - 03:00 PM">02:30 PM - 03:00 PM</option>
                                        <option value="04:00 PM - 04:30 PM">04:00 PM - 04:30 PM</option>
                                        <option value="04:30 PM - 05:00 PM">04:30 PM - 05:00 PM</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Reason for Visit</label>
                                    <textarea
                                        required
                                        value={bookingData.reason}
                                        onChange={(e) => setBookingData({ ...bookingData, reason: e.target.value })}
                                        placeholder="Briefly describe your symptoms..."
                                        rows="3"
                                    ></textarea>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" onClick={() => setShowBookingModal(false)} className="cancel-btn">Cancel</button>
                                    <button type="submit" className="confirm-btn">Confirm Booking</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Doctors;
