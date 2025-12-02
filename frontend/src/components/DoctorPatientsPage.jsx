import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './DoctorPatientsPage.css';

const DoctorPatientsPage = () => {
    const { user } = useAuth();
    const [patients, setPatients] = useState([]);
    const [filter, setFilter] = useState('All Patients');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPatients();
    }, [filter, search]);

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/doctor/patients', {
                params: { status: filter, search },
                headers: { Authorization: `Bearer ${token}` }
            });
            setPatients(res.data);
            setError('');
        } catch (err) {
            console.error('Error fetching patients:', err);
            setError('Failed to load patients');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (patientId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const endpoint = newStatus === 'accepted' ? 'accept' : 'reject';

            await axios.patch(`/api/doctor/patients/${patientId}/${endpoint}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update UI locally
            setPatients(prev => prev.map(p => {
                if (p.patientId === patientId) {
                    return { ...p, status: newStatus };
                }
                return p;
            }));

            // Show success message (could be a toast)
            alert(`Patient ${newStatus} successfully`);
        } catch (err) {
            console.error(`Error updating status to ${newStatus}:`, err);
            alert('Failed to update status');
        }
    };

    return (
        <div className="doctor-patients-page">
            <div className="content-header">
                <h1>My Patients</h1>
                <div className="header-controls">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Search by name, email, phone..."
                            className="form-input"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="filters-bar">
                {['All Patients', 'New Patients', 'Pending Records'].map(f => (
                    <button
                        key={f}
                        className={`filter-btn ${filter === f ? 'active' : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {error && <div className="error-message">{error}</div>}
            {loading ? <div className="loading">Loading...</div> : (
                <div className="patients-list">
                    {patients.length === 0 ? (
                        <p className="no-data">No patients found.</p>
                    ) : (
                        patients.map(patient => (
                            <div key={patient.doctorPatientId} className="patient-row-card">
                                <div className="patient-avatar">
                                    {patient.avatar ? (
                                        <img src={patient.avatar} alt={patient.name} />
                                    ) : (
                                        <div className="avatar-placeholder">
                                            {patient.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>

                                <div className="patient-details">
                                    <h3>{patient.name}</h3>
                                    <span className="patient-id">{patient.patientId}</span>
                                </div>

                                <div className="patient-info-middle">
                                    <div className="info-item">
                                        <label>Last Visit</label>
                                        <span>{new Date(patient.lastVisit).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="status-badge-container">
                                    <span className={`status-badge ${patient.status}`}>
                                        {patient.status}
                                    </span>
                                </div>

                                <div className="patient-actions">
                                    <button
                                        className="btn btn-success btn-sm"
                                        onClick={() => handleStatusUpdate(patient._id, 'accepted')}
                                        disabled={patient.status === 'accepted'}
                                    >
                                        Accept
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleStatusUpdate(patient._id, 'rejected')}
                                        disabled={patient.status === 'rejected'}
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default DoctorPatientsPage;
