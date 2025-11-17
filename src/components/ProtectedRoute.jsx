import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { isAuthenticated, validateAuth, getCurrentUser, clearAuthData } from '../utils/auth';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const navigate = useNavigate();

  // Validate authentication on mount and when browser history changes
  useEffect(() => {
    const handlePopState = () => {
      // Revalidate auth when user tries to navigate back/forward
      if (!validateAuth(navigate)) {
        return;
      }
    };

    // Listen for browser back/forward button
    window.addEventListener('popstate', handlePopState);

    // Validate on mount
    validateAuth(navigate);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  // Check if user is logged in
  if (!isAuthenticated()) {
    clearAuthData();
    return <Navigate to="/login" replace />;
  }

  const user = getCurrentUser();

  // Double-check user data is valid
  if (!user) {
    clearAuthData();
    return <Navigate to="/login" replace />;
  }

  // Check if specific role is required
  if (requiredRole && user.role !== requiredRole) {
    // Redirect based on user's actual role
    const roleRoutes = {
      'admin': '/admin',
      'vendor': '/vendor',
      'staff': '/staff/dashboard',
      'student': '/meal-planner'
    };
    
    const redirectPath = roleRoutes[user.role] || '/login';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
