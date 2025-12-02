const User = require('../models/User');
// const Patient = require('../models/Patient'); // Removed
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendOTPEmail } = require('../services/emailService');

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map();

// Periodically clean up expired OTPs
setInterval(() => {
    const now = Date.now();
    for (const [email, data] of otpStore.entries()) {
        if (now > data.expiry) {
            otpStore.delete(email);
        }
    }
}, 60000); // Clean up every minute

// Register
exports.register = async (req, res) => {
    try {
        const {
            name,
            firstName,
            lastName,
            email,
            password,
            role,
            phone,
            dateOfBirth,
            gender,
            emergencyContact,
            insuranceProvider,
            allergies,
            currentMedications,
            medicalHistory,
            specialization,
            qualifications,
            experience,
            consultationFee,
            employeeId,
            pharmacyName,
            licenseNumber,
            yearsOfExperience
        } = req.body;

        const userRole = role || 'patient';

        // Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Create new user (unified for all roles including patient)
        const userData = {
            email,
            password,
            role: userRole,
            phone
        };

        if (firstName && lastName) {
            userData.firstName = firstName;
            userData.lastName = lastName;
            userData.name = `${firstName} ${lastName}`;
        } else if (name) {
            userData.name = name;
        }

        // Add role-specific fields
        if (userRole === 'doctor') {
            userData.specialization = specialization;
            userData.qualifications = qualifications;
            userData.experience = experience;
            userData.consultationFee = consultationFee;
        } else if (userRole === 'pharmacist') {
            userData.employeeId = employeeId;
            userData.pharmacyName = pharmacyName;
            userData.licenseNumber = licenseNumber;
            userData.yearsOfExperience = yearsOfExperience;
        } else if (userRole === 'patient') {
            // Add patient-specific fields
            if (dateOfBirth) userData.dateOfBirth = dateOfBirth;
            if (gender) userData.gender = gender;
            if (emergencyContact) userData.emergencyContact = emergencyContact;
            if (insuranceProvider) userData.insuranceProvider = insuranceProvider;
            if (allergies) userData.allergies = allergies;
            if (currentMedications) userData.currentMedications = currentMedications;
            if (medicalHistory) userData.medicalHistory = medicalHistory;
            if (req.body.profileImage) userData.profileImage = req.body.profileImage;
        }

        user = new User(userData);
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check User collection
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};

// Forgot Password - Send OTP
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'No account found with this email' });
        }

        // Generate 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();

        // Store OTP with 5-minute expiration
        const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
        otpStore.set(email, { otp, expiry: otpExpiry, used: false });

        // Send OTP email using the email service
        const emailResult = await sendOTPEmail(email, user.name, otp);

        if (!emailResult.success) {
            // Remove OTP from store if email fails
            otpStore.delete(email);
            return res.status(500).json({
                message: 'Failed to send OTP email. Please try again.',
                error: emailResult.error
            });
        }

        res.json({
            message: 'OTP sent successfully to your email',
            email: email // Send back for verification page
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        // Remove OTP from store if email fails
        const { email } = req.body;
        if (email) {
            otpStore.delete(email);
        }
        res.status(500).json({
            message: 'Error sending OTP. Please try again.',
            error: error.message
        });
    }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Validate input
        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        // Check if OTP exists
        const storedData = otpStore.get(email);
        if (!storedData) {
            return res.status(400).json({ message: 'OTP not found or expired' });
        }

        // Check if OTP has expired
        if (Date.now() > storedData.expiry) {
            otpStore.delete(email);
            return res.status(400).json({ message: 'OTP has expired' });
        }

        // Check if OTP has been used
        if (storedData.used) {
            return res.status(400).json({ message: 'OTP has already been used' });
        }

        // Verify OTP (convert both to strings to ensure comparison works)
        if (storedData.otp.toString() !== otp.toString()) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Mark OTP as used (but keep it for password reset)
        storedData.used = true;
        otpStore.set(email, storedData);

        res.json({
            message: 'OTP verified successfully',
            verified: true
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ message: 'Error verifying OTP. Please try again.', error: error.message });
    }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        // Validate input
        if (!email || !newPassword) {
            return res.status(400).json({ message: 'Email and new password are required' });
        }

        // Validate password strength
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        // Verify OTP was verified
        const storedData = otpStore.get(email);
        if (!storedData || !storedData.used) {
            return res.status(400).json({ message: 'Please verify OTP first' });
        }

        // Check if OTP has expired
        if (Date.now() > storedData.expiry) {
            otpStore.delete(email);
            return res.status(400).json({ message: 'OTP has expired' });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update password (will be hashed by pre-save hook)
        user.password = newPassword;
        await user.save();

        // Clear OTP from store
        otpStore.delete(email);

        res.json({
            message: 'Password reset successfully',
            success: true
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Error resetting password. Please try again.', error: error.message });
    }
};