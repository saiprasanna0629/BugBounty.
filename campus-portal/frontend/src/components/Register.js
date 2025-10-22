import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        college: '',
        phone: '',
        teamName: ''
    });
    const [credentials, setCredentials] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post(
                'http://localhost:5000/api/registration/register-participant',
                formData
            );
            
            if (response.data.success) {
                setCredentials(response.data.credentials);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    if (credentials) {
        return (
            <div className="register-container">
                <div className="register-card">
                    <div className="success-icon">✅</div>
                    <h2>Registration Successful!</h2>
                    
                    <div className="credentials-box">
                        <h3>⚠️ SAVE THESE CREDENTIALS</h3>
                        <p><strong>Email:</strong> {credentials.email}</p>
                        <p><strong>Password:</strong> <code>{credentials.password}</code></p>
                        <p><strong>Student ID:</strong> {credentials.studentId}</p>
                    </div>
                    
                    <div className="alert alert-warning">
                        <strong>Important:</strong> Screenshot or write down these credentials now. 
                        You won't be able to see the password again!
                    </div>
                    
                    <Link to="/login" className="btn-primary">
                        Proceed to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="register-container">
            <div className="register-card">
                <h1>🎯 Bug Bounty Challenge</h1>
                <p className="subtitle">Register for Campus Portal Pro Competition</p>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name *</label>
                        <input
                            type="text"
                            name="name"
                            className="form-control"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Email Address *</label>
                        <input
                            type="email"
                            name="email"
                            className="form-control"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>College/University Name *</label>
                        <input
                            type="text"
                            name="college"
                            className="form-control"
                            value={formData.college}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Phone Number *</label>
                        <input
                            type="tel"
                            name="phone"
                            className="form-control"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Team Name (Optional)</label>
                        <input
                            type="text"
                            name="teamName"
                            className="form-control"
                            placeholder="Leave blank for individual participation"
                            value={formData.teamName}
                            onChange={handleChange}
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Registering...' : 'Register for Competition'}
                    </button>
                </form>

                <div className="back-to-login">
                    Already registered? <Link to="/login">Login here</Link>
                </div>
            </div>
        </div>
    );
}

export default Register;
