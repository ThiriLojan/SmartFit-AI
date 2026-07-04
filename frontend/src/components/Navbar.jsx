import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

function Navbar({ isLiveSession, setIsLiveSession }) {
  const [isBackendActive, setIsBackendActive] = useState(false);

  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const response = await fetch('https://thirilojan-smartfit-ai-backend.hf.space', { method: 'GET' });
        if (response.ok) {
          setIsBackendActive(true);
        } else {
          setIsBackendActive(false);
        }
      } catch (error) {
        setIsBackendActive(false);
      }
    };

    checkBackendHealth();
    const intervalId = setInterval(checkBackendHealth, 3000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <header className="navbar">
      <div className="nav-content">
        <NavLink to="/" style={{ textDecoration: 'none' }} className="logo-area">
          <div className="logo-icon" style={{ background: 'linear-gradient(135deg, #1e1821 0%, #100c14 100%)', boxShadow: '0 0 20px rgba(255, 122, 0, 0.4)', border: '1.5px solid #ff7a00' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* AI Neural Circuit Halo / Orbit */}
              <circle cx="12" cy="12" r="9.5" stroke="rgba(255, 122, 0, 0.35)" strokeWidth="1.2" strokeDasharray="3 3" />
              <circle cx="18.5" cy="5.5" r="2.2" fill="#ff7a00" />
              <circle cx="5.5" cy="18.5" r="2.2" fill="#ffc800" />
              <path d="M16.5 7.5L14.5 9.5" stroke="#ff7a00" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M7.5 16.5L9.5 14.5" stroke="#ffc800" strokeWidth="1.5" strokeLinecap="round" />
              
              {/* Central Fitness Dumbbell */}
              <path d="M6.5 12H17.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M5 9.5V14.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M8 8V16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M16 8V16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M19 9.5V14.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              
              {/* AI Energy Core inside the Dumbbell Bar */}
              <circle cx="12" cy="12" r="2.5" fill="#ff7a00" />
              <circle cx="12" cy="12" r="1.2" fill="#ffffff" />
            </svg>
          </div>
          <span className="logo-text glow-text">SmartFit AI</span>
        </NavLink>

        <ul className="nav-links">
          <li>
            <NavLink to="/" style={({ isActive }) => ({ color: isActive ? '#ff7a00' : '' })}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/playground" style={({ isActive }) => ({ color: isActive ? '#ff7a00' : '' })}>
              Live Playground
            </NavLink>
          </li>
          <li>
            <NavLink to="/upload" style={({ isActive }) => ({ color: isActive ? '#ff7a00' : '' })}>
              Upload Video
            </NavLink>
          </li>
          <li>
            <NavLink to="/models" style={({ isActive }) => ({ color: isActive ? '#ff7a00' : '' })}>
              AI Neural Net
            </NavLink>
          </li>
          <li>
            <NavLink to="/architecture" style={({ isActive }) => ({ color: isActive ? '#ff7a00' : '' })}>
              Architecture
            </NavLink>
          </li>
        </ul>

        <div className="nav-actions">
          <span
            className="glow-badge"
            style={{
              borderColor: isBackendActive ? '#10b981' : '#ff3b30',
              background: isBackendActive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 59, 48, 0.12)',
              color: isBackendActive ? '#10b981' : '#ff3b30',
              boxShadow: isBackendActive ? '0 0 18px rgba(16, 185, 129, 0.35)' : '0 0 18px rgba(255, 59, 48, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '20px',
              fontWeight: 700,
              fontSize: '0.75rem',
              transition: 'all 0.3s ease',
              cursor: 'default'
            }}
            title={isBackendActive ? "Python Flask Backend (Port 5000) Connected" : "Backend Server Unreachable - Check Python API"}
          >
            <span
              className="pulse-dot"
              style={{
                background: isBackendActive ? '#10b981' : '#ff3b30',
                boxShadow: isBackendActive ? '0 0 8px #10b981' : '0 0 8px #ff3b30'
              }}
            ></span>
            {isBackendActive ? 'BACKEND ACTIVE' : 'BACKEND INACTIVE'}
          </span>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
