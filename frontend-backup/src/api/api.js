import axios from 'axios';
import { toast } from 'react-toastify';

// Configuration
const API_URL = process.env.REACT_APP_API_URL || '/api'; // Using proxy in development
const API_TIMEOUT = 10000; // 10 seconds timeout

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * Request Interceptor
 * - Adds auth token to requests
 * - Handles request errors
 */
api.interceptors.request.use(
  (config) => {
    // Get token from storage
    const token = localStorage.getItem('token');

    // If token exists, add to headers
    if (token) {
      config.headers['x-auth-token'] = token;
    }

    // You can add other request modifications here
    // For example, adding tracking headers
    config.headers['X-Request-Id'] = generateRequestId();

    return config;
  },
  (error) => {
    // Handle request error (before it's sent)
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * - Handles global error responses
 * - Manages token refresh (if implemented)
 * - Redirects on auth failures
 */
api.interceptors.response.use(
  (response) => {
    // You can modify successful responses here
    // For example, unwrapping nested data if your API uses a standard response format

    // Example: if your API returns { data: {}, status: 'success' }
    // return response.data.data;

    return response.data;
  },
  (error) => {
    // Handle response errors

    // Check if error has a response (network errors won't)
    if (!error.response) {
      toast.error('Network error - please check your connection');
      return Promise.reject({
        message: 'Network Error',
        isNetworkError: true,
      });
    }

    const { status, data } = error.response;

    // Handle specific status codes
    switch (status) {
      case 401: // Unauthorized
        localStorage.removeItem('token');
        // Using window.location instead of navigate to ensure complete reload
        window.location.href = '/login?sessionExpired=true';
        break;

      case 403: // Forbidden
        toast.error("You don't have permission to perform this action");
        break;

      case 404: // Not Found
        toast.error('Resource not found');
        break;

      case 500: // Server Error
        toast.error('Server error - please try again later');
        break;

      default:
        // Show error message from server if available
        if (data && data.message) {
          toast.error(data.message);
        } else {
          toast.error('An unexpected error occurred');
        }
    }

    // Return a consistent error format
    return Promise.reject({
      status,
      message: data?.message || error.message,
      errors: data?.errors || null,
      code: data?.code || null,
    });
  }
);

// Helper function to generate unique request IDs
function generateRequestId() {
  return 'req_' + Math.random().toString(36).substr(2, 9);
}

/**
 * API Methods
 * These can be used directly or imported as needed
 */

// Auth API
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh'),
};

// Course API
export const courseApi = {
  getAll: () => api.get('/courses'),
  getById: (id) => api.get(`/courses/${id}`),
  create: (courseData) => api.post('/courses', courseData),
  update: (id, updates) => api.put(`/courses/${id}`, updates),
  delete: (id) => api.delete(`/courses/${id}`),
  enroll: (courseId) => api.post(`/courses/${courseId}/enroll`),
};

// Lesson API
export const lessonApi = {
  getByCourse: (courseId) => api.get(`/courses/${courseId}/lessons`),
  getById: (courseId, lessonId) => api.get(`/courses/${courseId}/lessons/${lessonId}`),
  completeLesson: (courseId, lessonId) =>
    api.post(`/courses/${courseId}/lessons/${lessonId}/complete`),
};

// User API
export const userApi = {
  updateProfile: (userId, profileData) => api.put(`/users/${userId}/profile`, profileData),
  changePassword: (userId, passwordData) => api.put(`/users/${userId}/password`, passwordData),
};

// Export the configured axios instance as well
export default api;
