// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner"; 
import ProtectedRoute from './ProtectedRoute';
import { UserProvider } from './components/context/UserContext';




// Components
import ModernHomePage from './components/home/ModernHomePage'; 
import AuthPages from './components/auth/AuthPages'; 
import Profile from "./components/profile/profile";
import Dashboard from "./components/dashboard/dashboard";
import InterviewRoutes from "./components/InterviewPratice/InterviewRoutes";
import Learn from "./components/Learn/learn";
import Friend from "./components/Friends/friend";
import Internships  from "./components/Internships/internships";
import InternshipAdmin from "./components/Internships/InternshipAdmin";
import InternshipsDetail2 from "./components/Internships/Internshipdetail2";
import Home from "./components/InterviewPratice/Home";


function App() {
  return (
    <UserProvider>
    <Router>
      <Routes>
        <Route path="/" element={<ModernHomePage />} />

        <Route path="/auth" element={<AuthPages />} />


        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/:uid" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/interview" element={
          <ProtectedRoute>
            <InterviewRoutes />
          </ProtectedRoute>
        } />




        

        <Route path="/learn" element={<Learn />} />

        <Route path="/friends" element={<Friend />} /> 

        <Route path="/internships" element={<Internships />} />  

        <Route path="/admin" element={<InternshipAdmin />} />
         <Route path="/interviewHome" element={<Home />} />


        <Route path="/internship/:id" element={<InternshipsDetail2 />} />


        
        


      </Routes>
      
      <Toaster richColors position="top-right" />

    </Router>
    </UserProvider>
  );
}

export default App;
