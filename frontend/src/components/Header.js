import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { useEffect, useState } from 'react';
import './Header.scss';

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <div className="header">
      <div className="left">
        <span className="logo">🌐 Online Literacy Platform</span>
        <span className="logo-subtext">LiteracyPro</span>
      </div>
      <div className="right">
        <div className="auth">
          {isAuthenticated ? (
            <>
              <span className="user-info">
                Welcome, <strong>{user?.username}</strong>
              </span>
              <Link to="/profile" className="settings-btn">
                ⚙️ Settings
              </Link>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
        <button
          className="theme-toggle"
          onClick={() => setDarkMode((prev) => !prev)}
          aria-label="Toggle Theme"
        >
          {darkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>
    </div>
  );
}
