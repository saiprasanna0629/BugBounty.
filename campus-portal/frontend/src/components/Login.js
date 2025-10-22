import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { loginUser } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await login({ email, password });
            
            if (response.data.success) {
                loginUser(response.data.user, response.data.token);
                navigate('/dashboard');
            } else {
                setError(response.data.message || 'Login failed');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>🎓 Campus Portal Pro</h1>
                    <p className="university-name">Oakridge University</p>
                </div>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            className="form-control"
                            placeholder="student@oakridge.edu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="form-control"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="forgot-password-link">
                    <Link to="/forgot-password">Forgot Password?</Link>
                </div>
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    New participant? <Link to="/register">Register for Competition</Link>
                </div>

                <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px', fontSize: '0.85rem' }}>
                    <strong>Test Accounts:</strong>
                    <div style={{ marginTop: '0.5rem' }}>
                        <strong>Student:</strong> john.student@oakridge.edu / Student@123<br />
                        <strong>Faculty:</strong> prof.johnson@oakridge.edu / Faculty123<br />
                        <strong>Admin:</strong> admin@oakridge.edu / Admin@2024
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
