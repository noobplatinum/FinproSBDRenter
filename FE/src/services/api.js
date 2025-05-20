import axios from 'axios';

const API_URL = 'https://finpro-sbd-renter-backend.vercel.app/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor untuk token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor untuk handling error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle centralized error handling
    console.error('API Error:', error);
    
    if (error.response) {
      // Server merespons dengan status error
      if (error.response.status === 401) {
        // Unauthorized - clear auth data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

export const handleApiError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return {
      success: false,
      message: error.response.data.message || 'Terjadi kesalahan pada server',
      status: error.response.status
    };
  } else if (error.request) {
    // The request was made but no response was received
    return {
      success: false,
      message: 'Tidak dapat terhubung ke server',
      status: 0
    };
  } else {
    // Something happened in setting up the request that triggered an Error
    return {
      success: false,
      message: 'Terjadi kesalahan',
      status: 0
    };
  }
};