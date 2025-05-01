// InterviewRoutes.js

import { Toaster } from "../ui/sonner"
import { UserProvider } from "../context/UserContext"
import { ThemeProvider } from "./ThemeProvider"
import { Sidebar } from "../sidebar/sidebar"
import { useState } from "react"
import "./jobready.css"

// Import all pages
import Home from "./Home"
import Dashboard from "./Dashboard"
import Interview from "./Interview"
import Feedback from "./Feedback"

function InterviewRoutes() {
  const [activeComponent, setActiveComponent] = useState("home")
  const [activeInterviewId, setActiveInterviewId] = useState(null)

  const switchComponent = (componentName, interviewId = null) => {
    setActiveComponent(componentName)
    setActiveInterviewId(interviewId)
  }

  const renderActiveComponent = () => {
    switch (activeComponent) {
      case "home":
        return <Home switchComponent={switchComponent} />
      case "dashboard":
        return <Dashboard switchComponent={switchComponent} />
      case "interview":
        return <Interview switchComponent={switchComponent} interviewId={activeInterviewId} />
      case "feedback":
        return <Feedback switchComponent={switchComponent} />
      default:
        return <Home switchComponent={switchComponent} />
    }
  }

  return (
    <ThemeProvider defaultTheme="light" className="bg-blue-50">
      <UserProvider>
        <div className="font-sans flex">
          <Sidebar switchComponent={switchComponent} />
          <div className="main-content flex-grow bg-[#e9effe]">
            <Toaster />
            {renderActiveComponent()}
          </div>
        </div>
      </UserProvider>
    </ThemeProvider>
  )
}

export default InterviewRoutes
