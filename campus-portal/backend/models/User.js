import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'faculty', 'admin', 'parent'],
        default: 'student'
    },
    studentId: {
        type: String,
        sparse: true
    },
    department: {
        type: String
    },
    phone: {
        type: String
    },
    dateOfBirth: {
        type: Date
    },
    address: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    resetToken: {
        type: String
    },
    resetTokenExpiry: {
        type: Date
    },
    enrollmentYear: {
        type: Number
    },
    semester: {
        type: Number
    },
    profileImage: {
        type: String,
        default: 'default-avatar.png'
    },
    // Add this field to UserSchema
    metadata: {
        type: Object,
        default: {}
    }

}, {
    timestamps: true
});

export default mongoose.model('User', UserSchema);
