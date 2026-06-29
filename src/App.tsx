import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './store/ThemeContext';
import HomePage from './pages/HomePage';
import SleepPage from './pages/SleepPage';
import ProfilePage from './pages/ProfilePage';
import WakePage from './pages/WakePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sleep"
        element={
          <ProtectedRoute>
            <SleepPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wake"
        element={
          <ProtectedRoute>
            <WakePage />
          </ProtectedRoute>
        }
      />
    </Routes>
    </ThemeProvider>
  );
}

export default App;
