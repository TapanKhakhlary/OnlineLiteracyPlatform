// src/components/Navbar.js
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import './Navbar.scss';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-brand">
          <span className="logo-text">LiteracyPro</span>
          <span className="logo-subtext">Online Literacy Platform</span>
        </Link>
      </div>

      <div className="navbar-right">
        {user ? (
          <div className="user-menu">
            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>
            <div className="user-dropdown">
              <span className="welcome-text">Welcome, {user.username}</span>
              <div className="dropdown-content">
                <Link to="/profile" className="dropdown-link">
                  Profile
                </Link>
                <Link to="/settings" className="dropdown-link">
                  Settings
                </Link>
                <button onClick={handleLogout} className="logout-button">
                  Logout
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="guest-links">
            <Link to="/features" className="nav-link">
              Features
            </Link>
            <Link to="/pricing" className="nav-link">
              Pricing
            </Link>
            <Link to="/login" className="login-button">
              Login
            </Link>
            <Link to="/register" className="register-button">
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
