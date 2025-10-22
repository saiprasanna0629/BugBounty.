import express from 'express';
const router = express.Router();
import User from '../models/User.js';
import crypto from 'crypto';

// Registration endpoint for bug bounty participants
router.post('/register-participant', async (req, res) => {
    try {
        const { name, email, college, phone, teamName } = req.body;
        
        // Validate email format
        if (!email.includes('@')) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }
        
        // Check if email already registered
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'This email is already registered for the competition'
            });
        }
        
        // Generate unique student ID and password
        const studentId = `CTF${Date.now()}${Math.floor(Math.random() * 1000)}`;
        const temporaryPassword = crypto.randomBytes(4).toString('hex').toUpperCase(); // e.g., "A3F9B2E1"
        
        // Create participant account
        const participant = new User({
            name: name,
            email: email,
            password: temporaryPassword, // Plain text for demo; hash in production
            role: 'student',
            studentId: studentId,
            department: college,
            phone: phone,
            isActive: true,
            metadata: {
                teamName: teamName || 'Individual',
                registrationDate: new Date(),
                competitionParticipant: true
            }
        });
        
        await participant.save();
        
        return res.status(201).json({
            success: true,
            message: 'Registration successful! Save your credentials.',
            credentials: {
                email: email,
                password: temporaryPassword,
                studentId: studentId,
                loginUrl: 'http://localhost:3000/login'
            }
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again.'
        });
    }
});

// Get registration statistics (admin only)
router.get('/stats', async (req, res) => {
    try {
        const totalParticipants = await User.countDocuments({ 
            'metadata.competitionParticipant': true 
        });
        
        const collegeStats = await User.aggregate([
            { $match: { 'metadata.competitionParticipant': true } },
            { $group: { _id: '$department', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        return res.json({
            success: true,
            totalParticipants,
            collegeStats
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching statistics'
        });
    }
});

export default router;
