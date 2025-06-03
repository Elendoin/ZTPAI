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
  }, [id]);  const checkAuthAndFetchUser = async () => {
    try {
      const authStatus = await authAPI.getStatus();
      if (!authStatus.success) {
        navigate('/login');
        return;      }

      const userData = {
        userId: authStatus.userId,
        email: authStatus.email,
        role: authStatus.role
      };
      setCurrentUser(userData);      localStorage.setItem('user', JSON.stringify(userData));

      const userDetail = await userAPI.getUserById(id);
      setUser(userDetail);
    } catch (error) {
      setError(error.message || 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  };
  const handleLogout = async () => {    try {
      await authAPI.logout();
      localStorage.removeItem('user');
      navigate('/login');    } catch (error) {
      console.error('Logout failed:', error);
      localStorage.removeItem('user');
      navigate('/login');
    }
  };  const handleDeleteUser = async () => {
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
        <div className="login-container user-detail-loading-container">
          <div className="login-text user-loading user-detail-loading-compact">
            Loading user details...
          </div>
        </div>
      </div>
    );
  }if (error) {
    return (
      <div className="container">
        <div className="login-container user-detail-error-container">
          <h2 className="login-text user-title user-detail-title-compact" style={{ 
            marginBottom: '1em'
          }}>
            Error
          </h2>
          <div className="user-error user-detail-error-compact">
            {error}
          </div>
          <div className="user-navigation">
            <Link to="/users">
              <button className="login-button user-detail-button-large">Back to Users List</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (    <div className="container">
      <div className="login-container user-detail-container">        <div className="user-header user-detail-header-compact">
          <h2 className="login-text user-title user-detail-title-compact">
            User Details
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
            className="register-button user-logout-button user-detail-logout-compact" 
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
        
        {user && (
          <div>            <div className="user-detail-card user-detail-card-compact">
              <h3 className="login-text user-detail-section-title user-detail-section-title-compact">
                Basic Information
              </h3>
              <div className="login-text user-detail-field user-detail-field-compact">
                <strong>ID:</strong> {user.id}
              </div>              <div className="login-text user-detail-field user-detail-field-compact">
                <strong>Email:</strong> {user.email}
              </div>
              <div className="login-text user-detail-field user-detail-field-compact">
                <strong>Role:</strong> <span className={`user-detail-role-badge ${
                  user.role === 'ADMIN' ? 'user-detail-role-admin' : 'user-detail-role-user'
                }`}>
                  {user.role || 'USER'}
                </span>
              </div>
            </div>            {user.userDetailsEntity && (
              <div className="user-detail-card user-detail-card-compact">
                <h3 className="login-text user-detail-section-title user-detail-section-title-compact">
                  Personal Details
                </h3>
                <div className="login-text user-detail-field user-detail-field-compact">
                  <strong>First Name:</strong> {user.userDetailsEntity.name || 'Not provided'}
                </div>
                <div className="login-text user-detail-field user-detail-field-compact">
                  <strong>Last Name:</strong> {user.userDetailsEntity.surname || 'Not provided'}
                </div>
              </div>
            )}            {user.userStats && (
              <div className="user-detail-card user-detail-card-compact">
                <h3 className="login-text user-detail-section-title user-detail-section-title-compact">
                  Statistics
                </h3>
                <div className="login-text user-detail-field user-detail-field-compact">
                  <strong>Games Played:</strong> {(user.userStats.wins || 0) + (user.userStats.losses || 0)}
                </div>
                <div className="login-text user-detail-field user-detail-field-compact">
                  <strong>Games Won:</strong> {user.userStats.wins || 0}
                </div>
                <div className="login-text user-detail-field user-detail-field-compact">
                  <strong>Win Percentage:</strong> {
                    ((user.userStats.wins || 0) + (user.userStats.losses || 0)) > 0 
                      ? Math.round(((user.userStats.wins || 0) / ((user.userStats.wins || 0) + (user.userStats.losses || 0))) * 100) + '%'
                      : '0%'
                  }
                </div>
              </div>
            )}<div className="user-navigation user-detail-navigation-compact">              <div className="user-navigation-buttons user-detail-navigation-buttons-compact">
                <Link to="/daily-quiz">
                  <button className="login-button user-detail-button-large">Back to Daily Quiz</button>
                </Link>
                <Link to="/users">
                  <button className="login-button user-detail-button-large">Back to Users List</button>
                </Link>                <Link to="/dashboard">
                  <button className="login-button user-detail-button-small">Dashboard</button>
                </Link>
                {currentUser?.role === 'ADMIN' && (
                  <button 
                    onClick={handleDeleteUser}
                    className="register-button user-delete-button user-detail-button-small"
                    title="Only admins can delete users"
                  >
                    Delete User
                  </button>
                )}                {currentUser?.role !== 'ADMIN' && (
                  <button 
                    className="register-button user-delete-button user-detail-button-small user-detail-button-disabled"
                    disabled
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
