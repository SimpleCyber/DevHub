import React, { useState, useEffect } from 'react';
import { Sun, Moon, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase'; // Import your auth instance
import './ModernHomePage.css';

const Header = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);

    // Fetch current user
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribe();
    };
  }, [darkMode]);

  const handleRedirect = () => {
    navigate("/auth");
  };

  const handleRedirectDashboard = () => {
    if (userId) {
      navigate(`/dashboard/${userId}`);
    } else {
      navigate("/auth");
    }
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-content">
        <div className="logo">
          <Sparkles className="logo-icon" />
          <span>DevHub</span>
        </div>
        <div className="nav-links">
          <a href="#features" className='feature'>Features</a>
          <a href="#user" onClick={handleRedirectDashboard}>Dashboard</a>
          <a href="/internships" className='feature'>Internship</a>
          <button 
            className="theme-toggle glass-effect-dashbord"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? <Sun size={20} style={{ color: "white", cursor: "pointer" }} /> : <Moon size={20} style={{ cursor: "pointer" }} />}
          </button>
          <button className="connect-btn glass-effect-dashbord" onClick={handleRedirect}>
            Connect <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Header;
