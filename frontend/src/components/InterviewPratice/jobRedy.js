import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
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

  return (
    <ThemeProvider defaultTheme="light">
      <UserProvider>
        <div className={`font-sans ${isSidebarOpen ? '' : 'sidebar-closed'}`}>
          <Sidebar />
          <div className="main-content">
            <Toaster />
            <Routes>
              <Route path="/" element={<Home />} />
              {/* <Route path="/interviewDashboard" element={<InterviewDashboard />} />
              <Route path="/interview/:interviewId" element={<Interview />} />
              <Route path="/interview/:interviewId/start" element={<StartInterview />} />
              <Route path="/interview/:interviewId/feedback" element={<Feedback />} /> */}
            </Routes>
          </div>
        </div>
      </UserProvider>
    </ThemeProvider>
  )
}

export default JobReady