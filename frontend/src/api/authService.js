import api from './api';

// Helper function to handle errors consistently
const handleError = (error) => {
  // Extract error message from backend or use default
  const message =
    error.response?.data?.msg || error.response?.data?.message || error.message || 'Request failed';

  // Create error object with consistent structure
  const err = new Error(message);
  err.status = error.response?.status;
  err.details = error.response?.data?.errors || null;

  return Promise.reject(err);
};

// Token management utilities
const storeToken = (token) => {
  localStorage.setItem('token', token);
};

const getToken = () => {
  return localStorage.getItem('token');
};

const removeToken = () => {
  localStorage.removeItem('token');
};

// Auth API methods
export const login = async (credentials) => {
  try {
    const response = await api.post('/api/v1/auth/login', credentials);

    // Store the token
    if (response.data.token) {
      storeToken(response.data.token);
    }

    // Return user data
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/api/v1/auth/register', userData);

    // Auto-login after registration if token is returned
    if (response.data.token) {
      storeToken(response.data.token);
    }

    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/api/v1/auth/me');
    return response.data;
  } catch (error) {
    // If unauthorized, clear the invalid token
    if (error.response?.status === 401) {
      removeToken();
    }
    return handleError(error);
  }
};

export const logout = () => {
  // Clear the token from storage
  removeToken();

  // Optional: You might want to add an API call to invalidate the token on the server
  // await api.post('/auth/logout');
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const updateUserProfile = async (profileData) => {
  try {
    const response = await api.put('/auth/me', profileData);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

// Add refresh token method if your backend supports it
export const refreshToken = async () => {
  try {
    const response = await api.post('/auth/refresh-token');
    if (response.data.token) {
      storeToken(response.data.token);
    }
    return response.data;
  } catch (error) {
    removeToken();
    return handleError(error);
  }
};
