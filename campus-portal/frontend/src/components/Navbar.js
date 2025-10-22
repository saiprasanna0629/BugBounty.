import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const { user, logoutUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logoutUser();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                🎓 Campus Portal Pro
            </div>
            <div className="navbar-menu">
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/attendance">Attendance</Link>
                <Link to="/grades">Grades</Link>
            </div>
            <div className="navbar-user">
                <div className="user-info">
                    <div className="user-name">{user?.name}</div>
                    <div className="user-role">{user?.role?.toUpperCase()}</div>
                </div>
                <button className="btn-logout" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </nav>
    );
}

export default Navbar;
