import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-left">
        <h1>🌍 Kenya Climate & Environmental Intelligence Platform</h1>
      </div>
      <div className="header-right">
        <span>Real-time Climate Monitoring</span>
      </div>
    </header>
  );
};

export default Header;