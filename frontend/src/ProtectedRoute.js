import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from './components/context/UserContext';

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <div>Loading...</div>; // Add a loading spinner here
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return children;
};

export default ProtectedRoute;