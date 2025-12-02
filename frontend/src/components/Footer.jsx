import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h4 className="footer-title">MediConnect</h4>
                        <p className="footer-text">
                            Your trusted healthcare platform for easy appointment booking and online pharmacy services.
                        </p>
                    </div>

                    <div className="footer-section">
                        <h5 className="footer-heading">Patients</h5>
                        <ul className="footer-links">
                            <li><Link to="/dashboard">My Dashboard</Link></li>
                            <li><Link to="/appointments">My Appointments</Link></li>
                            <li><Link to="/cart">My Orders</Link></li>
                            <li><a href="#lab-reports">My Lab Reports</a></li>
                            <li><a href="#health-records">Health Records</a></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h5 className="footer-heading">Quick Links</h5>
                        <ul className="footer-links">
                            <li><Link to="/doctors">Find Doctors</Link></li>
                            <li><Link to="/pharmacy">Pharmacy</Link></li>
                            <li><Link to="/appointments">Appointments</Link></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h5 className="footer-heading">Support</h5>
                        <ul className="footer-links">
                            <li><a href="#help">Help Center</a></li>
                            <li><a href="#privacy">Privacy Policy</a></li>
                            <li><a href="#terms">Terms of Service</a></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h5 className="footer-heading">Contact</h5>
                        <p className="footer-text">Email: support@mediconnect.com</p>
                        <p className="footer-text">Phone: 1-800-MEDICONNECT</p>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; 2024 MediConnect. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
