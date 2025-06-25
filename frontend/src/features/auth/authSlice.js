import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login } from '../../api/authService';

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await login(credentials); // Store token in localStorage if rememberMe is true
      if (credentials.rememberMe) {
        localStorage.setItem('authToken', response.token);
      }
      return response;
    } catch (error) {
      // Handle different error formats
      const errorMessage =
        error.response?.data?.message || error.message || 'Login failed. Please try again.';
      return rejectWithValue(errorMessage);
    }
  }
);

const initialState = {
  user: null,
  token: null,
  status: 'idle',
  error: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('authToken');
      state.user = null;
      state.token = null;
      state.status = 'idle';
      state.error = null;
      state.isAuthenticated = false;
    },
    resetAuthState: (state) => {
      state.status = 'idle';
      state.error = null;
    },
    initializeAuth: (state) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        state.token = token;
        state.isAuthenticated = true;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, resetAuthState, initializeAuth } = authSlice.actions;
export default authSlice.reducer;
