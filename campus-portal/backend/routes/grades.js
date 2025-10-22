import express from 'express';
const router = express.Router();
import Grade from '../models/Grade.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

// Get grades for logged-in student
router.get('/my-grades', authenticateToken, async (req, res) => {
    try {
        const grades = await Grade.find({ student: req.user.id })
            .populate('course', 'courseCode courseName credits')
            .sort({ examDate: -1 });
        
        // Calculate overall statistics
        const totalMarks = grades.reduce((sum, g) => sum + g.marks, 0);
        const totalPossible = grades.reduce((sum, g) => sum + g.totalMarks, 0);
        const percentage = totalPossible > 0 ? ((totalMarks / totalPossible) * 100).toFixed(2) : 0;
        
        return res.json({
            success: true,
            grades: grades,
            stats: {
                totalExams: grades.length,
                totalMarks,
                totalPossible,
                percentage
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching grades'
        });
    }
});

// Get grades by course
router.get('/course/:courseId', authenticateToken, async (req, res) => {
    try {
        let query = { course: req.params.courseId };
        
        // Students can only see their own grades
        if (req.user.role === 'student') {
            query.student = req.user.id;
        }
        
        const grades = await Grade.find(query)
            .populate('student', 'name studentId')
            .populate('course', 'courseCode courseName')
            .sort({ examDate: -1 });
        
        return res.json({
            success: true,
            count: grades.length,
            grades: grades
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching grades'
        });
    }
});

// Add grade (faculty only)
router.post('/add', authenticateToken, authorizeRoles('faculty', 'admin'), async (req, res) => {
    try {
        const { studentId, courseId, examType, marks, totalMarks, grade, remarks, examDate } = req.body;
        
        const gradeEntry = new Grade({
            student: studentId,
            course: courseId,
            examType,
            marks,
            totalMarks,
            grade,
            remarks,
            examDate: examDate || new Date()
        });
        
        await gradeEntry.save();
        
        return res.status(201).json({
            success: true,
            message: 'Grade added successfully',
            grade: gradeEntry
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error adding grade'
        });
    }
});

export default router;
