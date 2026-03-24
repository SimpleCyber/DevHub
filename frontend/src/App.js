// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import { UserProvider } from "./components/context/UserContext";
import { SidebarProvider } from "./components/context/SidebarContext";

// Components
import ModernHomePage from "./components/home/ModernHomePage";
import AuthPages from "./components/auth/AuthPages";
import OnboardingFlow from "./components/onboarding/OnboardingFlow";
import Profile from "./components/profile/profile";
import Dashboard from "./components/dashboard/dashboard";
import InterviewRoutes from "./components/InterviewPratice/InterviewRoutes";
import Learn from "./components/Learn/learn";
import Internships from "./components/Internships/internships";
import InternshipAdmin from "./components/Internships/InternshipAdmin";
import InternshipsDetail2 from "./components/Internships/Internshipdetail2";
import Home from "./components/InterviewPratice/Home";
import CareerPath from "./components/career/CareerPath";

function App() {
  return (
    <UserProvider>
      <SidebarProvider>
        <Router>
          <Routes>
            <Route path="/" element={<PublicRoute><ModernHomePage /></PublicRoute>} />
            <Route path="/auth" element={<PublicRoute><AuthPages /></PublicRoute>} />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <OnboardingFlow />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="/dashboard/:uid" element={<Dashboard />} />
            <Route
              path="/interview"
              element={
                <ProtectedRoute>
                  <InterviewRoutes />
                </ProtectedRoute>
              }
            />
            <Route path="/learn" element={<Learn />} />
            <Route path="/internships" element={<Internships />} />
            <Route path="/admin" element={<InternshipAdmin />} />
            <Route path="/interviewHome" element={<Home />} />
            <Route path="/internship/:id" element={<InternshipsDetail2 />} />
            <Route
              path="/career-path"
              element={
                <ProtectedRoute>
                  <CareerPath />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster richColors position="top-right" />
        </Router>
      </SidebarProvider>
    </UserProvider>
  );
}

export default App;
