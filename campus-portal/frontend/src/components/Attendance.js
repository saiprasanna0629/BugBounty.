import React, { useEffect, useState } from 'react';
import { getMyAttendance } from '../services/api';

function Attendance() {
    const [attendance, setAttendance] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            const response = await getMyAttendance();
            
            if (response.data.success) {
                setAttendance(response.data.attendance);
                setStats(response.data.stats);
            } else {
                setError('Failed to fetch attendance');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error fetching attendance');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    if (loading) {
        return <div className="loading">Loading attendance...</div>;
    }

    return (
        <div className="attendance-container">
            <div className="content-header">
                <h1>📋 My Attendance</h1>
                <p>Track your class attendance and participation</p>
            </div>

            {error && (
                <div className="error-message">{error}</div>
            )}

            {stats && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-value">{stats.totalClasses}</div>
                        <div className="stat-label">Total Classes</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value" style={{color: '#27ae60'}}>{stats.presentClasses}</div>
                        <div className="stat-label">Present</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value" style={{color: '#e74c3c'}}>{stats.absentClasses}</div>
                        <div className="stat-label">Absent</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.percentage}%</div>
                        <div className="stat-label">Attendance Rate</div>
                    </div>
                </div>
            )}

            <div className="data-table">
                <h2>Attendance Records</h2>
                {attendance.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Course</th>
                                <th>Status</th>
                                <th>Marked By</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendance.map((record) => (
                                <tr key={record._id}>
                                    <td>{formatDate(record.date)}</td>
                                    <td>
                                        <strong>{record.course?.courseCode}</strong>
                                        <br />
                                        <small>{record.course?.courseName}</small>
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${record.status}`}>
                                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                        </span>
                                    </td>
                                    <td>{record.markedBy?.name || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p style={{textAlign: 'center', color: '#7f8c8d', padding: '2rem'}}>
                        No attendance records found
                    </p>
                )}
            </div>
        </div>
    );
}

export default Attendance;
