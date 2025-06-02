import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from 'react-router-dom';
import { userAPI, authAPI } from './api';
import './LoginStyle.css';
import './UserStyle.css';

const UserDetail = () => {
  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    checkAuthAndFetchUser();
  }, [id]);
  const checkAuthAndFetchUser = async () => {
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

      // Fetch specific user
      const userDetail = await userAPI.getUserById(id);
      setUser(userDetail);
    } catch (error) {
      setError(error.message || 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  };
  const handleLogout = async () => {
    try {
      await authAPI.logout();
      localStorage.removeItem('user'); // Clear stored user data
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      localStorage.removeItem('user'); // Clear storage anyway
      navigate('/login');
    }
  };
  const handleDeleteUser = async () => {
    // Check if current user is admin
    if (currentUser?.role !== 'ADMIN') {
      setError('Only administrators can delete users');
      return;
    }

    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userAPI.deleteUser(id);
        navigate('/users');
      } catch (error) {
        setError(error.message || 'Failed to delete user');
      }
    }
  };if (loading) {
    return (
      <div className="container">
        <div className="login-container">
          <div className="login-text user-loading">
            Loading user details...
          </div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="container">
        <div className="login-container">
          <h2 className="login-text user-title" style={{ marginBottom: '1em' }}>
            Error
          </h2>
          <div className="user-error">
            {error}
          </div>
          <div className="user-navigation">
            <Link to="/users">
              <button className="login-button">Back to Users List</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (    <div className="container">
      <div className="login-container">        <div className="user-header">
          <h2 className="login-text user-title">
            User Details
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
        
        {user && (
          <div>
            <div className="user-detail-card">
              <h3 className="login-text user-detail-section-title">
                Basic Information
              </h3>
              <div className="login-text user-detail-field">
                <strong>ID:</strong> {user.id}
              </div>              <div className="login-text user-detail-field">
                <strong>Email:</strong> {user.email}
              </div>
              <div className="login-text user-detail-field">
                <strong>Role:</strong> <span style={{ 
                  fontWeight: 'bold',
                  color: user.role === 'ADMIN' ? '#e74c3c' : '#27ae60',
                  backgroundColor: user.role === 'ADMIN' ? '#ffeaa7' : '#dff0d8',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  fontSize: '0.9em'
                }}>
                  {user.role || 'USER'}
                </span>
              </div>
            </div>

            {user.userDetailsEntity && (
              <div className="user-detail-card">
                <h3 className="login-text user-detail-section-title">
                  Personal Details
                </h3>
                <div className="login-text user-detail-field">
                  <strong>First Name:</strong> {user.userDetailsEntity.firstName || 'Not provided'}
                </div>
                <div className="login-text user-detail-field">
                  <strong>Last Name:</strong> {user.userDetailsEntity.lastName || 'Not provided'}
                </div>
              </div>
            )}

            {user.userStats && (
              <div className="user-detail-card">
                <h3 className="login-text user-detail-section-title">
                  Statistics
                </h3>
                <div className="login-text user-detail-field">
                  <strong>Games Played:</strong> {user.userStats.gamesPlayed || 0}
                </div>
                <div className="login-text user-detail-field">
                  <strong>Games Won:</strong> {user.userStats.gamesWon || 0}
                </div>
                <div className="login-text user-detail-field">
                  <strong>Win Percentage:</strong> {
                    user.userStats.gamesPlayed > 0 
                      ? Math.round((user.userStats.gamesWon / user.userStats.gamesPlayed) * 100) + '%'
                      : '0%'
                  }
                </div>
              </div>
            )}

            <div className="user-navigation">
              <div className="user-navigation-buttons">
                <Link to="/users">
                  <button className="login-button">Back to Users List</button>
                </Link>                <Link to="/dashboard">
                  <button className="login-button">Dashboard</button>
                </Link>
                {currentUser?.role === 'ADMIN' && (
                  <button 
                    onClick={handleDeleteUser}
                    className="register-button user-delete-button"
                    title="Only admins can delete users"
                  >
                    Delete User
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
                    Delete User
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetail;
