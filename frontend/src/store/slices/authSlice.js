import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const storedUser = localStorage.getItem('worksync_user');
const storedToken = localStorage.getItem('worksync_access_token');
const storedWorkspace = localStorage.getItem('worksync_workspace_id');

let parsedUser = null;
try {
  parsedUser = storedUser ? JSON.parse(storedUser) : null;
} catch (e) {
  parsedUser = null;
  localStorage.removeItem('worksync_user');
}

const initialState = {
  user: parsedUser,
  token: storedToken || null,
  activeWorkspaceId: storedWorkspace ? Number(storedWorkspace) : 1,
  isAuthenticated: !!storedToken,
  loading: false,
  error: null,
};

export const registerUser = createAsyncThunk('auth/register', async (credentials, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register', credentials);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || (typeof err === 'string' ? err : 'Registration failed'));
  }
});

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || (typeof err === 'string' ? err : 'Login failed'));
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async (_, { getState }) => {
  try {
    const refreshToken = localStorage.getItem('worksync_refresh_token');
    await api.post('/auth/logout', { refreshToken });
  } catch (e) {
    // proceed with client logout
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setActiveWorkspace: (state, action) => {
      state.activeWorkspaceId = action.payload;
      localStorage.setItem('worksync_workspace_id', action.payload);
    },
    updateUserProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('worksync_user', JSON.stringify(state.user));
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Register
    builder.addCase(registerUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.accessToken;
      if (action.payload.defaultWorkspaceId) {
        state.activeWorkspaceId = action.payload.defaultWorkspaceId;
        localStorage.setItem('worksync_workspace_id', action.payload.defaultWorkspaceId);
      }
      localStorage.setItem('worksync_access_token', action.payload.accessToken);
      localStorage.setItem('worksync_refresh_token', action.payload.refreshToken);
      localStorage.setItem('worksync_user', JSON.stringify(action.payload.user));
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.accessToken;
      if (action.payload.defaultWorkspaceId) {
        state.activeWorkspaceId = action.payload.defaultWorkspaceId;
        localStorage.setItem('worksync_workspace_id', action.payload.defaultWorkspaceId);
      }
      localStorage.setItem('worksync_access_token', action.payload.accessToken);
      localStorage.setItem('worksync_refresh_token', action.payload.refreshToken);
      localStorage.setItem('worksync_user', JSON.stringify(action.payload.user));
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('worksync_access_token');
      localStorage.removeItem('worksync_refresh_token');
      localStorage.removeItem('worksync_user');
    });
  },
});

export const { setActiveWorkspace, updateUserProfile, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
