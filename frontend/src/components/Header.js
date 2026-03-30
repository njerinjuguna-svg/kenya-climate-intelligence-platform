import React from 'react';
import './Header.css';

const Header = ({ user, onLogout }) => {
  return (
    <header className="header">
      <div className="header-left">
        <h1>🌍 Kenya Climate & Environmental Intelligence Platform</h1>
      </div>
      <div className="header-right">
        {user && (
          <div className="header-user">
            <span>👤 {user.username}</span>
            <span className="header-role">{user.role}</span>
            <button className="logout-btn" onClick={onLogout}>
              Sign Out
            </button>
          </div>
        )}
        {!user && <span>Real-time Climate Monitoring</span>}
      </div>
    </header>
  );
};

export default Header;