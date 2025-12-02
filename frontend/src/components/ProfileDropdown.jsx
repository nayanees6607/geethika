import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ProfileDropdown.css';

const ProfileDropdown = ({ user, role, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        setIsOpen(false);
        onLogout();
    };

    const getUserInitial = () => {
        if (user?.name) {
            return user.name.charAt(0).toUpperCase();
        }
        return 'U';
    };

    const getMenuItems = () => {
        if (role === 'doctor') {
            return [
                { icon: '👤', label: 'My Account', path: '/dashboard/doctor' },
                { icon: '👥', label: 'My Patients', path: '/dashboard/doctor', tab: 'patients' },
                { icon: '📅', label: 'My Schedule', path: '/dashboard/doctor', tab: 'schedule' },
                { icon: '💬', label: 'Consultation History', path: '/dashboard/doctor' },
                { icon: '⚙️', label: 'Settings', path: '/dashboard/doctor', tab: 'profile' },
            ];
        } else if (role === 'pharmacist') {
            return [
                { icon: '👤', label: 'My Account', path: '/dashboard/pharmacist' },
                { icon: '📦', label: 'Inventory', path: '/dashboard/pharmacist', tab: 'inventory' },
                { icon: '🛒', label: 'Orders', path: '/dashboard/pharmacist', tab: 'orders' },
                { icon: '💰', label: 'Sales', path: '/dashboard/pharmacist', tab: 'sales' },
                { icon: '📋', label: 'Prescriptions', path: '/dashboard/pharmacist', tab: 'prescriptions' },
                { icon: '⚙️', label: 'Settings', path: '/dashboard/pharmacist' },
            ];
        } else {
            // Patient menu items
            return [
                { icon: '👤', label: 'My Account', path: '/dashboard' },
                { icon: '📍', label: 'My Addresses', path: '/dashboard' },
                { icon: '🛍️', label: 'Purchase History', path: '/dashboard', tab: 'orders' },
                { icon: '🔬', label: 'My Lab Orders', path: '/dashboard' },
                { icon: '👨‍⚕️', label: 'My Doctor Consultations', path: '/appointments' },
                { icon: '📋', label: 'Health Records', path: '/dashboard' },
                { icon: '💰', label: 'My Wallet', path: '/dashboard' },
                { icon: '📝', label: 'My Complaints', path: '/dashboard' },
            ];
        }
    };

    const handleMenuItemClick = (item) => {
        setIsOpen(false);
        if (item.path) {
            navigate(item.path);
        }
    };

    const menuItems = getMenuItems();

    return (
        <div className="profile-dropdown-container" ref={dropdownRef}>
            <button
                className="profile-trigger"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="User menu"
            >
                <div className="profile-avatar">
                    {getUserInitial()}
                </div>
                <div className="profile-name">
                    <span>{user?.name?.split(' ')[0] || 'User'}</span>
                    <span className="dropdown-arrow">▼</span>
                </div>
            </button>

            <div className={`profile-dropdown-menu ${isOpen ? 'open' : ''}`}>
                <div className="dropdown-menu-header">
                    <div className="profile-name">{user?.name || 'User'}</div>
                    <div className="profile-email">{user?.email || ''}</div>
                </div>

                <div className="dropdown-menu-items">
                    {menuItems.map((item, index) => (
                        <button
                            key={index}
                            className="dropdown-menu-item"
                            onClick={() => handleMenuItemClick(item)}
                        >
                            <span className="menu-item-icon">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}

                    <button
                        className="dropdown-menu-item logout"
                        onClick={handleLogout}
                    >
                        <span className="menu-item-icon">🚪</span>
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileDropdown;
