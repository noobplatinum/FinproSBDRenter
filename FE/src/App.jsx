import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register/Register';
import About from './pages/About'; 
import Booking from './pages/Booking';
import BookingSuccess from './pages/BookingSuccess';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import Unauthorized from './components/Error/GlobalError';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail'; // Import komponen PropertyDetail baru

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminProperties from './pages/admin/Properties';
import AdminAddProperty from './pages/admin/AddProperty';
import AdminEditProperty from './pages/admin/EditProperty';
import AdminUsers from './pages/admin/Users';
import AdminTransactions from './pages/admin/Transactions';

// Layout and Protected Routes
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/routing/ProtectedRoute';
import AdminRoute from './components/routing/AdminRoute';
import AdminLayout from './components/layout/AdminLayout';
import NotFound from './components/Error/GlobalError';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster 
          position="top-right"
          toastOptions={{
            success: {
              style: {
                background: '#DFF2BF',
                color: '#4F8A10',
                border: '1px solid #4F8A10',
              },
              duration: 5000
            },
            error: {
              style: {
                background: '#FFBABA',
                color: '#D8000C',
                border: '1px solid #D8000C',
              },
              duration: 5000
            },
          }}
        />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="about" element={<About />} />
            <Route path="properties/:id" element={<PropertyDetail />} />
            <Route path="properties" element={<Properties />} />
            
            {/* Protected user routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="booking/:id" element={<Booking />} />
              <Route path="booking-success" element={<BookingSuccess />} />
              <Route path="my-bookings" element={<MyBookings />} />
              <Route path="profile" element={<Profile />} />
            </Route>
            
            {/* 404 page */}
            <Route path="*" element={<NotFound />} />
          </Route>
          
          {/* Admin routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </AdminRoute>
          } />
          
          {/* Admin property routes */}
          <Route path="/admin/properties/add" element={
            <AdminRoute>
              <AdminLayout>
                <AdminAddProperty />
              </AdminLayout>
            </AdminRoute>
          } />
          
          <Route path="/admin/properties/edit/:id" element={
            <AdminRoute>
              <AdminLayout>
                <AdminEditProperty />
              </AdminLayout>
            </AdminRoute>
          } />
          
          <Route path="/admin/properties" element={
            <AdminRoute>
              <AdminLayout>
                <AdminProperties />
              </AdminLayout>
            </AdminRoute>
          } />
          
          <Route path="/admin/users" element={
            <AdminRoute>
              <AdminLayout>
                <AdminUsers />
              </AdminLayout>
            </AdminRoute>
          } />
          
          <Route path="/admin/transactions" element={
            <AdminRoute>
              <AdminLayout>
                <AdminTransactions />
              </AdminLayout>
            </AdminRoute>
          } />

          {/* Unauthorized route */}
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;