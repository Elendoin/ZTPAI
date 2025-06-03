import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, suggestionAPI } from './api.js';
import Navigation from './Navigation.jsx';
import './DailyQuiz.css';

function AddSuggestion() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: null
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
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
        } catch (error) {
            console.error('Error initializing page:', error);
            navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear any previous error when user starts typing
        if (error) setError('');
        if (message) setMessage('');
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                setError('Please upload a valid image file (JPEG, PNG, or GIF)');
                return;
            }

            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                setError('Image file size must be less than 5MB');
                return;
            }

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
            
            if (error) setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setMessage('');

        // Validate form
        if (!formData.title.trim()) {
            setError('Title is required');
            setSubmitting(false);
            return;
        }

        if (!formData.description.trim()) {
            setError('Description is required');
            setSubmitting(false);
            return;
        }

        try {
            const submitData = new FormData();
            submitData.append('title', formData.title.trim());
            submitData.append('description', formData.description.trim());
            
            if (formData.image) {
                submitData.append('file', formData.image);
            }

            await suggestionAPI.createSuggestion(submitData);
            
            setMessage('Suggestion created successfully!');
            
            // Reset form
            setFormData({
                title: '',
                description: '',
                image: null
            });
            setImagePreview(null);
            
            // Redirect to suggestions page after a brief delay
            setTimeout(() => {
                navigate('/suggestions');
            }, 2000);
            
        } catch (err) {
            setError(err.message || 'Failed to create suggestion');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate('/suggestions');
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
                currentPage="add-suggestion"
            />
            
            <main className="add-suggestion-container">
                <h1 className="add-suggestion-header-text">Add New Suggestion</h1>
                
                <form className="add-suggestion-form" onSubmit={handleSubmit}>
                    {message && (
                        <div className="message-success" style={{ marginBottom: '20px' }}>
                            {message}
                        </div>
                    )}
                    
                    {error && (
                        <div className="message-error" style={{ marginBottom: '20px' }}>
                            {error}
                        </div>
                    )}
                    
                    <div className="add-suggestion-form-group">
                        <label className="add-suggestion-label" htmlFor="title">
                            Title *
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className="add-suggestion-input"
                            placeholder="Enter suggestion title"
                            required
                        />
                    </div>
                    
                    <div className="add-suggestion-form-group">
                        <label className="add-suggestion-label" htmlFor="description">
                            Description *
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="add-suggestion-textarea"
                            placeholder="Describe your suggestion"
                            rows="5"
                            required
                        />
                    </div>
                    
                    <div className="add-suggestion-form-group">
                        <label className="add-suggestion-label" htmlFor="image">
                            Image (Optional)
                        </label>
                        <input
                            type="file"
                            id="image"
                            name="image"
                            onChange={handleFileChange}
                            className="add-suggestion-file-input"
                            accept="image/*"
                        />
                        
                        {imagePreview && (
                            <div className="add-suggestion-image-preview">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="add-suggestion-preview-image"
                                />
                            </div>
                        )}
                    </div>
                    
                    <div className="add-suggestion-form-actions">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="add-suggestion-cancel-button"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="add-suggestion-submit-button"
                        >
                            {submitting ? 'Submitting...' : 'Submit Suggestion'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}

export default AddSuggestion;
