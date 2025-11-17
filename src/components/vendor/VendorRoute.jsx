import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const VendorRoute = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  // Check if user is logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user is a vendor
  if (user.role !== 'vendor') {
    // Redirect to appropriate dashboard based on role
    return <Navigate to={user.role === 'admin' ? '/admin' : '/canteen'} replace />;
  }

  // Authorized: render nested vendor routes
  return <Outlet />;
};

export default VendorRoute;
