// frontend/src/api/client.js
import axios from 'axios';
import { toast } from 'react-toastify';
import { logout } from '../utils/auth'; // Your logout utility function

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1', // Explicit default
  timeout: 30000, // Increased timeout
  withCredentials: true, // Set to true if using cookies
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request ID for tracking
    config.headers['X-Request-ID'] = crypto.randomUUID();

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Request:', {
        url: config.url,
        method: config.method,
        headers: config.headers,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    // Log request error
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Store new token if returned in response
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
    }

    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data,
      });
    }

    return response.data;
  },
  (error) => {
    // Enhanced error handling
    if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please try again.');
      return Promise.reject({ ...error, message: 'Request timeout' });
    }

    if (error.message === 'Network Error') {
      toast.error('Cannot connect to server. Please check your connection.');
      return Promise.reject({ ...error, isNetworkError: true });
    }

    // Handle HTTP errors
    const status = error.response?.status;
    const data = error.response?.data;

    // Auto-logout on 401
    if (status === 401) {
      logout();
      toast.error('Session expired. Please login again.');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Handle 403
    if (status === 403) {
      toast.error('You are not authorized to perform this action.');
      return Promise.reject(error);
    }

    // Handle 429 (rate limiting)
    if (status === 429) {
      toast.error('Too many requests. Please slow down.');
      return Promise.reject(error);
    }

    // Handle 500 errors
    if (status >= 500) {
      toast.error('Server error. Please try again later.');
      return Promise.reject(error);
    }

    // Default error message
    const message = data?.message || 
                   data?.error?.message || 
                   error.message || 
                   'An unexpected error occurred';

    if (message && status !== 401) {
      toast.error(message);
    }

    // Enhanced error object
    const enhancedError = {
      ...error,
      message,
      status,
      isAxiosError: true,
      timestamp: new Date().toISOString(),
    };

    return Promise.reject(enhancedError);
  }
);

// Add retry mechanism for failed requests
api.retry = async (url, config, retries = 3, delay = 1000) => {
  try {
    return await api(url, config);
  } catch (error) {
    if (retries <= 0 || error.status === 401) {
      throw error;
    }
    await new Promise(res => setTimeout(res, delay));
    return api.retry(url, config, retries - 1, delay * 2);
  }
};

export default api;