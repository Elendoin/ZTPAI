import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login.jsx';
import Register from './Register.jsx';
import Dashboard from './Dashboard.jsx';
import DailyQuiz from './DailyQuiz.jsx';
import UsersList from './UsersList.jsx';
import UserDetail from './UserDetail.jsx';

function App() {
    return (
        <Router>            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/daily-quiz" element={<DailyQuiz />} />
                <Route path="/users" element={<UsersList />} />
                <Route path="/users/:id" element={<UserDetail />} />
            </Routes>
        </Router>
    );
}

export default App;
