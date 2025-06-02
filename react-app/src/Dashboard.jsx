import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from './api.js';
import './LoginStyle.css';

function Dashboard() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const response = await authAPI.getStatus();
            if (response.success) {
                // Store user data including role
                const userData = {
                    userId: response.userId,
                    email: response.email,
                    role: response.role
                };
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
            } else {
                navigate('/login');
            }
        } catch (error) {
            navigate('/login');
        } finally {
            setLoading(false);
        }
    };    const handleLogout = async () => {
        try {
            await authAPI.logout();
            localStorage.removeItem('user'); // Clear stored user data
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            // Even if logout fails, clear storage and redirect to login
            localStorage.removeItem('user');
            navigate('/login');
        }
    };

    if (loading) {
        return (
            <div className="container">
                <div className="login-container">
                    <p className="login-text" style={{ textAlign: 'center' }}>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="login-container">
                <div style={{ textAlign: 'center' }}>
                    <h1 className="login-text" style={{ fontSize: '2.5em', marginBottom: '1em' }}>
                        Welcome to Popdle!
                    </h1>
                      <div style={{ marginBottom: '2em' }}>
                        <p className="login-text" style={{ fontSize: '1.2em', marginBottom: '0.5em' }}>
                            🎉 You are successfully logged in!
                        </p>
                        {user && (
                            <>
                                <p className="login-text" style={{ fontSize: '1em', color: '#666' }}>
                                    Email: {user.email}
                                </p>
                                <p className="login-text" style={{ fontSize: '1em', color: '#666' }}>
                                    Role: <span style={{ 
                                        fontWeight: 'bold',
                                        color: user.role === 'ADMIN' ? '#e74c3c' : '#27ae60',
                                        backgroundColor: user.role === 'ADMIN' ? '#ffeaa7' : '#dff0d8',
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        fontSize: '0.9em'
                                    }}>
                                        {user.role}
                                    </span>
                                </p>
                            </>
                        )}
                    </div>                    <div style={{ marginBottom: '2em' }}>
                        <p className="login-text" style={{ marginBottom: '1em' }}>
                            🎯 Ready to play some pop culture trivia?
                        </p>
                        <Link to="/daily-quiz">
                            <button className="login-button" style={{ margin: '0.5em', fontSize: '1.2em' }}>
                                🎮 Play Today's Question
                            </button>
                        </Link>
                    </div><div style={{ marginBottom: '2em' }}>
                        <h3 className="login-text" style={{ fontSize: '1.3em', marginBottom: '1em' }}>
                            👥 User Management
                        </h3>
                        <div style={{ display: 'flex', gap: '1em', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link to="/users">
                                <button className="login-button" style={{ margin: '0.5em' }}>
                                    View All Users
                                </button>
                            </Link>
                            {user?.role === 'ADMIN' && (
                                <p className="login-text" style={{ 
                                    fontSize: '0.9em', 
                                    color: '#e74c3c',
                                    marginTop: '0.5em',
                                    fontStyle: 'italic'
                                }}>
                                    ⚡ As an admin, you can delete users
                                </p>
                            )}
                        </div>
                    </div>

                    <button 
                        className="register-button" 
                        onClick={handleLogout}
                        style={{ marginTop: '1em' }}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
