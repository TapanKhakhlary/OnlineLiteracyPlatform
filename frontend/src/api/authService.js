import api from './api';

// Error handling utility
const handleAuthError = (error) => {
  // Log detailed error information for debugging
  console.error('Auth Error:', {
    endpoint: error.config?.url,
    status: error.response?.status,
    message: error.message,
    responseData: error.response?.data,
  });
  // Extract meaningful error message
  const errorMessage =
    error.response?.data?.msg ||
    error.response?.data?.message ||
    error.message ||
    'Authentication failed';

  // Create enhanced error object
  const authError = new Error(errorMessage);
  authError.status = error.response?.status;
  authError.details = error.response?.data?.errors || null;
  authError.code = error.response?.data?.code || null;

  return Promise.reject(authError);
};

// Token management with expiration support
const TOKEN_KEY = 'authToken';
const EXPIRATION_KEY = 'tokenExpiration';

const storeAuthData = (token, expiresIn = 3600) => {
  const expiration = Date.now() + expiresIn * 1000;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(EXPIRATION_KEY, expiration.toString());
};

const getAuthToken = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiration = localStorage.getItem(EXPIRATION_KEY);

  if (!token || !expiration) return null;

  if (Date.now() > parseInt(expiration, 10)) {
    clearAuthData();
    return null;
  }

  return token;
};

const clearAuthData = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXPIRATION_KEY);
};

// Auth API methods
export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    // eslint-disable-next-line no-console
    console.log('Login API response:', response);

    if (response.token) {
      storeAuthData(response.token, response.expiresIn || 604800); // 7 days fallback
    }

    return {
      user: response.user,
      token: response.token,
      expiresIn: response.expiresIn,
    };
  } catch (error) {
    return handleAuthError(error);
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);

    if (response.token) {
      storeAuthData(response.token, response.expiresIn || 604800);
    }

    return {
      user: response.user,
      token: response.token,
      expiresIn: response.expiresIn,
    };
  } catch (error) {
    return handleAuthError(error);
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      clearAuthData();
    }
    return handleAuthError(error);
  }
};

export const logout = async () => {
  try {
    // Optional: Call server-side logout if needed
    await api.post('/auth/logout');
  } finally {
    clearAuthData();
  }
};

export const refreshToken = async () => {
  try {
    const response = await api.post('/auth/refresh-token');
    if (response.data.token) {
      storeAuthData(response.data.token, response.data.expiresIn);
    }
    return {
      token: response.data.token,
      expiresIn: response.data.expiresIn,
    };
  } catch (error) {
    clearAuthData();
    return handleAuthError(error);
  }
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};

export const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/auth/me', profileData);
    return response.data;
  } catch (error) {
    return handleAuthError(error);
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
    return handleAuthError(error);
  }
};
