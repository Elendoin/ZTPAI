import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from './api.js';
import './DailyQuiz.css';

function DailyQuiz() {    const [user, setUser] = useState(null);
    const [question, setQuestion] = useState(null);
    const [userStats, setUserStats] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [hasAnsweredToday, setHasAnsweredToday] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [userPreviousAnswer, setUserPreviousAnswer] = useState(null);
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
    };    const fetchTodaysQuestion = async () => {
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
    };    const fetchTodaysQuestionWithAnswer = async () => {
        try {
            const response = await fetch('/api/questions/today/with-answer');
            if (response.ok) {
                const questionData = await response.json();
                setQuestion(questionData);
                // Don't set selectedAnswer here - we just want to show the correct answer highlighted
            } else {
                console.error('No question found for today');
            }
        } catch (error) {
            console.error('Error fetching today\'s question with answer:', error);
        }
    };const checkUserAnswerStatus = async (userId) => {
        try {
            // Get user stats to check last_answered date
            const response = await fetch(`/api/users/${userId}`);
            if (response.ok) {
                const userData = await response.json();
                if (userData.userStats) {
                    setUserStats(userData.userStats);                    // Check if last_answered is today
                    // Use local date instead of UTC to match server timezone
                    const today = new Date();
                    const todayLocal = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                    const lastAnswered = userData.userStats.lastAnswered;
                    
                    console.log('Debug - Today (Local):', todayLocal);
                    console.log('Debug - Last answered (from API):', lastAnswered);
                    
                    // Convert lastAnswered from DD-MM-YYYY to YYYY-MM-DD format for comparison
                    let isToday = false;
                    if (lastAnswered) {
                        if (lastAnswered.includes('-')) {
                            // Check if it's in DD-MM-YYYY format or YYYY-MM-DD format
                            const parts = lastAnswered.split('-');
                            if (parts[0].length === 2) {
                                // DD-MM-YYYY format, convert to YYYY-MM-DD
                                const convertedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                                console.log('Debug - Converted date:', convertedDate);
                                isToday = convertedDate === todayLocal;
                            } else {
                                // Already in YYYY-MM-DD format
                                isToday = lastAnswered === todayLocal;
                            }
                        }
                    }
                    
                    console.log('Debug - Final comparison result:', isToday);
                      if (isToday) {
                        setHasAnsweredToday(true);
                        setShowResult(true);
                        // Store the user's previous answer
                        setUserPreviousAnswer(userData.userStats.latestAnswer);
                        // If user has already answered, we need to show the correct answer
                        // We'll fetch it separately since the regular endpoint doesn't include it
                        await fetchTodaysQuestionWithAnswer();
                          // Check their previous answer status using answered-today endpoint
                        const answerResponse = await fetch(`/api/users/${userId}/answered-today`);
                        if (answerResponse.ok) {
                            const answerData = await answerResponse.json();
                            // We can't determine if they were correct from just the hasAnsweredToday flag
                            // But we can show them they already answered and show the correct answer
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error checking user answer status:', error);
        }
    };const handleAnswerSelect = async (optionNumber) => {
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
                await updateUserStats(result.correct, optionLetter);
            }
        } catch (error) {
            console.error('Error checking answer:', error);
        }
    };    const updateUserStats = async (correct, userAnswer) => {
        try {
            const userData = JSON.parse(localStorage.getItem('user'));
            
            // Update user stats via API
            const response = await fetch(`/api/users/${userData.userId}/answer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // if you're using JWT
                },
                body: JSON.stringify({ 
                    correct: correct,
                    answer: userAnswer
                })
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
    };    const toggleStats = () => {
        setShowStats(!showStats);
    };    // Helper function to determine button class
    const getButtonClass = (optionLetter, optionNumber) => {
        if (!showResult) {
            return ''; // No special class if no result to show
        }
        
        // If the user has already answered today (returning visitor)
        if (hasAnsweredToday && !selectedAnswer) {
            // Show the correct answer in green
            if (question.correctAnswer === optionLetter) {
                return 'correct';
            }
            // Show the user's previous answer in red if it was wrong
            if (userPreviousAnswer === optionLetter && userPreviousAnswer !== question.correctAnswer) {
                return 'incorrect';
            }
            return '';
        }
        
        // If the user just answered (fresh answer)
        if (selectedAnswer) {
            if (selectedAnswer === optionNumber) {
                // This is the button they clicked
                return isCorrect ? 'correct' : 'incorrect';
            } else if (question.correctAnswer === optionLetter) {
                // Show the correct answer even if they got it wrong
                return 'correct';
            }
        }
        
        return '';
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
                            <p>{question.contents}</p>                            <form className="quizOptions" data-correct={question.correctAnswer}>                                <button 
                                    type="button"
                                    onClick={() => handleAnswerSelect(1)}
                                    disabled={hasAnsweredToday}
                                    className={getButtonClass('A', 1)}
                                    data-option="1"
                                >
                                    <b>A: </b>
                                    {question.optionA}
                                </button>                                <button 
                                    type="button"
                                    onClick={() => handleAnswerSelect(2)}
                                    disabled={hasAnsweredToday}
                                    className={getButtonClass('B', 2)}
                                    data-option="2"
                                >
                                    <b>B: </b>
                                    {question.optionB}
                                </button>                                <button 
                                    type="button"
                                    onClick={() => handleAnswerSelect(3)}
                                    disabled={hasAnsweredToday}
                                    className={getButtonClass('C', 3)}
                                    data-option="3"
                                >
                                    <b>C: </b>
                                    {question.optionC}
                                </button>                                <button 
                                    type="button"
                                    onClick={() => handleAnswerSelect(4)}
                                    disabled={hasAnsweredToday}
                                    className={getButtonClass('D', 4)}
                                    data-option="4"
                                >
                                    <b>D: </b>
                                    {question.optionD}
                                </button>
                            </form>                            {showResult && (
                                <div className="result-message">
                                    {hasAnsweredToday ? (
                                        <>
                                            <p style={{ color: 'orange', fontSize: '1.2em', fontWeight: 'bold' }}>
                                                📅 You have already answered today's question!
                                            </p>
                                            {userPreviousAnswer && (
                                                <p style={{ color: 'white', fontSize: '1em' }}>
                                                    Your answer was: <span style={{ 
                                                        color: userPreviousAnswer === question.correctAnswer ? 'green' : 'red', 
                                                        fontWeight: 'bold' 
                                                    }}>{userPreviousAnswer}</span>
                                                </p>
                                            )}
                                            <p style={{ color: 'white', fontSize: '1em' }}>
                                                The correct answer was: <span style={{ color: 'green', fontWeight: 'bold' }}>{question.correctAnswer}</span>
                                            </p>
                                            {userPreviousAnswer === question.correctAnswer ? (
                                                <p style={{ color: 'green', fontSize: '1em', fontWeight: 'bold' }}>✅ You got it right!</p>
                                            ) : (
                                                <p style={{ color: 'red', fontSize: '1em', fontWeight: 'bold' }}>❌ You got it wrong this time.</p>
                                            )}
                                            <p style={{ color: 'white', fontSize: '0.9em' }}>
                                                Come back tomorrow for the next question!
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            {isCorrect ? 
                                                <p style={{ color: 'green', fontSize: '1.2em', fontWeight: 'bold' }}>✅ Correct!</p> : 
                                                <p style={{ color: 'red', fontSize: '1.2em', fontWeight: 'bold' }}>❌ Incorrect!</p>
                                            }
                                        </>
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
