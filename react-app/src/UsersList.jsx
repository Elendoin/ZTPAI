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
            const authStatus = await authAPI.getStatus();
            if (!authStatus.success) {
                navigate('/login');
                return;            }

            const userData = {
                userId: authStatus.userId,
                email: authStatus.email,
                role: authStatus.role
            };
            setCurrentUser(userData);            localStorage.setItem('user', JSON.stringify(userData));

            const usersData = await userAPI.getAllUsers();
            setUsers(usersData);
        } catch (error) {
            setError(error.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };    const handleDeleteUser = async (userId) => {
        if (currentUser?.role !== 'ADMIN') {
            setError('Only administrators can delete users');
            return;
        }

        if (!window.confirm('Are you sure you want to delete this user?')) {
            return;
        }        try {
            await userAPI.deleteUser(userId);
            setUsers(users.filter(user => user.id !== userId));
            setError('');
        } catch (error) {
            setError(error.message || 'Failed to delete user');
        }
    };    const handleLogout = async () => {        try {
            await authAPI.logout();
            localStorage.removeItem('user');
            navigate('/login');        } catch (error) {
            console.error('Logout failed:', error);
            localStorage.removeItem('user');
            navigate('/login');
        }
    };if (loading) {
        return (
            <div className="container">
                <div className="login-container user-list-loading-container">
                    <div className="login-text user-loading user-list-loading-compact">
                        Loading users...
                    </div>
                </div>
            </div>
        );
    }

    return (        <div className="container">
            <div className="login-container user-list-container-compact">                <div className="user-header user-list-header-compact">
                    <h2 className="login-text user-title user-list-title-compact">
                        Users List
                        {currentUser?.role === 'ADMIN' && (
                            <span style={{ 
                                fontSize: '0.6em', 
                                color: '#e74c3c',
                                marginLeft: '8px',
                                backgroundColor: '#ffeaa7',
                                padding: '2px 6px',
                                borderRadius: '8px'
                            }}>
                                ADMIN VIEW
                            </span>
                        )}
                    </h2>
                    <button 
                        className="register-button user-logout-button user-list-logout-compact" 
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>                {error && (
                    <div className="user-error user-list-error-compact">
                        {error}
                    </div>
                )}                {users.length === 0 ? (
                    <div className="login-text user-empty-message user-list-empty-compact">
                        No users found.
                    </div>
                ) : (                    <div className="user-list-container">
                        {users.map(user => (
                            <div key={user.id} className="user-card user-list-card-compact">
                                <div className="user-item-content user-list-item-content-compact">                                    <div className="user-info user-list-info-compact">
                                        <div className="login-text user-id user-list-id-compact">
                                            ID: {user.id}
                                        </div>
                                        <div className="login-text user-email user-list-email-compact">
                                            Email: {user.email}
                                        </div>
                                        <div className="login-text user-role user-list-role-compact">
                                            Role: <span className={`user-list-role-badge ${
                                                user.role === 'ADMIN' ? 'user-list-role-admin' : 'user-list-role-user'
                                            }`}>
                                                {user.role || 'USER'}
                                            </span>
                                        </div>
                                    </div>                                    <div className="user-actions user-list-actions-compact">
                                        <Link to={`/users/${user.id}`}>
                                            <button className="login-button user-action-button user-list-button-compact">
                                                View Details
                                            </button>
                                        </Link>
                                        {currentUser?.role === 'ADMIN' && (
                                            <button 
                                                className="register-button user-delete-button user-list-button-compact" 
                                                onClick={() => handleDeleteUser(user.id)}
                                                title="Only admins can delete users"
                                            >
                                                Delete
                                            </button>
                                        )}                                        {currentUser?.role !== 'ADMIN' && (
                                            <button 
                                                className="register-button user-delete-button user-list-button-compact user-list-button-disabled"
                                                disabled
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
                )}                <div className="user-navigation user-list-navigation-compact">
                    <Link to="/dashboard">
                        <button className="login-button user-list-button-compact">
                            Back to Dashboard
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default UsersList;

