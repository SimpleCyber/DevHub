import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from './components/context/UserContext';

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <div><div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div></div>; 
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return children;
};

export default ProtectedRoute;