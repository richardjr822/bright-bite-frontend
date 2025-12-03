import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, ROLE_ROUTES, PUBLIC_ROUTES } from '../../context/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

/**
 * AuthGuard - Protects routes requiring authentication
 * Redirects unauthenticated users to login
 */
export const AuthGuard = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Verifying authentication..." />;
  }

  if (!isAuthenticated) {
    // Save intended destination for post-login redirect
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
};

/**
 * RoleGuard - Protects routes requiring specific roles
 * Redirects users without required role to their dashboard
 */
export const RoleGuard = ({ children, allowedRoles, redirectTo = null }) => {
  const { user, isAuthenticated, isLoading, getRedirectPath } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Checking permissions..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  if (!roles.includes(user?.role)) {
    const redirect = redirectTo || getRedirectPath();
    return <Navigate to={redirect} replace />;
  }

  return children;
};

/**
 * GuestGuard - Prevents authenticated users from accessing guest-only pages
 * Redirects authenticated users to their dashboard
 */
export const GuestGuard = ({ children }) => {
  const { isAuthenticated, isLoading, getRedirectPath } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  if (isAuthenticated) {
    return <Navigate to={getRedirectPath()} replace />;
  }

  return children;
};

/**
 * StudentGuard - Specific guard for student routes
 */
export const StudentGuard = ({ children }) => {
  return (
    <RoleGuard allowedRoles={['student', 'admin']}>
      {children}
    </RoleGuard>
  );
};

/**
 * VendorGuard - Specific guard for vendor routes
 */
export const VendorGuard = ({ children }) => {
  return (
    <RoleGuard allowedRoles={['vendor', 'admin']}>
      {children}
    </RoleGuard>
  );
};

/**
 * AdminGuard - Specific guard for admin routes
 */
export const AdminGuard = ({ children }) => {
  return (
    <RoleGuard allowedRoles={['admin']}>
      {children}
    </RoleGuard>
  );
};

/**
 * StaffGuard - Specific guard for delivery staff routes
 */
export const StaffGuard = ({ children }) => {
  return (
    <RoleGuard allowedRoles={['staff', 'delivery_staff', 'admin']}>
      {children}
    </RoleGuard>
  );
};

export default {
  AuthGuard,
  RoleGuard,
  GuestGuard,
  StudentGuard,
  VendorGuard,
  AdminGuard,
  StaffGuard,
};
