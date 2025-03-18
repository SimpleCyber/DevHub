// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Components
import ModernHomePage from './components/home/ModernHomePage'; 
import AuthPages from './components/auth/AuthPages'; 
import Profile from "./components/profile/profile";
import "./components/home/ModernHomePage.css"
import Dashboard from "./components/dashboard/dashboard";
import JobReady from "./components/InterviewPratice/InterviewRoutes";
import Learn from "./components/Learn/learn";
import Friend from "./components/Friends/friend";
import Internships  from "./components/Internships/internships";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ModernHomePage />} />

        <Route path="/auth" element={<AuthPages />} />

        <Route path="/profile" element={<Profile />} />

        <Route path="/dashboard" element={ <Dashboard />} />

        <Route path="/interview" element={ <JobReady />} />

        <Route path="/learn" element={<Learn />} />

        <Route path="/friends" element={<Friend />} /> 

        <Route path="/internships" element={<Internships />} />  
              



      </Routes>
    </Router>
  );
}

export default App;
