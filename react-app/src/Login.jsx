import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from './api.js';
import './LoginStyle.css';

function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Check for registration success message
    useEffect(() => {
        if (location.state?.message) {
            setMessage(location.state.message);
        }
    }, [location]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        // Validate form
        if (!formData.email || !formData.password) {
            setError('Email and password are required');
            setLoading(false);
            return;
        }        try {
            const response = await authAPI.login({
                email: formData.email,
                password: formData.password
            });

            if (response.success) {
                // Store user data in localStorage for role-based access
                localStorage.setItem('user', JSON.stringify({
                    userId: response.userId,
                    email: response.email,
                    role: response.role
                }));
                
                // Login successful, redirect to dashboard or home
                navigate('/dashboard'); // You can change this to your desired route
            } else {
                setError(response.message || 'Login failed');
            }
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="login-container">
                <form className="login" onSubmit={handleSubmit}>
                    <h2 className="login-text" style={{ textAlign: 'center', fontSize: '2em', marginBottom: '1em' }}>
                        Login
                    </h2>

                    {message && (
                        <div style={{ 
                            color: 'green', 
                            marginBottom: '1em', 
                            textAlign: 'center',
                            padding: '0.5em',
                            border: '1px solid green',
                            borderRadius: '4px',
                            backgroundColor: '#e8f5e8'
                        }}>
                            {message}
                        </div>
                    )}

                    {error && (
                        <div style={{ 
                            color: 'red', 
                            marginBottom: '1em', 
                            textAlign: 'center',
                            padding: '0.5em',
                            border: '1px solid red',
                            borderRadius: '4px',
                            backgroundColor: '#ffebee'
                        }}>
                            {error}
                        </div>
                    )}

                    <div className="login-text">Email</div>
                    <input 
                        className="email-input" 
                        name="email" 
                        type="email" 
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="email@email.com"
                        required
                    />
                    
                    <div className="login-text">Password</div>
                    <input 
                        className="email-input" 
                        name="password" 
                        type="password" 
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="password"
                        required
                    />
                    
                    <button 
                        className="login-button" 
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Log in'}
                    </button>
                </form>
                
                <Link to="/register">
                    <button className="register-button">Register</button>
                </Link>
                
                <p className="login-text" id="datetime" style={{ display: 'flex', justifyContent: 'center' }}></p>
            </div>
        </div>
    );
}

export default Login;