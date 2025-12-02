import React from 'react';
import './Sidebar.css';

const Sidebar = ({ role, activeTab, setActiveTab, user }) => {

    const getNavItems = () => {
        if (role === 'doctor') {
            return [
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'patients', label: 'Patients', icon: '👥' },
                { id: 'schedule', label: 'Schedule', icon: '🕐' },
                { id: 'profile', label: 'Profile', icon: '⚙️' }
            ];
        } else if (role === 'pharmacist') {
            return [
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'prescription-review', label: 'Prescription Review', icon: '📋' },
                { id: 'update-status', label: 'Update Status', icon: '🔄' },
                { id: 'inventory', label: 'Inventory', icon: '📦' },
                { id: 'sales', label: 'Sales', icon: '💰' }
            ];
        } else {
            // Patient items
            return [
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'doctors', label: 'Find Doctors', icon: '👨‍⚕️' },
                { id: 'pharmacy', label: 'Pharmacy', icon: '💊' },
                { id: 'upload-prescription', label: 'Upload Prescription', icon: '📄' },
                { id: 'appointments', label: 'Appointments', icon: '📅' },
                { id: 'orders', label: 'Orders', icon: '🛒' },
                { id: 'profile', label: 'Profile', icon: '👤' }
            ];
        }
    };

    const navItems = getNavItems();

    return (
        <div className="dashboard-sidebar">
            <div className="sidebar-header">
                <div className="user-avatar">
                    {role === 'doctor' ? '👨‍⚕️' : role === 'pharmacist' ? '💊' : '👤'}
                </div>
                <h3>{user?.name || (role === 'doctor' ? 'Doctor' : role === 'pharmacist' ? 'Pharmacist' : 'Patient')}</h3>
                <p className="user-role">
                    {role === 'doctor' ? user?.specialization || 'Specialist' : role === 'pharmacist' ? 'Pharmacist' : 'Patient'}
                </p>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(item.id)}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        {item.label}
                    </button>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;