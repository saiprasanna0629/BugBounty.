import express from 'express';
const router = express.Router();
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../middleware/auth.js';

// ⚠️ VULNERABLE LOGIN ENDPOINT - NoSQL Injection
// This endpoint is intentionally vulnerable for bug bounty challenge
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('Login attempt:', { email, password });
        
        // VULNERABILITY: Direct injection of user input into MongoDB query
        // Accepts objects like {"$ne": ""} which bypass authentication
        const user = await User.findOne({
            email: email,
            password: password,
            isActive: true
        });
        
        if (user) {
            const token = jwt.sign(
                { 
                    id: user._id, 
                    role: user.role,
                    email: user.email
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
            
            return res.json({
                success: true,
                message: 'Login successful',
                token: token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    studentId: user.studentId,
                    department: user.department
                }
            });
        } else {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// Register endpoint (for testing purposes)
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, studentId, department } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }
        
        const user = new User({
            name,
            email,
            password, // In real app, should hash password
            role: role || 'student',
            studentId,
            department
        });
        
        await user.save();
        
        return res.status(201).json({
            success: true,
            message: 'User registered successfully'
        });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        return res.json({
            success: true,
            user: req.user
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching profile'
        });
    }
});

// Logout endpoint
router.post('/logout', authenticateToken, (req, res) => {
    return res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

export default router;
