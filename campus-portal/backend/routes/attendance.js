import express from 'express';
const router = express.Router();
import Attendance from '../models/Attendance.js';
import Course from '../models/Course.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

// Get attendance for logged-in student
router.get('/my-attendance', authenticateToken, async (req, res) => {
    try {
        const attendance = await Attendance.find({ student: req.user.id })
            .populate('course', 'courseCode courseName')
            .populate('markedBy', 'name')
            .sort({ date: -1 });
        
        // Calculate attendance percentage
        const totalClasses = attendance.length;
        const presentClasses = attendance.filter(a => a.status === 'present').length;
        const percentage = totalClasses > 0 ? ((presentClasses / totalClasses) * 100).toFixed(2) : 0;
        
        return res.json({
            success: true,
            attendance: attendance,
            stats: {
                totalClasses,
                presentClasses,
                absentClasses: totalClasses - presentClasses,
                percentage
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching attendance'
        });
    }
});

// Get attendance by course
router.get('/course/:courseId', authenticateToken, async (req, res) => {
    try {
        let query = { course: req.params.courseId };
        
        // Students can only see their own attendance
        if (req.user.role === 'student') {
            query.student = req.user.id;
        }
        
        const attendance = await Attendance.find(query)
            .populate('student', 'name studentId')
            .populate('course', 'courseCode courseName')
            .sort({ date: -1 });
        
        return res.json({
            success: true,
            count: attendance.length,
            attendance: attendance
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching attendance'
        });
    }
});

// Mark attendance (faculty only)
router.post('/mark', authenticateToken, authorizeRoles('faculty', 'admin'), async (req, res) => {
    try {
        const { studentId, courseId, date, status } = req.body;
        
        const attendance = new Attendance({
            student: studentId,
            course: courseId,
            date: date || new Date(),
            status: status,
            markedBy: req.user.id
        });
        
        await attendance.save();
        
        return res.status(201).json({
            success: true,
            message: 'Attendance marked successfully',
            attendance: attendance
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error marking attendance'
        });
    }
});

export default router;
