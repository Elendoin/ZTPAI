import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from './Navigation.jsx';
import './DailyQuiz.css';

function AddSuggestion() {
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: null
    });
    const [loading, setLoading] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [userStats, setUserStats] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        initializePage();
    }, []);

    const initializePage = async () => {
        try {
            const userData = JSON.parse(localStorage.getItem('user'));
            if (!userData) {
                navigate('/login');
                return;
            }
            setUser(userData);
            await fetchUserStats(userData.userId);
        } catch (error) {
            console.error('Error initializing page:', error);
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                image: file
            }));
            
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title.trim() || !formData.description.trim()) {
            alert('Please fill in both title and description');
            return;
        }

        setLoading(true);
        
        try {
            let imagePath = null;
            
            // Upload image if provided
            if (formData.image) {
                const imageFormData = new FormData();
                imageFormData.append('image', formData.image);
                
                const imageResponse = await fetch('/api/suggestions/upload-image', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: imageFormData
                });
                
                if (imageResponse.ok) {
                    const imageData = await imageResponse.json();
                    imagePath = imageData.imagePath;
                } else {
                    throw new Error('Failed to upload image');
                }
            }
            
            // Create suggestion
            const suggestionData = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                image: imagePath
            };
            
            const response = await fetch('/api/suggestions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(suggestionData)
            });
            
            if (response.ok) {
                navigate('/suggestions');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create suggestion');
            }
            
        } catch (error) {
            console.error('Error creating suggestion:', error);
            alert('Failed to create suggestion: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/suggestions');
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="browse-container">
            <Navigation 
                user={user} 
                currentPage="add-suggestion" 
                showStats={showStats} 
                onToggleStats={toggleStats} 
            />
              <header>
                <div className="add-suggestion-header-text">
                    Add New Suggestion
                </div>
            </header>
            
            <main className="add-suggestion-container">
                <form className="add-suggestion-form" onSubmit={handleSubmit}>
                    <div className="add-suggestion-form-group">
                        <label className="add-suggestion-label" htmlFor="title">Title:</label>
                        <input
                            className="add-suggestion-input"
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="Enter suggestion title"
                            maxLength={100}
                            required
                        />
                    </div>
                    
                    <div className="add-suggestion-form-group">
                        <label className="add-suggestion-label" htmlFor="description">Description:</label>
                        <textarea
                            className="add-suggestion-textarea"
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Enter suggestion description"
                            rows={6}
                            maxLength={500}
                            required
                        />
                    </div>
                    
                    <div className="add-suggestion-form-group">
                        <label className="add-suggestion-label" htmlFor="image">Image (optional):</label>
                        <input
                            className="add-suggestion-file-input"
                            type="file"
                            id="image"
                            name="image"
                            onChange={handleImageChange}
                            accept="image/*"
                        />
                        {imagePreview && (
                            <div className="add-suggestion-image-preview">
                                <img className="add-suggestion-preview-image" src={imagePreview} alt="Preview" />
                            </div>
                        )}
                    </div>
                    
                    <div className="add-suggestion-form-actions">
                        <button 
                            type="button" 
                            className="add-suggestion-cancel-button" 
                            onClick={handleCancel}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="add-suggestion-submit-button" 
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create Suggestion'}
                        </button>
                    </div>
                </form>
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

export default AddSuggestion;
