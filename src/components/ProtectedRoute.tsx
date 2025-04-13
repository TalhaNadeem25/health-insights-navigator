import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // If auth is still loading, show nothing or a loader
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If authenticated, render the children
  return <>{children}</>;
};

export default ProtectedRoute; 