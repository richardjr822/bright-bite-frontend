import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const StaffRoute = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  // Check if user is logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user is delivery staff
  if (user.role !== 'delivery_staff') {
    // Redirect to appropriate dashboard based on role
    const redirectMap = {
      admin: '/admin',
      vendor: '/vendor',
      student: '/canteen',
    };
    return <Navigate to={redirectMap[user.role] || '/login'} replace />;
  }

  // Authorized: render nested staff routes
  return <Outlet />;
};

export default StaffRoute;
