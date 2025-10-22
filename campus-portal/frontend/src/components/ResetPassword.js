import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { verifyResetToken, resetPassword } from '../services/api';

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const tokenParam = searchParams.get('token');
        if (tokenParam) {
            setToken(tokenParam);
            verifyToken(tokenParam);
        } else {
            setError('Invalid reset link');
            setVerifying(false);
        }
    }, [searchParams]);

    const verifyToken = async (tokenValue) => {
        try {
            const response = await verifyResetToken(tokenValue);
            if (response.data.success) {
                setEmail(response.data.email);
            } else {
                setError('Invalid or expired reset token');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired reset token');
        } finally {
            setVerifying(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await resetPassword({
                token: token,
                newPassword: newPassword
            });
            
            if (response.data.success) {
                setMessage(response.data.message);
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setError(response.data.message || 'Failed to reset password');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (verifying) {
        return (
            <div className="reset-password-container">
                <div className="reset-password-card">
                    <div className="loading">Verifying reset token...</div>
                </div>
            </div>
        );
    }

    if (error && !email) {
        return (
            <div className="reset-password-container">
                <div className="reset-password-card">
                    <div className="alert alert-error">{error}</div>
                    <div className="back-to-login">
                        <Link to="/forgot-password">← Request New Reset Link</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="reset-password-container">
            <div className="reset-password-card">
                <div className="reset-password-header">
                    <h1>Set New Password</h1>
                    <p className="university-name">Campus Portal Pro</p>
                </div>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="alert alert-success">
                        {message}
                        <br />
                        <small>Redirecting to login page...</small>
                    </div>
                )}

                {email && (
                    <div className="alert alert-info">
                        Resetting password for: <strong>{email}</strong>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="newPassword">New Password</label>
                        <input
                            type="password"
                            id="newPassword"
                            className="form-control"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength="6"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            className="form-control"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength="6"
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn-primary"
                        disabled={loading || message}
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>

                <div className="back-to-login">
                    <Link to="/login">← Back to Login</Link>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;
