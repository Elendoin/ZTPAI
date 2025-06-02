import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from './api.js';
import './DailyQuiz.css';

function DailyQuiz() {
    const [user, setUser] = useState(null);
    const [question, setQuestion] = useState(null);
    const [userStats, setUserStats] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [hasAnsweredToday, setHasAnsweredToday] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showStats, setShowStats] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        initializePage();
        updateDateTime();
        const interval = setInterval(updateDateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    const initializePage = async () => {
        try {
            // Get user from localStorage
            const userData = JSON.parse(localStorage.getItem('user'));
            if (!userData) {
                navigate('/login');
                return;
            }
            setUser(userData);

            // Fetch today's question
            await fetchTodaysQuestion();
            
            // Check if user has answered today and get stats
            await checkUserAnswerStatus(userData.userId);
            
        } catch (error) {
            console.error('Error initializing page:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTodaysQuestion = async () => {
        try {
            const response = await fetch('/api/questions/today');
            if (response.ok) {
                const questionData = await response.json();
                setQuestion(questionData);
            } else {
                console.error('No question found for today');
            }
        } catch (error) {
            console.error('Error fetching today\'s question:', error);
        }
    };

    const checkUserAnswerStatus = async (userId) => {
        try {
            // Get user stats to check last_answered date
            const response = await fetch(`/api/users/${userId}`);
            if (response.ok) {
                const userData = await response.json();
                if (userData.userStats) {
                    setUserStats(userData.userStats);
                    
                    // Check if last_answered is today
                    const today = new Date().toISOString().split('T')[0];
                    const lastAnswered = userData.userStats.lastAnswered;
                    
                    if (lastAnswered === today) {
                        setHasAnsweredToday(true);
                        setShowResult(true);
                    }
                }
            }
        } catch (error) {
            console.error('Error checking user answer status:', error);
        }
    };    const handleAnswerSelect = async (optionNumber) => {
        if (hasAnsweredToday || !question) return;

        setSelectedAnswer(optionNumber);

        // Convert option number to letter (1=A, 2=B, 3=C, 4=D)
        const optionLetter = String.fromCharCode(64 + optionNumber); // 65 is 'A', so 64 + 1 = 'A'

        try {
            // Check if answer is correct
            const response = await fetch(`/api/questions/${question.id}/check`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ answer: optionLetter })
            });

            if (response.ok) {
                const result = await response.json();
                setIsCorrect(result.correct);
                setShowResult(true);
                setHasAnsweredToday(true);
                
                // Update user stats
                await updateUserStats(result.correct);
            }
        } catch (error) {
            console.error('Error checking answer:', error);
        }
    };    const updateUserStats = async (correct) => {
        try {
            const userData = JSON.parse(localStorage.getItem('user'));
            
            // Update user stats via API
            const response = await fetch(`/api/users/${userData.userId}/answer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // if you're using JWT
                },
                body: JSON.stringify({ correct: correct })
            });

            if (response.ok) {
                const updatedUser = await response.json();
                if (updatedUser.userStats) {
                    setUserStats(updatedUser.userStats);
                }
            }

        } catch (error) {
            console.error('Error updating user stats:', error);
        }
    };

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
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            localStorage.removeItem('user');
            navigate('/login');
        }
    };

    const toggleStats = () => {
        setShowStats(!showStats);
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
            <nav>
                <div className="left-nav-content">
                    <i className="fa-solid fa-house"></i>
                    <i className="fa-solid fa-chart-simple" id="stats-button" onClick={toggleStats}></i>
                    <i className="fa-solid fa-lightbulb"></i>
                </div>
                <img src="/img/text_logo.svg" className="logo" alt="Popdle Logo" />
                <div className="right-nav-content">
                    <p id="datetime"></p>
                    <div id="popup" className="popup">
                        <p className="logout-text">Logged in as: <strong>{user?.email}</strong></p>
                        <button className="logout-button" onClick={handleLogout}>Log Out</button>
                    </div>
                    <i className="fa-solid fa-user" id="profile-button"></i>
                </div>
            </nav>
            
            <header>
                <b>Today's question:</b>
            </header>
            
            <main className="browse-end">
                <section className="dailyQuiz">
                    {question ? (
                        <>
                            <img src="/img/text_logo.svg" alt="Question" />
                            <p>{question.contents}</p>
                            <form className="quizOptions" data-correct={question.correctAnswer}>
                                <button 
                                    type="button"
                                    onClick={() => handleAnswerSelect(1)}
                                    disabled={hasAnsweredToday}
                                    className={showResult && selectedAnswer === 1 ? (isCorrect ? 'correct' : 'incorrect') : ''}
                                    data-option="1"
                                >
                                    <b>A: </b>
                                    {question.optionA}
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => handleAnswerSelect(2)}
                                    disabled={hasAnsweredToday}
                                    className={showResult && selectedAnswer === 2 ? (isCorrect ? 'correct' : 'incorrect') : ''}
                                    data-option="2"
                                >
                                    <b>B: </b>
                                    {question.optionB}
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => handleAnswerSelect(3)}
                                    disabled={hasAnsweredToday}
                                    className={showResult && selectedAnswer === 3 ? (isCorrect ? 'correct' : 'incorrect') : ''}
                                    data-option="3"
                                >
                                    <b>C: </b>
                                    {question.optionC}
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => handleAnswerSelect(4)}
                                    disabled={hasAnsweredToday}
                                    className={showResult && selectedAnswer === 4 ? (isCorrect ? 'correct' : 'incorrect') : ''}
                                    data-option="4"
                                >
                                    <b>D: </b>
                                    {question.optionD}
                                </button>
                            </form>
                            
                            {showResult && (
                                <div className="result-message">
                                    {isCorrect ? 
                                        <p style={{ color: 'green', fontSize: '1.2em', fontWeight: 'bold' }}>✅ Correct!</p> : 
                                        <p style={{ color: 'red', fontSize: '1.2em', fontWeight: 'bold' }}>❌ Incorrect!</p>
                                    }
                                    {hasAnsweredToday && (
                                        <p style={{ color: 'white', fontSize: '0.9em' }}>
                                            Come back tomorrow for the next question!
                                        </p>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <p style={{ color: 'white', textAlign: 'center' }}>No question available for today.</p>
                    )}
                </section>
            </main>
            
            {showStats && (
                <div className="stats">
                    <b>Current Statistics</b>
                    <p>Wins: {userStats?.wins || 0}</p>
                    <p>Losses: {userStats?.losses || 0}</p>
                </div>
            )}
        </div>
    );
}

export default DailyQuiz;
