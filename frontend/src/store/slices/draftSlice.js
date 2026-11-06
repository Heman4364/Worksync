import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import api from '../../services/api';

export const draftAdapter = createEntityAdapter({
  selectId: (draft) => draft.id,
  sortComparer: (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt),
});

export const fetchDrafts = createAsyncThunk(
  'drafts/fetchDrafts',
  async ({ workspaceId, platform = '', query = '', page = 0, size = 15 }, { rejectWithValue }) => {
    try {
      let url = `/drafts?workspaceId=${workspaceId}&page=${page}&size=${size}`;
      if (platform && platform !== 'ALL') url += `&platform=${platform}`;
      if (query) url += `&query=${encodeURIComponent(query)}`;

      const res = await api.get(url);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch drafts');
    }
  }
);

export const createDraft = createAsyncThunk('drafts/createDraft', async (draftData, { rejectWithValue }) => {
  try {
    const res = await api.post('/drafts', draftData);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to save draft');
  }
});

export const updateDraft = createAsyncThunk('drafts/updateDraft', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/drafts/${id}`, data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to update draft');
  }
});

export const deleteDraft = createAsyncThunk('drafts/deleteDraft', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/drafts/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to delete draft');
  }
});

const draftSlice = createSlice({
  name: 'drafts',
  initialState: draftAdapter.getInitialState({
    loading: false,
    error: null,
    searchQuery: '',
    selectedPlatform: 'ALL',
    activeDraft: null,
  }),
  reducers: {
    setDraftSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setDraftSelectedPlatform: (state, action) => {
      state.selectedPlatform = action.payload;
    },
    setActiveDraft: (state, action) => {
      state.activeDraft = action.payload;
    },
    clearActiveDraft: (state) => {
      state.activeDraft = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch
    builder.addCase(fetchDrafts.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchDrafts.fulfilled, (state, action) => {
      state.loading = false;
      draftAdapter.setAll(state, action.payload.content || action.payload);
    });
    builder.addCase(fetchDrafts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Create
    builder.addCase(createDraft.fulfilled, (state, action) => {
      draftAdapter.addOne(state, action.payload);
    });

    // Update
    builder.addCase(updateDraft.fulfilled, (state, action) => {
      draftAdapter.upsertOne(state, action.payload);
    });

    // Delete
    builder.addCase(deleteDraft.fulfilled, (state, action) => {
      draftAdapter.removeOne(state, action.payload);
    });
  },
});

export const { setDraftSearchQuery, setDraftSelectedPlatform, setActiveDraft, clearActiveDraft } = draftSlice.actions;

export const {
  selectAll: selectAllDrafts,
  selectById: selectDraftById,
  selectIds: selectDraftIds,
} = draftAdapter.getSelectors((state) => state.drafts);

export default draftSlice.reducer;
