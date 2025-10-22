import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Attendance from '../models/Attendance.js';
import Grade from '../models/Grade.js';

dotenv.config();

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        
        // Clear existing data
        await User.deleteMany({});
        await Course.deleteMany({});
        await Attendance.deleteMany({});
        await Grade.deleteMany({});
        console.log('🗑️  Cleared existing data');
        
        // Create Admin User
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@oakridge.edu',
            password: 'Admin@2024',
            role: 'admin',
            department: 'Administration',
            phone: '+1-555-0100',
            isActive: true
        });
        
        // Create Faculty Users
        const faculty1 = await User.create({
            name: 'Dr. Sarah Johnson',
            email: 'prof.johnson@oakridge.edu',
            password: 'Faculty123',
            role: 'faculty',
            department: 'Computer Science',
            phone: '+1-555-0101',
            isActive: true
        });
        
        const faculty2 = await User.create({
            name: 'Prof. Michael Chen',
            email: 'prof.chen@oakridge.edu',
            password: 'Faculty123',
            role: 'faculty',
            department: 'Mathematics',
            phone: '+1-555-0102',
            isActive: true
        });
        
        // Create Student Users
        const students = await User.insertMany([
            {
                name: 'John Smith',
                email: 'john.student@oakridge.edu',
                password: 'Student@123',
                role: 'student',
                studentId: 'STU2024001',
                department: 'Computer Science',
                phone: '+1-555-1001',
                semester: 3,
                enrollmentYear: 2023,
                isActive: true
            },
            {
                name: 'Emma Wilson',
                email: 'emma.wilson@oakridge.edu',
                password: 'Student@123',
                role: 'student',
                studentId: 'STU2024002',
                department: 'Computer Science',
                phone: '+1-555-1002',
                semester: 3,
                enrollmentYear: 2023,
                isActive: true
            },
            {
                name: 'Michael Brown',
                email: 'michael.brown@oakridge.edu',
                password: 'Student@123',
                role: 'student',
                studentId: 'STU2024003',
                department: 'Mathematics',
                phone: '+1-555-1003',
                semester: 2,
                enrollmentYear: 2024,
                isActive: true
            },
            {
                name: 'Sophia Davis',
                email: 'sophia.davis@oakridge.edu',
                password: 'Student@123',
                role: 'student',
                studentId: 'STU2024004',
                department: 'Computer Science',
                phone: '+1-555-1004',
                semester: 1,
                enrollmentYear: 2024,
                isActive: true
            },
            {
                name: 'James Martinez',
                email: 'james.martinez@oakridge.edu',
                password: 'Student@123',
                role: 'student',
                studentId: 'STU2024005',
                department: 'Computer Science',
                phone: '+1-555-1005',
                semester: 3,
                enrollmentYear: 2023,
                isActive: true
            }
        ]);
        
        console.log('👥 Created users');
        
        // Create Courses
        const courses = await Course.insertMany([
            {
                courseCode: 'CS301',
                courseName: 'Data Structures and Algorithms',
                department: 'Computer Science',
                credits: 4,
                semester: 3,
                faculty: faculty1._id,
                description: 'Advanced data structures and algorithm design',
                schedule: 'Mon, Wed, Fri 10:00 AM - 11:00 AM'
            },
            {
                courseCode: 'CS302',
                courseName: 'Database Management Systems',
                department: 'Computer Science',
                credits: 3,
                semester: 3,
                faculty: faculty1._id,
                description: 'Relational and NoSQL database systems',
                schedule: 'Tue, Thu 2:00 PM - 3:30 PM'
            },
            {
                courseCode: 'MATH201',
                courseName: 'Linear Algebra',
                department: 'Mathematics',
                credits: 3,
                semester: 2,
                faculty: faculty2._id,
                description: 'Vector spaces and linear transformations',
                schedule: 'Mon, Wed 1:00 PM - 2:30 PM'
            },
            {
                courseCode: 'CS101',
                courseName: 'Introduction to Programming',
                department: 'Computer Science',
                credits: 4,
                semester: 1,
                faculty: faculty1._id,
                description: 'Fundamentals of programming using Python',
                schedule: 'Tue, Thu 10:00 AM - 12:00 PM'
            }
        ]);
        
        console.log('📚 Created courses');
        
        // Create Attendance Records
        const attendanceRecords = [];
        const dates = [];
        
        // Generate dates for last 30 days
        for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dates.push(date);
        }
        
        // Create attendance for each student and course
        for (const student of students) {
            for (const course of courses.slice(0, 2)) { // First 2 courses
                for (const date of dates.slice(0, 20)) { // 20 days
                    const statuses = ['present', 'present', 'present', 'absent', 'late'];
                    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
                    
                    attendanceRecords.push({
                        student: student._id,
                        course: course._id,
                        date: date,
                        status: randomStatus,
                        markedBy: faculty1._id
                    });
                }
            }
        }
        
        await Attendance.insertMany(attendanceRecords);
        console.log('📋 Created attendance records');
        
        // Create Grade Records
        const gradeRecords = [];
        const examTypes = ['midterm', 'assignment', 'quiz', 'final'];
        const grades = ['A+', 'A', 'B+', 'B', 'C+', 'C'];
        
        for (const student of students) {
            for (const course of courses.slice(0, 2)) {
                for (const examType of examTypes) {
                    const totalMarks = examType === 'quiz' ? 10 : examType === 'assignment' ? 25 : 100;
                    const marks = Math.floor(Math.random() * (totalMarks - totalMarks * 0.5) + totalMarks * 0.6);
                    const gradeIndex = Math.floor((marks / totalMarks) * grades.length);
                    
                    gradeRecords.push({
                        student: student._id,
                        course: course._id,
                        examType: examType,
                        marks: marks,
                        totalMarks: totalMarks,
                        grade: grades[gradeIndex < grades.length ? gradeIndex : grades.length - 1],
                        examDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
                        remarks: marks > totalMarks * 0.8 ? 'Excellent work!' : 'Good effort'
                    });
                }
            }
        }
        
        await Grade.insertMany(gradeRecords);
        console.log('📊 Created grade records');
        
        console.log('\n✨ Database seeded successfully!');
        console.log('\n📝 Test Accounts:');
        console.log('─────────────────────────────────────');
        console.log('Admin:');
        console.log('  Email: admin@oakridge.edu');
        console.log('  Password: Admin@2024');
        console.log('\nFaculty:');
        console.log('  Email: prof.johnson@oakridge.edu');
        console.log('  Password: Faculty123');
        console.log('\nStudent:');
        console.log('  Email: john.student@oakridge.edu');
        console.log('  Password: Student@123');
        console.log('─────────────────────────────────────\n');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
