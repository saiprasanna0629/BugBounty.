import express from 'express';
const router = express.Router();
import User from '../models/User.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// ⚠️ VULNERABLE PASSWORD RESET - Host Header Injection
// This endpoint is intentionally vulnerable for bug bounty challenge

// Step 1: Request password reset
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        console.log('Password reset requested for:', email);
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }
        
        const user = await User.findOne({ email: email });
        
        if (!user) {
            // Prevent user enumeration - always return success
            return res.json({
                success: true,
                message: 'If the email exists, a password reset link has been sent.'
            });
        }
        
        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetToken = resetToken;
        user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
        await user.save();
        
        // VULNERABILITY: Uses Host header from request to build reset URL
        // Attacker can manipulate this to point to their own domain
        const host = req.headers.host || req.get('host');
        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
        const resetUrl = `${protocol}://${host}/reset-password?token=${resetToken}`;
        
        console.log('Reset URL generated:', resetUrl);
        console.log('Host header:', req.headers.host);
        console.log('X-Forwarded-Proto:', req.headers['x-forwarded-proto']);
        
        // Configure email transporter
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        
        // Email content
        const mailOptions = {
            from: 'Campus Portal Pro <noreply@campusportalpro.edu>',
            to: user.email,
            subject: 'Password Reset Request - Campus Portal Pro',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; }
                        .content { background-color: #f4f4f4; padding: 30px; }
                        .button { display: inline-block; background-color: #3498db; color: white; 
                                 padding: 12px 30px; text-decoration: none; border-radius: 5px; 
                                 margin: 20px 0; }
                        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #777; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎓 Campus Portal Pro</h1>
                        </div>
                        <div class="content">
                            <h2>Password Reset Request</h2>
                            <p>Hello <strong>${user.name}</strong>,</p>
                            <p>We received a request to reset your password for your Campus Portal Pro account.</p>
                            <p>Click the button below to reset your password:</p>
                            <p style="text-align: center;">
                                <a href="${resetUrl}" class="button">Reset Password</a>
                            </p>
                            <p>Or copy and paste this link into your browser:</p>
                            <p style="word-break: break-all; background-color: #fff; padding: 10px; border: 1px solid #ddd;">
                                ${resetUrl}
                            </p>
                            <p><strong>This link will expire in 1 hour.</strong></p>
                            <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
                            <hr>
                            <p><strong>Security Tips:</strong></p>
                            <ul>
                                <li>Never share your password with anyone</li>
                                <li>Use a strong, unique password</li>
                                <li>Enable two-factor authentication if available</li>
                            </ul>
                        </div>
                        <div class="footer">
                            <p>© 2025 Campus Portal Pro - Oakridge University</p>
                            <p>This is an automated message, please do not reply.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };
        
        // Send email
        try {
            await transporter.sendMail(mailOptions);
            console.log('Reset email sent successfully to:', user.email);
        } catch (emailError) {
            console.error('Email sending error:', emailError);
            // In production, might want to handle this differently
            // For bug bounty challenge, we'll log but still return success
        }
        
        return res.json({
            success: true,
            message: 'If the email exists, a password reset link has been sent.',
            // Debug info (remove in production)
            debug: {
                tokenGenerated: true,
                emailAttempted: true,
                resetUrl: resetUrl // Exposed for bug bounty testing
            }
        });
        
    } catch (error) {
        console.error('Password reset error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error processing password reset'
        });
    }
});

// Step 2: Verify reset token
router.get('/verify-reset-token/:token', async (req, res) => {
    try {
        const { token } = req.params;
        
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }
        
        return res.json({
            success: true,
            message: 'Token is valid',
            email: user.email // Show email for user confirmation
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error verifying token'
        });
    }
});

// Step 3: Reset password with token
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        
        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Token and new password are required'
            });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }
        
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }
        
        // Update password (in real app, should hash it)
        user.password = newPassword;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();
        
        console.log('Password reset successful for:', user.email);
        
        return res.json({
            success: true,
            message: 'Password reset successful. You can now login with your new password.'
        });
        
    } catch (error) {
        console.error('Reset password error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error resetting password'
        });
    }
});

export default router;
