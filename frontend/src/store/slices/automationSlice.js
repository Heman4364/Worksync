import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchAutomations = createAsyncThunk('automations/fetch', async (workspaceId, { rejectWithValue }) => {
  try {
    const res = await api.get(`/automations?workspaceId=${workspaceId}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch automations');
  }
});

export const createAutomation = createAsyncThunk('automations/create', async (ruleData, { rejectWithValue }) => {
  try {
    const res = await api.post('/automations', ruleData);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to create automation rule');
  }
});

export const toggleAutomation = createAsyncThunk('automations/toggle', async (id, { rejectWithValue }) => {
  try {
    const res = await api.patch(`/automations/${id}/toggle`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to toggle rule');
  }
});

const automationSlice = createSlice({
  name: 'automations',
  initialState: {
    rules: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchAutomations.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchAutomations.fulfilled, (state, action) => {
      state.loading = false;
      state.rules = action.payload;
    });
    builder.addCase(fetchAutomations.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    builder.addCase(createAutomation.fulfilled, (state, action) => {
      state.rules.push(action.payload);
    });

    builder.addCase(toggleAutomation.fulfilled, (state, action) => {
      const idx = state.rules.findIndex((r) => r.id === action.payload.id);
      if (idx !== -1) {
        state.rules[idx] = action.payload;
      }
    });
  },
});

export default automationSlice.reducer;
