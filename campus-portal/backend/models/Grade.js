import mongoose from 'mongoose';

const GradeSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    examType: {
        type: String,
        enum: ['midterm', 'final', 'assignment', 'quiz', 'project'],
        required: true
    },
    marks: {
        type: Number,
        required: true
    },
    totalMarks: {
        type: Number,
        required: true
    },
    grade: {
        type: String,
        enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F']
    },
    remarks: {
        type: String
    },
    examDate: {
        type: Date
    }
}, {
    timestamps: true
});

export default mongoose.model('Grade', GradeSchema);
