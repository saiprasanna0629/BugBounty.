import React, { useEffect, useState } from 'react';
import { getMyGrades } from '../services/api';

function Grades() {
    const [grades, setGrades] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchGrades();
    }, []);

    const fetchGrades = async () => {
        try {
            const response = await getMyGrades();
            
            if (response.data.success) {
                setGrades(response.data.grades);
                setStats(response.data.stats);
            } else {
                setError('Failed to fetch grades');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error fetching grades');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    if (loading) {
        return <div className="loading">Loading grades...</div>;
    }

    return (
        <div className="grades-container">
            <div className="content-header">
                <h1>📊 My Grades</h1>
                <p>View your academic performance and exam results</p>
            </div>

            {error && (
                <div className="error-message">{error}</div>
            )}

            {stats && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-value">{stats.totalExams}</div>
                        <div className="stat-label">Total Exams</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.totalMarks}</div>
                        <div className="stat-label">Total Marks</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.totalPossible}</div>
                        <div className="stat-label">Total Possible</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.percentage}%</div>
                        <div className="stat-label">Overall Percentage</div>
                    </div>
                </div>
            )}

            <div className="data-table">
                <h2>Grade Records</h2>
                {grades.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Course</th>
                                <th>Exam Type</th>
                                <th>Marks</th>
                                <th>Grade</th>
                                <th>Exam Date</th>
                                <th>Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {grades.map((grade) => (
                                <tr key={grade._id}>
                                    <td>
                                        <strong>{grade.course?.courseCode}</strong>
                                        <br />
                                        <small>{grade.course?.courseName}</small>
                                    </td>
                                    <td style={{textTransform: 'capitalize'}}>{grade.examType}</td>
                                    <td>
                                        <strong>{grade.marks}</strong> / {grade.totalMarks}
                                        <br />
                                        <small>({((grade.marks / grade.totalMarks) * 100).toFixed(1)}%)</small>
                                    </td>
                                    <td>
                                        <strong style={{fontSize: '1.2rem', color: '#2c3e50'}}>
                                            {grade.grade}
                                        </strong>
                                    </td>
                                    <td>{formatDate(grade.examDate)}</td>
                                    <td><small>{grade.remarks || '-'}</small></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p style={{textAlign: 'center', color: '#7f8c8d', padding: '2rem'}}>
                        No grade records found
                    </p>
                )}
            </div>
        </div>
    );
}

export default Grades;
