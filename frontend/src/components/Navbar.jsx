import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfileDropdown from './ProfileDropdown';
import './Navbar.css';

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Determine user role
    const getUserRole = () => {
        if (location.pathname.includes('/dashboard/doctor')) {
            return 'doctor';
        }
        if (location.pathname.includes('/dashboard/pharmacist')) {
            return 'pharmacist';
        }
        return 'patient';
    };

    // Removed unused variables since we're showing the full navbar on all pages

    return (
        <nav className="navbar">
            <div className="container navbar-container">
                <Link to="/" className="navbar-brand">
                    <span className="brand-icon">🏥</span>
                    <span className="brand-text">MediConnect</span>
                </Link>

                <button
                    className="navbar-toggle"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <div className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
                    <>
                        <Link to="/" className="nav-link">Home</Link>
                        <Link to="/doctors" className="nav-link">Find Doctors</Link>
                        <Link to="/pharmacy" className="nav-link">Pharmacy</Link>
                        <Link to="/about" className="nav-link">About</Link>
                        <Link to="/contact" className="nav-link">Contact Us</Link>
                        {isAuthenticated ? (
                            <>
                                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                                <Link to="/appointments" className="nav-link">My Appointments</Link>
                                <ProfileDropdown
                                    user={user}
                                    role={getUserRole()}
                                    onLogout={handleLogout}
                                />
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-secondary">Login</Link>
                                <Link to="/register" className="btn btn-primary">Sign Up</Link>
                            </>
                        )}
                    </>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
