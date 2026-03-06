// InterviewRoutes.js
import { Toaster } from "../ui/sonner";
import { UserProvider } from "../context/UserContext";
import { ThemeProvider } from "./ThemeProvider";
import { Sidebar } from "../sidebar/sidebar";
import { useState } from "react";
import "./jobready.css";

import Home from "./Home";
import Dashboard from "./Dashboard";

function InterviewRoutes() {
  const [activeComponent, setActiveComponent] = useState("home");

  const switchComponent = (componentName, interviewId = null) => {
    setActiveComponent(componentName);
  };

  const renderActiveComponent = () => {
    switch (activeComponent) {
      case "home":
        return <Home switchComponent={switchComponent} />;
      case "dashboard":
        return <Dashboard switchComponent={switchComponent} />;
      default:
        return <Home switchComponent={switchComponent} />;
    }
  };

  return (
    <ThemeProvider defaultTheme="light" className="bg-blue-50">
      <UserProvider>
        <Sidebar switchComponent={switchComponent} />
        <div className="main-content ml-16 md:ml-64 flex-grow bg-[#e9effe] min-h-screen">
          <Toaster />
          {renderActiveComponent()}
        </div>
      </UserProvider>
    </ThemeProvider>
  );
}

export default InterviewRoutes;
