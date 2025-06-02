import {useEffect, useState} from "react";
import {Link, useNavigate} from 'react-router-dom';
import { userAPI, authAPI } from './api';
import './LoginStyle.css';
import './UserStyle.css';

const UsersList = () => {
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        checkAuthAndFetchUsers();
    }, []);    const checkAuthAndFetchUsers = async () => {
        try {
            // Check if user is authenticated
            const authStatus = await authAPI.getStatus();
            if (!authStatus.success) {
                navigate('/login');
                return;
            }

            // Set current user info for role checking
            const userData = {
                userId: authStatus.userId,
                email: authStatus.email,
                role: authStatus.role
            };
            setCurrentUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));

            // Fetch users
            const usersData = await userAPI.getAllUsers();
            setUsers(usersData);
        } catch (error) {
            setError(error.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };    const handleDeleteUser = async (userId) => {
        // Check if current user is admin
        if (currentUser?.role !== 'ADMIN') {
            setError('Only administrators can delete users');
            return;
        }

        if (!window.confirm('Are you sure you want to delete this user?')) {
            return;
        }

        try {
            await userAPI.deleteUser(userId);
            // Refresh the users list after deletion
            setUsers(users.filter(user => user.id !== userId));
            setError(''); // Clear any previous errors
        } catch (error) {
            setError(error.message || 'Failed to delete user');
        }
    };    const handleLogout = async () => {
        try {
            await authAPI.logout();
            localStorage.removeItem('user'); // Clear stored user data
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            localStorage.removeItem('user'); // Clear storage anyway
            navigate('/login'); // Navigate anyway
        }
    };if (loading) {
        return (
            <div className="container">
                <div className="login-container">
                    <div className="login-text user-loading">
                        Loading users...
                    </div>
                </div>
            </div>
        );
    }

    return (        <div className="container">
            <div className="login-container">                <div className="user-header">
                    <h2 className="login-text user-title">
                        Users List
                        {currentUser?.role === 'ADMIN' && (
                            <span style={{ 
                                fontSize: '0.6em', 
                                color: '#e74c3c',
                                marginLeft: '10px',
                                backgroundColor: '#ffeaa7',
                                padding: '2px 8px',
                                borderRadius: '12px'
                            }}>
                                ADMIN VIEW
                            </span>
                        )}
                    </h2>
                    <button 
                        className="register-button user-logout-button" 
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>

                {error && (
                    <div className="user-error">
                        {error}
                    </div>
                )}

                {users.length === 0 ? (
                    <div className="login-text user-empty-message">
                        No users found.
                    </div>
                ) : (
                    <div className="user-list-container">
                        {users.map(user => (
                            <div key={user.id} className="user-card">
                                <div className="user-item-content">                                    <div className="user-info">
                                        <div className="login-text user-id">
                                            ID: {user.id}
                                        </div>
                                        <div className="login-text user-email">
                                            Email: {user.email}
                                        </div>
                                        <div className="login-text user-role">
                                            Role: <span style={{ 
                                                fontWeight: 'bold',
                                                color: user.role === 'ADMIN' ? '#e74c3c' : '#27ae60',
                                                backgroundColor: user.role === 'ADMIN' ? '#ffeaa7' : '#dff0d8',
                                                padding: '2px 6px',
                                                borderRadius: '8px',
                                                fontSize: '0.85em'
                                            }}>
                                                {user.role || 'USER'}
                                            </span>
                                        </div>
                                    </div>                                    <div className="user-actions">
                                        <Link to={`/users/${user.id}`}>
                                            <button className="login-button user-action-button">
                                                View Details
                                            </button>
                                        </Link>
                                        {currentUser?.role === 'ADMIN' && (
                                            <button 
                                                className="register-button user-delete-button" 
                                                onClick={() => handleDeleteUser(user.id)}
                                                title="Only admins can delete users"
                                            >
                                                Delete
                                            </button>
                                        )}
                                        {currentUser?.role !== 'ADMIN' && (
                                            <button 
                                                className="register-button user-delete-button"
                                                disabled
                                                style={{ 
                                                    opacity: 0.5, 
                                                    cursor: 'not-allowed',
                                                    backgroundColor: '#ccc'
                                                }}
                                                title="Only admins can delete users"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="user-navigation">
                    <Link to="/dashboard">
                        <button className="login-button">
                            Back to Dashboard
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default UsersList;

