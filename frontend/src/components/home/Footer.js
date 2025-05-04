import React from 'react';
import { Sparkles, Mail } from 'lucide-react';
import './ModernHomePage.css';

const Footer = () => (
  <footer className="glass-effect-dashbord">
    <div className="footer-content">
      <div className="footer-brand">
        <div className="logo">
          <Sparkles className="logo-icon" />
          <span>DevHub</span>
        </div>
        <p>Empowering developers to showcase their journey</p>
      </div>
      <div className="footer-links">
        <div>
          <h4>Quick Links</h4>
          <a href="/">Home</a>
          <a href="/interview">Interview</a>
          <a href="/internship">Internships</a>
        </div>
        <div>
          <h4>Contact</h4>
          <a href="mailto:hello@devhub.com">
            <Mail size={16} /> yourdevhub@gmail.com
          </a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
