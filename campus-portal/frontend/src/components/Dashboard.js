import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyAttendance, getMyGrades } from '../services/api';

function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        attendancePercentage: 0,
        totalClasses: 0,
        averageGrade: 0,
        totalExams: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [attendanceRes, gradesRes] = await Promise.all([
                getMyAttendance(),
                getMyGrades()
            ]);

            if (attendanceRes.data.success) {
                setStats(prev => ({
                    ...prev,
                    attendancePercentage: attendanceRes.data.stats.percentage,
                    totalClasses: attendanceRes.data.stats.totalClasses
                }));
            }

            if (gradesRes.data.success) {
                setStats(prev => ({
                    ...prev,
                    averageGrade: gradesRes.data.stats.percentage,
                    totalExams: gradesRes.data.stats.totalExams
                }));
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading dashboard...</div>;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Welcome back, {user?.name}! 👋</h1>
                <p>Student ID: {user?.studentId} | Department: {user?.department}</p>
            </div>

            <div className="dashboard-stats">
                <div className="stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-value">{stats.attendancePercentage}%</div>
                    <div className="stat-label">Attendance Rate</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">📚</div>
                    <div className="stat-value">{stats.totalClasses}</div>
                    <div className="stat-label">Total Classes</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-value">{stats.averageGrade}%</div>
                    <div className="stat-label">Average Grade</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">📝</div>
                    <div className="stat-value">{stats.totalExams}</div>
                    <div className="stat-label">Total Exams</div>
                </div>
            </div>

            <div className="quick-links">
                <h2>Quick Links</h2>
                <div className="links-grid">
                    <Link to="/attendance" className="link-card">
                        <div className="link-card-icon">📋</div>
                        <div>View Attendance</div>
                    </Link>
                    <Link to="/grades" className="link-card">
                        <div className="link-card-icon">📊</div>
                        <div>View Grades</div>
                    </Link>
                    <div className="link-card" style={{opacity: 0.6, cursor: 'not-allowed'}}>
                        <div className="link-card-icon">📖</div>
                        <div>Assignments</div>
                        <small>(Coming Soon)</small>
                    </div>
                    <div className="link-card" style={{opacity: 0.6, cursor: 'not-allowed'}}>
                        <div className="link-card-icon">📅</div>
                        <div>Schedule</div>
                        <small>(Coming Soon)</small>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
