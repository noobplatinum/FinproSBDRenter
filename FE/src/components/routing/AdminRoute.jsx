import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  
  // Tambahkan log untuk debugging
  console.log('AdminRoute - User:', user);
  console.log('AdminRoute - Loading:', loading);
  console.log('AdminRoute - isAdmin:', isAdmin());
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin()) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

export default AdminRoute;