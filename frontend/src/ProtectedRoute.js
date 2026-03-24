import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "./components/context/UserContext";

const ProtectedRoute = ({ children }) => {
  const { user, userProfile, isLoading } = useUser();
  const location = useLocation();

  if (isLoading) {
    return (
      <div>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  const needsOnboarding =
    !userProfile || userProfile.onboardingCompleted !== true;

  if (needsOnboarding && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" />;
  }

  if (!needsOnboarding && location.pathname === "/onboarding") {
    return <Navigate to="/profile" />;
  }

  return children;
};

export default ProtectedRoute;
