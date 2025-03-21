// InterviewRoutes.js

import { Routes, Route } from "react-router-dom"
import { Toaster } from "../ui/sonner"
import Home from "./Home"
import Interview from "./Interview"
import InterviewDashboard from "./InterviewDashboard"
import StartInterview from "./StartInterview"
import Feedback from "./Feedback"
import { UserProvider } from "../context/UserContext"
import { ThemeProvider } from "./ThemeProvider"
import { Sidebar } from "../sidebar/sidebar"
import { useState, useEffect } from 'react'
import './jobready.css'

function JobReady() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeComponent, setActiveComponent] = useState('home');
  const [activeInterviewId, setActiveInterviewId] = useState(null);

  // Listen for sidebar state changes
  useEffect(() => {
    const handleSidebarChange = () => {
      const sidebar = document.querySelector('.sidebar');
      setIsSidebarOpen(sidebar?.classList.contains('open') ?? true);
    };

    // Initial check
    handleSidebarChange();

    // Create an observer to watch for class changes on the sidebar
    const observer = new MutationObserver(handleSidebarChange);
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebar) {
      observer.observe(sidebar, {
        attributes: true,
        attributeFilter: ['class']
      });
    }

    return () => observer.disconnect();
  }, []);

  // Function to change the active component
  const switchComponent = (componentName, interviewId = null) => {
    setActiveComponent(componentName);
    if (interviewId) {
      setActiveInterviewId(interviewId);
    }
  };

  // Render the appropriate component based on activeComponent state
  const renderActiveComponent = () => {
    switch (activeComponent) {
      case 'interviewDashboard':
        return <InterviewDashboard switchComponent={switchComponent} />;
      case 'interview':
        return <Interview switchComponent={switchComponent} interviewId={activeInterviewId} />;
      case 'startInterview':
        return <StartInterview switchComponent={switchComponent} interviewId={activeInterviewId} />;
      case 'feedback':
        return <Feedback switchComponent={switchComponent} interviewId={activeInterviewId} />;
      case 'home':
      default:
        return <Home switchComponent={switchComponent} />;
    }
  };

  return (
    <ThemeProvider defaultTheme="light">
      <UserProvider>
        <div className={`font-sans ${isSidebarOpen ? '' : 'sidebar-closed'}`}>
          <Sidebar />
          <div className="main-content">
            <Toaster />
            {renderActiveComponent()}
          </div>
        </div>
      </UserProvider>
    </ThemeProvider>
  )
}

export default JobReady