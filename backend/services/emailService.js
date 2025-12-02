const nodemailer = require('nodemailer');

// Create transporter with Gmail SMTP settings
const createTransporter = () => {
    // Use SMTP configuration if available, otherwise fallback to service configuration
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    } else {
        // Fallback to service configuration
        return nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }
};

// Verify transporter connectivity with timeout
const verifyTransporter = async (transporter) => {
    try {
        // Set a timeout for verification
        const timeout = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Verification timeout')), 5000);
        });

        const verification = transporter.verify();
        await Promise.race([verification, timeout]);

        console.log('✅ SMTP transporter verified successfully');
        return true;
    } catch (error) {
        console.error('❌ SMTP transporter verification failed:', error.message);
        return false;
    }
};

// Send OTP email for password reset
const sendOTPEmail = async (email, name, otp) => {
    try {
        const transporter = createTransporter();

        // Email content with improved styling
        const mailOptions = {
            from: `"MediConnect" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset OTP - MediConnect',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: #f8f9fa; border-radius: 10px; padding: 30px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <div style="background: #0066FF; color: white; padding: 20px; border-radius: 8px 8px 0 0; margin: -30px -30px 20px -30px;">
                            <h1 style="margin: 0; font-size: 24px;">🏥 MediConnect</h1>
                            <p style="margin: 5px 0 0 0; opacity: 0.9;">Healthcare Platform</p>
                        </div>
                        
                        <h2 style="color: #0066FF; margin-top: 0;">Password Reset Request</h2>
                        
                        <p>Hello <strong>${name || 'User'}</strong>,</p>
                        
                        <p>You requested to reset your password. Please use the following OTP to verify your identity:</p>
                        
                        <div style="background: #ffffff; border: 2px dashed #0066FF; border-radius: 8px; padding: 25px; margin: 25px 0; text-align: center;">
                            <h1 style="color: #0066FF; font-size: 36px; letter-spacing: 8px; margin: 0;">${otp}</h1>
                            <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">One-Time Password</p>
                        </div>
                        
                        <p style="background: #fff8e6; padding: 15px; border-radius: 6px; border-left: 4px solid #ff9800;">
                            <strong>⚠️ Important:</strong> This OTP will expire in <strong>5 minutes</strong>. If you didn't request this, please ignore this email.
                        </p>
                        
                        <p style="margin: 25px 0;">Thank you for using MediConnect!</p>
                        
                        <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; color: #777; font-size: 12px;">
                            <p style="margin: 0;">This is an automated email. Please do not reply.</p>
                            <p style="margin: 5px 0 0 0;">© 2025 MediConnect. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        // Set a timeout for email sending
        const timeout = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Email sending timeout')), 10000);
        });

        const sendMail = transporter.sendMail(mailOptions);
        const info = await Promise.race([sendMail, timeout]);

        console.log('✅ OTP email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending OTP email:', error);
        return { success: false, error: error.message };
    }
};

// Send appointment confirmation email
const sendAppointmentConfirmation = async (patientEmail, patientName, doctorName, appointmentDetails) => {
    try {
        const transporter = createTransporter();

        // Verify transporter before sending (but don't fail if verification fails - try to send anyway)
        const isTransporterValid = await verifyTransporter(transporter);
        if (!isTransporterValid) {
            console.warn('⚠️ Email transporter verification failed, but will attempt to send email anyway');
        }

        const mailOptions = {
            from: `"MediConnect" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
            to: patientEmail,
            subject: 'Appointment Confirmed - MediConnect',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #5c87f2; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
                        .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
                        .detail-label { font-weight: bold; color: #64748b; }
                        .button { background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
                        .footer { text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🏥 MediConnect</h1>
                            <p>Your Appointment is Confirmed!</p>
                        </div>
                        <div class="content">
                            <h2>Hello ${patientName},</h2>
                            <p>Great news! Your appointment with <strong>Dr. ${doctorName}</strong> has been confirmed.</p>
                            
                            <div class="details">
                                <h3>Appointment Details</h3>
                                <div class="detail-row">
                                    <span class="detail-label">Doctor:</span>
                                    <span>Dr. ${doctorName}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Date:</span>
                                    <span>${appointmentDetails.date}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Time:</span>
                                    <span>${appointmentDetails.time}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Status:</span>
                                    <span style="color: #22c55e; font-weight: bold;">✓ Confirmed</span>
                                </div>
                            </div>
                            
                            <p><strong>What to bring:</strong></p>
                            <ul>
                                <li>Valid ID proof</li>
                                <li>Previous medical records (if any)</li>
                                <li>List of current medications</li>
                            </ul>
                            
                            <p>If you need to reschedule or cancel, please contact us at least 24 hours in advance.</p>
                            
                            <center>
                                <a href="http://localhost:5173/appointments" class="button">View My Appointments</a>
                            </center>
                        </div>
                        <div class="footer">
                            <p>© 2025 MediConnect. All rights reserved.</p>
                            <p>This is an automated email. Please do not reply.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        // Set a timeout for email sending
        const timeout = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Email sending timeout')), 10000);
        });

        const sendMail = transporter.sendMail(mailOptions);
        const info = await Promise.race([sendMail, timeout]);

        console.log('✅ Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending email:', error);
        return { success: false, error: error.message };
    }
};

// Send new appointment notification email to doctor
const sendDoctorNotificationEmail = async (doctorEmail, doctorName, patientName, appointmentDetails) => {
    try {
        const transporter = createTransporter();

        // Verify transporter before sending (but don't fail if verification fails - try to send anyway)
        const isTransporterValid = await verifyTransporter(transporter);
        if (!isTransporterValid) {
            console.warn('⚠️ Email transporter verification failed for doctor notification, but will attempt to send email anyway');
        }

        const mailOptions = {
            from: `"MediConnect" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
            to: doctorEmail,
            subject: 'New Appointment Request - MediConnect',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #5c87f2; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
                        .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                        .button { background: #5c87f2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🏥 MediConnect</h1>
                            <p>New Appointment Request</p>
                        </div>
                        <div class="content">
                            <h2>Hello Dr. ${doctorName},</h2>
                            <p>You have a new appointment request from <strong>${patientName}</strong>.</p>
                            
                            <div class="details">
                                <h3>Appointment Details</h3>
                                <p><strong>Patient:</strong> ${patientName}</p>
                                <p><strong>Date:</strong> ${appointmentDetails.date}</p>
                                <p><strong>Time:</strong> ${appointmentDetails.time}</p>
                            </div>
                            
                            <p>Please review and accept/reject this appointment in your dashboard.</p>
                            
                            <center>
                                <a href="http://localhost:5173/doctor-dashboard" class="button">View Dashboard</a>
                            </center>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        // Set a timeout for email sending
        const timeout = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Email sending timeout')), 10000);
        });

        const sendMail = transporter.sendMail(mailOptions);
        await Promise.race([sendMail, timeout]);

        console.log('✅ Doctor notification email sent');
    } catch (error) {
        console.error('❌ Error sending doctor notification:', error);
    }
};

// Send appointment rejection email
const sendAppointmentRejection = async (patientEmail, patientName, doctorName, appointmentDetails) => {
    try {
        const transporter = createTransporter();

        // Verify transporter before sending
        const isTransporterValid = await verifyTransporter(transporter);
        if (!isTransporterValid) {
            console.warn('⚠️ Email transporter verification failed, but will attempt to send email anyway');
        }

        const mailOptions = {
            from: `"MediConnect" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
            to: patientEmail,
            subject: 'Appointment Update - MediConnect',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
                        .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
                        .detail-label { font-weight: bold; color: #64748b; }
                        .button { background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
                        .footer { text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🏥 MediConnect</h1>
                            <p>Appointment Update</p>
                        </div>
                        <div class="content">
                            <h2>Hello ${patientName},</h2>
                            <p>We regret to inform you that your appointment with <strong>Dr. ${doctorName}</strong> has been declined.</p>
                            
                            <div class="details">
                                <h3>Appointment Details</h3>
                                <div class="detail-row">
                                    <span class="detail-label">Doctor:</span>
                                    <span>Dr. ${doctorName}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Date:</span>
                                    <span>${appointmentDetails.date}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Time:</span>
                                    <span>${appointmentDetails.time}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Status:</span>
                                    <span style="color: #ef4444; font-weight: bold;">✕ Declined</span>
                                </div>
                            </div>
                            
                            <p>This may be due to a scheduling conflict or unavailability. We apologize for the inconvenience.</p>
                            <p>Please visit our portal to book another slot or find another doctor.</p>
                            
                            <center>
                                <a href="http://localhost:5173/find-doctors" class="button">Find Another Doctor</a>
                            </center>
                        </div>
                        <div class="footer">
                            <p>© 2025 MediConnect. All rights reserved.</p>
                            <p>This is an automated email. Please do not reply.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const timeout = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Email sending timeout')), 10000);
        });

        const sendMail = transporter.sendMail(mailOptions);
        const info = await Promise.race([sendMail, timeout]);

        console.log('✅ Rejection email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending rejection email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendOTPEmail,
    sendAppointmentConfirmation,
    sendAppointmentRejection,
    sendDoctorNotificationEmail,
    createTransporter,
    verifyTransporter
};