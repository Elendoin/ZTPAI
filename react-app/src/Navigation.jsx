import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from './api.js';

function Navigation({ user, currentPage = 'daily-quiz', showStats, onToggleStats }) {
    const navigate = useNavigate();

    useEffect(() => {
        updateDateTime();
        const interval = setInterval(updateDateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    const updateDateTime = () => {
        const now = new Date();
        const timeString = now.toLocaleString();
        const dateTimeElement = document.getElementById('datetime');
        if (dateTimeElement) {
            dateTimeElement.textContent = timeString;
        }
    };

    const handleLogout = async () => {
        try {
            await authAPI.logout();
            localStorage.removeItem('user');
            navigate('/login');        } catch (error) {
            localStorage.removeItem('user');
            navigate('/login');
        }
    };

    const handleProfileClick = () => {
        if (user?.userId) {
            navigate(`/users/${user.userId}`);
        }
    };

    const handleHomeClick = () => {
        navigate('/daily-quiz');
    };

    const handleSuggestionsClick = () => {
        navigate('/suggestions');
    };

    return (
        <nav>
            <div className="left-nav-content">
                <i 
                    className={`fa-solid fa-house ${currentPage === 'daily-quiz' ? 'active' : ''}`}
                    onClick={handleHomeClick}
                    style={{ cursor: 'pointer' }}
                ></i>
                <i 
                    className={`fa-solid fa-lightbulb ${currentPage === 'suggestions' || currentPage === 'add-suggestion' ? 'active' : ''}`}
                    onClick={handleSuggestionsClick}
                    style={{ cursor: 'pointer' }}
                ></i>
            </div>
            <img src="/img/text_logo.svg" className="logo" alt="Popdle Logo" />
            <div className="right-nav-content">
                <p id="datetime"></p>
                <div id="popup" className="popup">
                    <p className="logout-text">Logged in as: <strong>{user?.email}</strong></p>
                    <button className="logout-button" onClick={handleLogout}>Log Out</button>
                </div>
                <i 
                    className="fa-solid fa-user" 
                    id="profile-button" 
                    onClick={handleProfileClick}
                    style={{ cursor: 'pointer' }}
                ></i>
            </div>
        </nav>
    );
}

export default Navigation;
