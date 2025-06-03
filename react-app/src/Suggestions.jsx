import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from './Navigation.jsx';
import './DailyQuiz.css';

function Suggestions() {
    const [user, setUser] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [showStats, setShowStats] = useState(false);
    const [userStats, setUserStats] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        initializePage();
    }, []);

    useEffect(() => {
        // Filter suggestions based on search term
        if (searchTerm.trim() === '') {
            setFilteredSuggestions(suggestions);
        } else {
            const filtered = suggestions.filter(suggestion =>
                suggestion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                suggestion.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredSuggestions(filtered);
        }
    }, [searchTerm, suggestions]);

    const initializePage = async () => {
        try {
            const userData = JSON.parse(localStorage.getItem('user'));
            if (!userData) {
                navigate('/login');
                return;
            }
            setUser(userData);

            await fetchSuggestions();
            await fetchUserStats(userData.userId);
            
        } catch (error) {
            console.error('Error initializing page:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSuggestions = async () => {
        try {
            const response = await fetch('/api/suggestions', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const suggestionsData = await response.json();
                setSuggestions(suggestionsData);
                setFilteredSuggestions(suggestionsData);
            } else {
                console.error('Failed to fetch suggestions');
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    };

    const fetchUserStats = async (userId) => {
        try {
            const response = await fetch(`/api/users/${userId}`);
            if (response.ok) {
                const userData = await response.json();
                if (userData.userStats) {
                    setUserStats(userData.userStats);
                }
            }
        } catch (error) {
            console.error('Error fetching user stats:', error);
        }
    };

    const toggleStats = () => {
        setShowStats(!showStats);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleAddSuggestion = () => {
        navigate('/add-suggestion');
    };

    const handleLikeSuggestion = async (suggestionId) => {
        try {
            const response = await fetch(`/api/suggestions/${suggestionId}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                // Refresh suggestions to show updated like count
                await fetchSuggestions();
            }
        } catch (error) {
            console.error('Error liking suggestion:', error);
        }
    };

    if (loading) {
        return (
            <div className="browse-container">
                <p style={{ color: 'white', textAlign: 'center' }}>Loading...</p>
            </div>
        );
    }

    return (
        <div className="browse-container">
            <Navigation 
                user={user} 
                currentPage="suggestions" 
                showStats={showStats} 
                onToggleStats={toggleStats} 
            />
            
            <header>
                <div className="browse-tools">
                    <b>Current suggestions:</b>
                    <div className="browse-searchbar">
                        <input 
                            placeholder="Search for a suggestion"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
                    <button className="upload-button" onClick={handleAddSuggestion}>
                        <i className="fa-solid fa-upload"></i>
                    </button>
                </div>
            </header>
            
            <main className="suggestions-main">
                <section className="suggestions" id="suggestions">
                    {filteredSuggestions.length > 0 ? (
                        filteredSuggestions.map(suggestion => (
                            <div key={suggestion.id} className="suggestions-container">
                                <h2>{suggestion.title}</h2>
                                {suggestion.image && (
                                    <img 
                                        src={`/img/${suggestion.image}`} 
                                        className="franchise-images" 
                                        alt={suggestion.title}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                )}
                                <p>{suggestion.description}</p>
                                <div className="suggestion-actions">
                                    <button 
                                        className={`like-button ${suggestion.isLiked ? 'liked' : ''}`}
                                        onClick={() => handleLikeSuggestion(suggestion.id)}
                                    >
                                        <i className={`fa-solid fa-heart ${suggestion.isLiked ? 'liked-heart' : ''}`}></i> 
                                        {suggestion.likes || 0}
                                    </button>
                                    <span className="suggestion-author">
                                        by {suggestion.assignedBy?.email || 'Anonymous'}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-suggestions">
                            <p style={{ color: 'white', textAlign: 'center' }}>
                                {searchTerm ? 'No suggestions found matching your search.' : 'No suggestions available yet.'}
                            </p>
                        </div>
                    )}
                </section>
            </main>
            
            {showStats && userStats && (
                <div className="stats show">
                    <b>My Stats</b>
                    <p>Games Played: {(userStats.wins || 0) + (userStats.losses || 0)}</p>
                    <p>Games Won: {userStats.wins || 0}</p>
                    <p>Win Rate: {((userStats.wins || 0) / Math.max((userStats.wins || 0) + (userStats.losses || 0), 1) * 100).toFixed(1)}%</p>
                    <p>Current Streak: {userStats.currentStreak || 0}</p>
                    <p>Best Streak: {userStats.bestStreak || 0}</p>
                </div>
            )}
        </div>
    );
}

export default Suggestions;
