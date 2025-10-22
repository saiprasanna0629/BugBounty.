import express from 'express';
const router = express.Router();
import User from '../models/User.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

// Get all students (faculty and admin only)
router.get('/', authenticateToken, authorizeRoles('faculty', 'admin'), async (req, res) => {
    try {
        const students = await User.find({ role: 'student', isActive: true })
            .select('-password -resetToken -resetTokenExpiry')
            .sort({ name: 1 });
        
        return res.json({
            success: true,
            count: students.length,
            students: students
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching students'
        });
    }
});

// Get student by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const student = await User.findById(req.params.id)
            .select('-password -resetToken -resetTokenExpiry');
        
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }
        
        // Students can only view their own profile, unless faculty/admin
        if (req.user.role === 'student' && req.user.id !== student.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }
        
        return res.json({
            success: true,
            student: student
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching student'
        });
    }
});

export default router;
