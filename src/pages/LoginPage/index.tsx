import { useState, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import './style.css';

interface LocationState {
  from?: {
    pathname: string;
  };
}

const LoginPage = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, guestLogin, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as LocationState)?.from?.pathname || '/home';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!usernameOrEmail.trim()) {
      setError('请输入用户名或邮箱');
      return;
    }
    if (!password) {
      setError('请输入密码');
      return;
    }

    try {
      await login({ usernameOrEmail: usernameOrEmail.trim(), password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    }
  };

  const handleGuestLogin = async () => {
    setError('');
    try {
      await guestLogin();
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : '访客登录失败');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12.5 7H11V13L16.25 16.15L17 14.92L12.5 12.25V7Z"
                fill="url(#logo-gradient)"
              />
              <defs>
                <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a5b4fc" />
                  <stop offset="50%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#5B5CFF" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="auth-title">欢迎回来</h1>
          <p className="auth-subtitle">登录您的智能闹钟账户</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="auth-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"
                  fill="currentColor"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="usernameOrEmail">
              用户名 / 邮箱
            </label>
            <input
              id="usernameOrEmail"
              type="text"
              className="form-input"
              placeholder="请输入用户名或邮箱"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              密码
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <button type="submit" className="auth-btn" disabled={isLoading}>
            {isLoading ? '登录中...' : '登 录'}
          </button>

          <button
            type="button"
            className="auth-btn-guest"
            onClick={handleGuestLogin}
            disabled={isLoading}
          >
            随便看看
          </button>
        </form>

        <div className="auth-footer">
          <span>还没有账户？</span>
          <Link to="/register" className="auth-link">
            立即注册
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
