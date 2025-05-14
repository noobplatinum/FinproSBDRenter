import api from './api';

export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/accounts/login', { email, password });
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/accounts', userData);
    return response.data;
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
};

export const getUserProfile = async (userId) => {
  try {
    const response = await api.get(`/accounts/${userId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateUserProfile = async (userId, userData) => {
  try {
    const response = await api.put(`/accounts/${userId}`, userData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};