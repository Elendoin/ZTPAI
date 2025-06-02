import {useEffect, useState} from "react";
import {Link, useNavigate} from 'react-router-dom';
import { userAPI, authAPI } from './api';
import './LoginStyle.css';
import './UserStyle.css';

const UsersList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        checkAuthAndFetchUsers();
    }, []);

    const checkAuthAndFetchUsers = async () => {
        try {
            // Check if user is authenticated
            const authStatus = await authAPI.getStatus();
            if (!authStatus.success) {
                navigate('/login');
                return;
            }

            // Fetch users
            const usersData = await userAPI.getAllUsers();
            setUsers(usersData);
        } catch (error) {
            setError(error.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) {
            return;
        }

        try {
            await userAPI.deleteUser(userId);
            // Refresh the users list after deletion
            setUsers(users.filter(user => user.id !== userId));
        } catch (error) {
            setError(error.message || 'Failed to delete user');
        }
    };

    const handleLogout = async () => {
        try {
            await authAPI.logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            navigate('/login'); // Navigate anyway
        }
    };    if (loading) {
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
            <div className="login-container">
                <div className="user-header">
                    <h2 className="login-text user-title">
                        Users List
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
                                <div className="user-item-content">
                                    <div className="user-info">
                                        <div className="login-text user-id">
                                            ID: {user.id}
                                        </div>
                                        <div className="login-text user-email">
                                            Email: {user.email}
                                        </div>
                                    </div>
                                    <div className="user-actions">
                                        <Link to={`/users/${user.id}`}>
                                            <button className="login-button user-action-button">
                                                View Details
                                            </button>
                                        </Link>
                                        <button 
                                            className="register-button user-delete-button" 
                                            onClick={() => handleDeleteUser(user.id)}
                                        >
                                            Delete
                                        </button>
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

