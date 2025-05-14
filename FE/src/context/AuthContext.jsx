import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { loginUser, registerUser } from '../services/auth.service';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user data exists in localStorage
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        
        // Set default auth header for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error('Failed to parse stored user data', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await loginUser(email, password);
      
      if (response.success) {
        const userData = response.data;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', userData.token);
        
        // Set authorization header for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
        
        return userData;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      console.log('Registering user with data:', userData);
      const response = await registerUser(userData);
      console.log('Register response:', response);
      
      if (response && response.success) {
        toast.success('Registrasi berhasil! Silakan login.');
        return response.data;
      } else {
        const errorMsg = response?.message || 'Registrasi gagal';
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('Register error full details:', error);
      const errorMsg = error.response?.data?.message || 'Registrasi gagal, silakan coba lagi';
      toast.error(errorMsg);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    toast.success('Berhasil logout');
  };

  const updateUserData = (newData) => {
    const updatedUser = { ...user, ...newData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Tambahkan console.log untuk debugging
  const isAdmin = () => {
    console.log('Checking admin status, user:', user);
    return user && user.role === 'admin';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, updateUserData, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);