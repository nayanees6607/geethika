import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <div>Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check if user role is allowed
    if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
        // Redirect to their appropriate dashboard
        const dashboardMap = {
            patient: '/dashboard',
            doctor: '/dashboard/doctor',
            pharmacist: '/dashboard/pharmacist',
            admin: '/dashboard/admin'
        };
        return <Navigate to={dashboardMap[user.role] || '/login'} replace />;
    }

    return children;
};

export default ProtectedRoute;
