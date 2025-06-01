import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
                setUser(response);
            } else {
                navigate('/login');
            }
        } catch (error) {
            navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await authAPI.logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            // Even if logout fails, redirect to login
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
                            <p className="login-text" style={{ fontSize: '1em', color: '#666' }}>
                                User ID: {user.userId || 'N/A'}
                            </p>
                        )}
                    </div>

                    <div style={{ marginBottom: '2em' }}>
                        <p className="login-text" style={{ marginBottom: '1em' }}>
                            🎯 Ready to play some pop culture trivia?
                        </p>
                        <p className="login-text" style={{ fontSize: '0.9em', color: '#666' }}>
                            This is where your game dashboard will be implemented.
                        </p>
                    </div>

                    <button 
                        className="login-button" 
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
