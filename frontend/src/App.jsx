import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DoctorRegister from './pages/DoctorRegister';
import DoctorLogin from './pages/DoctorLogin';
import PharmacistLogin from './pages/PharmacistLogin';
import PharmacistRegister from './pages/PharmacistRegister';
import AdminLogin from './pages/AdminLogin';
import PatientLogin from './pages/PatientLogin';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOTP from './pages/VerifyOTP';
import ResetPassword from './pages/ResetPassword';
import Doctors from './pages/Doctors';
import DoctorProfile from './pages/DoctorProfile';
import Appointments from './pages/Appointments';
import Pharmacy from './pages/Pharmacy';
import Cart from './pages/Cart';
import Dashboard from './pages/Dashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import PharmacistDashboard from './pages/PharmacistDashboard';
import AdminDashboard from './pages/AdminDashboard';
import About from './pages/About';
import Contact from './pages/Contact';
// Prescription Order Workflow Components
import UploadPrescription from './pages/UploadPrescription.jsx';
import ViewOrder from './pages/ViewOrder.jsx';
import PaymentPage from './pages/PaymentPage.jsx';

function AppContent() {
    const location = useLocation();

    // Only hide navbar on pharmacist login page
    // Show navbar everywhere else including for all users (logged in or not)
    const hideNavbar = location.pathname === '/login/pharmacist';

    return (
        <div className="app">
            {!hideNavbar && <Navbar />}
            <main className="main-content">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/login/doctor" element={<DoctorLogin />} />
                    <Route path="/login/pharmacist" element={<PharmacistLogin />} />
                    <Route path="/login/admin" element={<AdminLogin />} />
                    <Route path="/login/patient" element={<PatientLogin />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/register/doctor" element={<DoctorRegister />} />
                    <Route path="/register/pharmacist" element={<PharmacistRegister />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/verify-otp" element={<VerifyOTP />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/doctors" element={<Doctors />} />
                    <Route path="/doctors/:id" element={<DoctorProfile />} />
                    <Route path="/appointments" element={<Appointments />} />
                    <Route path="/pharmacy" element={<Pharmacy />} />
                    <Route path="/cart" element={<Cart />} />

                    {/* Patient Routes */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute allowedRoles={['patient']}>
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/upload-prescription" element={
                        <ProtectedRoute allowedRoles={['patient']}>
                            <UploadPrescription />
                        </ProtectedRoute>
                    } />
                    <Route path="/view-order/:orderId" element={
                        <ProtectedRoute allowedRoles={['patient']}>
                            <ViewOrder />
                        </ProtectedRoute>
                    } />
                    <Route path="/payment/:orderId" element={
                        <ProtectedRoute allowedRoles={['patient']}>
                            <PaymentPage />
                        </ProtectedRoute>
                    } />

                    {/* Doctor Routes */}
                    <Route path="/dashboard/doctor" element={
                        <ProtectedRoute allowedRoles={['doctor']}>
                            <DoctorDashboard />
                        </ProtectedRoute>
                    } />

                    {/* Pharmacist Routes */}
                    <Route path="/dashboard/pharmacist" element={
                        <ProtectedRoute allowedRoles={['pharmacist']}>
                            <PharmacistDashboard />
                        </ProtectedRoute>
                    } />

                    {/* Admin Routes */}
                    <Route path="/dashboard/admin" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />
                </Routes>
            </main>
            <Footer />
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <SocketProvider>
                <Router>
                    <AppContent />
                </Router>
            </SocketProvider>
        </AuthProvider>
    );
}

export default App;