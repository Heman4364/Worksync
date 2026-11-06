import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async ({ page = 0, size = 15 } = {}, { rejectWithValue }) => {
    try {
      const res = await api.get(`/notifications?page=${page}&size=${size}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch notifications');
    }
  }
);

export const markNotificationRead = createAsyncThunk('notifications/markRead', async (id, { rejectWithValue }) => {
  try {
    await api.patch(`/notifications/${id}/read`);
    return id;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to mark notification as read');
  }
});

export const markAllNotificationsRead = createAsyncThunk('notifications/markAllRead', async (_, { rejectWithValue }) => {
  try {
    await api.post('/notifications/mark-all-read');
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to mark all as read');
  }
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    // Real-time WebSocket arrival
    receiveNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchNotifications.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      state.loading = false;
      const data = action.payload;
      state.notifications = data.notifications?.content || data.notifications || [];
      state.unreadCount = data.unreadCount || 0;
    });
    builder.addCase(fetchNotifications.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    builder.addCase(markNotificationRead.fulfilled, (state, action) => {
      const notif = state.notifications.find((n) => n.id === action.payload);
      if (notif && !notif.readStatus) {
        notif.readStatus = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    });

    builder.addCase(markAllNotificationsRead.fulfilled, (state) => {
      state.notifications.forEach((n) => {
        n.readStatus = true;
      });
      state.unreadCount = 0;
    });
  },
});

export const { receiveNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
