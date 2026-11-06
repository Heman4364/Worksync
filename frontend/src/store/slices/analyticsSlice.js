import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchDashboardAnalytics = createAsyncThunk(
  'analytics/fetchDashboard',
  async (workspaceId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/analytics/dashboard?workspaceId=${workspaceId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch analytics');
    }
  }
);

const initialState = {
  data: {
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    taskCompletionRate: 0,
    contentPostsCreated: 0,
    scheduledPosts: 0,
    draftCount: 0,
    postsByStatus: {},
    postsByPlatform: {},
    weeklyProductivity: [],
    projectProgressOverview: [],
    recentActivity: [],
    upcomingDeadlines: [],
  },
  loading: false,
  error: null,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchDashboardAnalytics.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchDashboardAnalytics.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
    });
    builder.addCase(fetchDashboardAnalytics.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export default analyticsSlice.reducer;
