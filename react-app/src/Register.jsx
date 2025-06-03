import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from './api.js';
import './LoginStyle.css';

function Register() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        surname: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value        });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);        setError('');

        if (!formData.email || !formData.password || !formData.name || !formData.surname) {
            setError('All fields are required');
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            setLoading(false);
            return;
        }

        try {
            const response = await authAPI.register({
                email: formData.email,
                password: formData.password,
                name: formData.name,
                surname: formData.surname
            });            if (response.success) {
                navigate('/login', {
                    state: { message: 'Registration successful! Please log in.' }
                });
            } else {
                setError(response.message || 'Registration failed');
            }
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="login-container">
                <form className="login" onSubmit={handleSubmit}>
                    <h2 className="login-text" style={{ textAlign: 'center', fontSize: '2em', marginBottom: '1em' }}>
                        Register
                    </h2>
                    
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

                    <div className="login-text">First Name</div>
                    <input 
                        className="email-input register-input"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John"
                        required
                    />

                    <div className="login-text">Last Name</div>
                    <input 
                        className="email-input register-input"
                        name="surname"
                        type="text"
                        value={formData.surname}
                        onChange={handleChange}
                        placeholder="Doe"
                        required
                    />

                    <div className="login-text">Email</div>
                    <input 
                        className="email-input register-input"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="email@email.com"
                        required
                    />

                    <div className="login-text">Password</div>
                    <input 
                        className="email-input register-input"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="password"
                        required
                    />

                    <div className="login-text">Confirm Password</div>
                    <input 
                        className="email-input register-input"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="confirm password"
                        required
                    />

                    <button 
                        className="login-button" 
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>
                
                <Link to="/login">
                    <button className="register-button">
                        Back to Login
                    </button>
                </Link>

                <p className="login-text" id="datetime" style={{ display: 'flex', justifyContent: 'center' }}></p>
            </div>
        </div>
    );
}

export default Register;
