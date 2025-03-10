// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Components
import ModernHomePage from './components/home/ModernHomePage'; 
import AuthPages from './components/auth/AuthPages'; 
import Profile from "./components/profile/profile";
import "./components/home/ModernHomePage.css"
import Dashboard from "./components/dashboard/dashboard";
import JobReady from "./components/InterviewPratice/jobRedy";
import Learn from "./components/Learn/learn";
import Friend from "./components/Friends/friend";


function App() {
  return (
    <Router>
      <Routes>
        {/* Define the Home Route */}
        <Route path="/" element={<ModernHomePage />} />

        {/* Define the Auth Route */}
        <Route path="/auth" element={<AuthPages />} />

        {/* Define the Profile Route */}
        <Route path="/profile" element={<Profile />} />

        {/* Define the dashboard path */}
        <Route path="/dashboard" element={ <Dashboard />} />

        {/* AI checker for job readiness */}
        <Route path="/jobReady" element={ <JobReady />} />

        <Route path="/learn" element={<Learn />} />

        <Route path="/friends" element={<Friend />} />  
              



      </Routes>
    </Router>
  );
}

export default App;
