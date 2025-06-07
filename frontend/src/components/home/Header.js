import React, { useState, useEffect } from 'react';
import { Sun, Moon, ArrowRight, Sparkles, X, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase'; // Import your auth instance
import './ModernHomePage.css';

const Header = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userId, setUserId] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const handleRedirectInterview = () => {
    if (userId) {
      navigate(`/interview`);
    } else {
      navigate("/auth");
    }
  };

  const handleInternshipRedirect = () => {
    navigate("/internships");
    setMobileMenuOpen(false);
  };

  return (
    <>
    
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-content">
          <div className="logo">
            <Sparkles className="logo-icon" />
            <span>DevHub</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="nav-links">
            <a href="#user" onClick={handleRedirectDashboard} className='feature'>Dashboard</a>
            <a href="/internships" className='feature'>Internship</a>
            <a href="/interview" onClick={handleRedirectInterview} className='feature'>Interview</a>
            
            <button 
              className="theme-toggle glass-effect-dashbord feature"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <Sun size={20} style={{ color: "white", cursor: "pointer" }} /> : <Moon size={20} style={{ cursor: "pointer" }} />}
            </button>
            
            <button 
              className="hidden sm:flex items-center connect-btn glass-effect-dashbord" 
              onClick={handleRedirect}
            >
              Connect <ArrowRight size={16} />
            </button>

          </div>
          
          {/* Mobile Hamburger Menu Button */}
          <button 
            className="md:hidden p-2 rounded-lg focus:outline-none"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={24} className={darkMode ? "text-white" : "text-gray-800"} />
          </button>
        </div>
      </nav>


      {/* Mobile Sidebar Menu */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-gray-900 text-white z-50 transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:hidden `}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
              <span className="text-xl font-bold text-purple-400">DevHub</span>
            </div>
            <button 
              className="p-2 rounded-lg hover:bg-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto py-4">
            <button 
              onClick={() => {
                handleRedirectDashboard();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              Dashboard
            </button>
            <button 
              onClick={handleInternshipRedirect}
              className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              Internship
            </button>
            <button 
              onClick={() => {
                handleRedirectInterview();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              Interview
            </button>
          </div>
          
          <div className="p-4 border-t border-gray-700">
            <button 
              className="w-full flex items-center justify-center gap-2 p-2 rounded-lg hover:bg-gray-800 transition-colors mb-4"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? (
                <>
                  <Sun size={20} />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon size={20} />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
            
            <button 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              onClick={() => {
                handleRedirect();
                setMobileMenuOpen(false);
              }}
            >
              Connect <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Overlay when sidebar is open */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Header;