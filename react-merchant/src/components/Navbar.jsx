import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { authToken, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      {/* <div className="navbar-brand">Merchant Onboarding Dashboard</div> */}
      {authToken && (
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      )}
    </nav>
  );
};

export default Navbar;