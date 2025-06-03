import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from './api.js';
import Navigation from './Navigation.jsx';
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
            const userData = JSON.parse(localStorage.getItem('user'));
            if (!userData) {
                navigate('/login');
                return;
            }
            setUser(userData);

            await fetchTodaysQuestion();
            
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
                const questionData = await response.json();                setQuestion(questionData);
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
            } else {
                console.error('No question found for today');
            }
        } catch (error) {
            console.error('Error fetching today\'s question with answer:', error);
        }
    };const checkUserAnswerStatus = async (userId) => {
        try {
            const response = await fetch(`/api/users/${userId}`);
            if (response.ok) {
                const userData = await response.json();
                if (userData.userStats) {
                    setUserStats(userData.userStats);                    const today = new Date();
                    const todayLocal = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                    const lastAnswered = userData.userStats.lastAnswered;
                    
                    console.log('Debug - Today (Local):', todayLocal);
                    console.log('Debug - Last answered (from API):', lastAnswered);
                    
                    let isToday = false;
                    if (lastAnswered) {
                        if (lastAnswered.includes('-')) {
                            const parts = lastAnswered.split('-');
                            if (parts[0].length === 2) {
                                const convertedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                                console.log('Debug - Converted date:', convertedDate);
                                isToday = convertedDate === todayLocal;
                            } else {
                                isToday = lastAnswered === todayLocal;
                            }
                        }
                    }
                    
                    console.log('Debug - Final comparison result:', isToday);
                      if (isToday) {
                        setHasAnsweredToday(true);
                        setShowResult(true);
                        setUserPreviousAnswer(userData.userStats.latestAnswer);
                        await fetchTodaysQuestionWithAnswer();
                          const answerResponse = await fetch(`/api/users/${userId}/answered-today`);
                        if (answerResponse.ok) {
                            const answerData = await answerResponse.json();
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error checking user answer status:', error);
        }
    };const handleAnswerSelect = async (optionNumber) => {
        if (hasAnsweredToday || !question) return;        setSelectedAnswer(optionNumber);

        const optionLetter = String.fromCharCode(64 + optionNumber);

        try {
            const response = await fetch(`/api/questions/${question.id}/check`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ answer: optionLetter })
            });            if (response.ok) {
                const result = await response.json();
                setIsCorrect(result.correct);
                setShowResult(true);
                setHasAnsweredToday(true);
                
                await fetchTodaysQuestionWithAnswer();
                
                await updateUserStats(result.correct, optionLetter);
            }
        } catch (error) {
            console.error('Error checking answer:', error);
        }
    };    const updateUserStats = async (correct, userAnswer) => {
        try {
            const userData = JSON.parse(localStorage.getItem('user'));
            
            const response = await fetch(`/api/users/${userData.userId}/answer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
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
    };    const updateDateTime = () => {
        const now = new Date();
        const timeString = now.toLocaleString();
        const dateTimeElement = document.getElementById('datetime');
        if (dateTimeElement) {
            dateTimeElement.textContent = timeString;
        }
    };

    const toggleStats = () => {
        setShowStats(!showStats);
    };const getButtonClass = (optionLetter, optionNumber) => {
        if (!showResult) {
            return '';
        }
        
        if (hasAnsweredToday && !selectedAnswer) {
            if (question.correctAnswer === optionLetter) {
                return 'correct';
            }
            if (userPreviousAnswer === optionLetter && userPreviousAnswer !== question.correctAnswer) {
                return 'incorrect';
            }
            return '';
        }
        
        if (selectedAnswer) {
            if (selectedAnswer === optionNumber) {
                return isCorrect ? 'correct' : 'incorrect';
            } else if (question.correctAnswer === optionLetter) {
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
    }    return (
        <div className="browse-container">
            <Navigation 
                user={user} 
                currentPage="daily-quiz" 
                showStats={showStats} 
                onToggleStats={toggleStats} 
            />
            
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
                                <div className="result-message">                                    {hasAnsweredToday && !selectedAnswer ? (
                                        <>
                                            {userPreviousAnswer && (
                                                <p style={{ color: 'white', fontSize: '0.9em', margin: '5px 0' }}>
                                                    Your answer was: <span style={{ 
                                                        color: userPreviousAnswer === question.correctAnswer ? 'green' : 'red', 
                                                        fontWeight: 'bold' 
                                                    }}>{userPreviousAnswer}</span>
                                                </p>
                                            )}
                                            <p style={{ color: 'white', fontSize: '0.9em', margin: '5px 0' }}>
                                                The correct answer was: <span style={{ color: 'green', fontWeight: 'bold' }}>{question.correctAnswer}</span>
                                            </p>
                                            {userPreviousAnswer === question.correctAnswer ? (
                                                <p style={{ color: 'green', fontSize: '0.9em', fontWeight: 'bold', margin: '5px 0' }}>You got it right!</p>
                                            ) : (
                                                <p style={{ color: 'red', fontSize: '0.9em', fontWeight: 'bold', margin: '5px 0' }}>You got it wrong this time.</p>
                                            )}
                                            <p style={{ color: 'white', fontSize: '0.8em', margin: '5px 0' }}>
                                                Come back tomorrow for the next question!
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            {isCorrect ? 
                                                <p style={{ color: 'green', fontSize: '1.2em', fontWeight: 'bold' }}>Correct!</p> : 
                                                <>
                                                    <p style={{ color: 'red', fontSize: '1.2em', fontWeight: 'bold' }}>Incorrect!</p>
                                                    <p style={{ color: 'white', fontSize: '1em' }}>
                                                        The correct answer was: <span style={{ color: 'green', fontWeight: 'bold' }}>{question.correctAnswer}</span>
                                                    </p>
                                                </>
                                            }
                                        </>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <p style={{ color: 'white', textAlign: 'center' }}>No question available for today.</p>
                    )}                </section>
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

export default DailyQuiz;
