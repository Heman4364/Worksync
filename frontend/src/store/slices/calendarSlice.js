import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import api from '../../services/api';

export const calendarAdapter = createEntityAdapter({
  selectId: (evt) => evt.id,
  sortComparer: (a, b) => new Date(a.startTime) - new Date(b.startTime),
});

export const fetchCalendarEvents = createAsyncThunk(
  'calendar/fetchEvents',
  async ({ workspaceId, start, end }, { rejectWithValue }) => {
    try {
      let url = `/calendar/events?workspaceId=${workspaceId}`;
      if (start) url += `&start=${encodeURIComponent(start)}`;
      if (end) url += `&end=${encodeURIComponent(end)}`;

      const res = await api.get(url);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch calendar events');
    }
  }
);

export const createCalendarEvent = createAsyncThunk('calendar/createEvent', async (eventData, { rejectWithValue }) => {
  try {
    const res = await api.post('/calendar/events', eventData);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to create event');
  }
});

export const updateCalendarEvent = createAsyncThunk('calendar/updateEvent', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/calendar/events/${id}`, data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to update event');
  }
});

export const deleteCalendarEvent = createAsyncThunk('calendar/deleteEvent', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/calendar/events/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to delete event');
  }
});

const calendarSlice = createSlice({
  name: 'calendar',
  initialState: calendarAdapter.getInitialState({
    loading: false,
    error: null,
    selectedEventId: null,
  }),
  reducers: {
    setSelectedEventId: (state, action) => {
      state.selectedEventId = action.payload;
    },
    // Optimistic drag-and-drop reschedule
    optimisticReschedule: (state, action) => {
      const { id, startTime, endTime } = action.payload;
      const existing = state.entities[id];
      if (existing) {
        existing.startTime = startTime;
        if (endTime) existing.endTime = endTime;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch
    builder.addCase(fetchCalendarEvents.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCalendarEvents.fulfilled, (state, action) => {
      state.loading = false;
      calendarAdapter.setAll(state, action.payload);
    });
    builder.addCase(fetchCalendarEvents.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Create
    builder.addCase(createCalendarEvent.fulfilled, (state, action) => {
      calendarAdapter.addOne(state, action.payload);
    });

    // Update
    builder.addCase(updateCalendarEvent.fulfilled, (state, action) => {
      calendarAdapter.upsertOne(state, action.payload);
    });

    // Delete
    builder.addCase(deleteCalendarEvent.fulfilled, (state, action) => {
      calendarAdapter.removeOne(state, action.payload);
    });
  },
});

export const { setSelectedEventId, optimisticReschedule } = calendarSlice.actions;

export const {
  selectAll: selectAllCalendarEvents,
  selectById: selectCalendarEventById,
  selectIds: selectCalendarEventIds,
} = calendarAdapter.getSelectors((state) => state.calendar);

export default calendarSlice.reducer;
