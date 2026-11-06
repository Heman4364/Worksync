import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const ProtectedRoute = ({ requiredRole }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role) {
    const userRole = user.role.replace('ROLE_', '');
    if (requiredRole === 'ADMIN' && userRole !== 'ADMIN') {
      return <Navigate to="/dashboard" replace />;
    }
    if (requiredRole === 'MANAGER' && userRole === 'MEMBER') {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
