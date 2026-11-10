import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const publishKafkaEvent = createAsyncThunk('kafka/publishEvent', async (eventData, { rejectWithValue }) => {
  try {
    const res = await api.post('/events', eventData);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to publish event');
  }
});

export const fetchKafkaEvents = createAsyncThunk('kafka/fetchEvents', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/events?size=25');
    return res.data.content || res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch events');
  }
});

export const fetchDlqRecords = createAsyncThunk('kafka/fetchDlq', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/dlq?size=25');
    return res.data.content || res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch DLQ');
  }
});

export const retryDlqEvent = createAsyncThunk('kafka/retryDlqEvent', async (eventId, { rejectWithValue }) => {
  try {
    const res = await api.post(`/events/${eventId}/retry`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to reprocess DLQ event');
  }
});

export const fetchProcessingLogs = createAsyncThunk('kafka/fetchLogs', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/logs?size=40');
    return res.data.content || res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch processing logs');
  }
});

export const clearProcessingLogs = createAsyncThunk('kafka/clearLogs', async (_, { rejectWithValue }) => {
  try {
    await api.post('/logs/clear');
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to clear logs');
  }
});

export const fetchRetryConfig = createAsyncThunk('kafka/fetchConfig', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/config');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch retry config');
  }
});

export const updateRetryConfig = createAsyncThunk('kafka/updateConfig', async (configData, { rejectWithValue }) => {
  try {
    const res = await api.post('/config', configData);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to update retry config');
  }
});

export const runKafkaTests = createAsyncThunk('kafka/runTests', async (scenario = 'ALL', { rejectWithValue }) => {
  try {
    const res = await api.post('/tests/run', { scenario });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to run automated tests');
  }
});

export const fetchTestReport = createAsyncThunk('kafka/fetchTestReport', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/tests/report');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch test report');
  }
});

const initialState = {
  events: [],
  dlqRecords: [],
  logs: [],
  retryConfig: {
    maxAttempts: 3,
    initialIntervalMs: 2000,
    multiplier: 2.0,
  },
  testReport: null,
  activeTab: 'publisher', // 'publisher' | 'dlq' | 'logs' | 'config' | 'tests'
  loading: false,
  testRunning: false,
  error: null,
};

const kafkaSlice = createSlice({
  name: 'kafka',
  initialState,
  reducers: {
    setActiveKafkaTab: (state, action) => {
      state.activeTab = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Events
    builder.addCase(fetchKafkaEvents.fulfilled, (state, action) => {
      state.events = Array.isArray(action.payload) ? action.payload : [];
    });
    builder.addCase(publishKafkaEvent.fulfilled, (state, action) => {
      if (!action.payload) return;
      const idx = state.events.findIndex(
        (e) => e.id === action.payload.id || e.eventId === action.payload.eventId
      );
      if (idx !== -1) {
        state.events[idx] = action.payload;
      } else {
        state.events.unshift(action.payload);
      }
    });

    // DLQ
    builder.addCase(fetchDlqRecords.fulfilled, (state, action) => {
      state.dlqRecords = Array.isArray(action.payload) ? action.payload : [];
    });
    builder.addCase(retryDlqEvent.fulfilled, (state, action) => {
      const idx = state.dlqRecords.findIndex((d) => d.eventId === action.payload?.eventId);
      if (idx !== -1) {
        state.dlqRecords[idx].reprocessed = true;
      }
    });

    // Logs
    builder.addCase(fetchProcessingLogs.fulfilled, (state, action) => {
      state.logs = Array.isArray(action.payload) ? action.payload : [];
    });
    builder.addCase(clearProcessingLogs.fulfilled, (state) => {
      state.logs = [];
    });

    // Config
    builder.addCase(fetchRetryConfig.fulfilled, (state, action) => {
      state.retryConfig = action.payload;
    });
    builder.addCase(updateRetryConfig.fulfilled, (state, action) => {
      state.retryConfig = action.payload;
    });

    // Tests
    builder.addCase(runKafkaTests.pending, (state) => {
      state.testRunning = true;
    });
    builder.addCase(runKafkaTests.fulfilled, (state, action) => {
      state.testRunning = false;
      state.testReport = action.payload;
    });
    builder.addCase(runKafkaTests.rejected, (state, action) => {
      state.testRunning = false;
      state.error = action.payload;
    });
    builder.addCase(fetchTestReport.fulfilled, (state, action) => {
      state.testReport = action.payload;
    });
  },
});

export const { setActiveKafkaTab } = kafkaSlice.actions;
export default kafkaSlice.reducer;
