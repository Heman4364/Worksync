import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import api from '../../services/api';

export const projectAdapter = createEntityAdapter({
  selectId: (proj) => proj.id,
  sortComparer: (a, b) => b.id - a.id,
});

export const fetchProjects = createAsyncThunk('projects/fetchProjects', async ({ workspaceId, page = 0, size = 10 }, { rejectWithValue }) => {
  try {
    const res = await api.get(`/projects?workspaceId=${workspaceId}&page=${page}&size=${size}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch projects');
  }
});

export const createProject = createAsyncThunk('projects/createProject', async (projectData, { rejectWithValue }) => {
  try {
    const res = await api.post('/projects', projectData);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to create project');
  }
});

export const updateProject = createAsyncThunk('projects/updateProject', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/projects/${id}`, data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to update project');
  }
});

export const deleteProject = createAsyncThunk('projects/deleteProject', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/projects/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to delete project');
  }
});

const projectSlice = createSlice({
  name: 'projects',
  initialState: projectAdapter.getInitialState({
    loading: false,
    error: null,
    totalPages: 0,
    totalElements: 0,
    selectedProjectId: null,
  }),
  reducers: {
    setSelectedProjectId: (state, action) => {
      state.selectedProjectId = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch
    builder.addCase(fetchProjects.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProjects.fulfilled, (state, action) => {
      state.loading = false;
      projectAdapter.setAll(state, action.payload.content || action.payload);
      state.totalPages = action.payload.totalPages || 1;
      state.totalElements = action.payload.totalElements || action.payload.length;
    });
    builder.addCase(fetchProjects.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Create
    builder.addCase(createProject.fulfilled, (state, action) => {
      projectAdapter.addOne(state, action.payload);
    });

    // Update
    builder.addCase(updateProject.fulfilled, (state, action) => {
      projectAdapter.upsertOne(state, action.payload);
    });

    // Delete
    builder.addCase(deleteProject.fulfilled, (state, action) => {
      projectAdapter.removeOne(state, action.payload);
    });
  },
});

export const { setSelectedProjectId } = projectSlice.actions;

export const {
  selectAll: selectAllProjects,
  selectById: selectProjectById,
  selectIds: selectProjectIds,
} = projectAdapter.getSelectors((state) => state.projects);

export default projectSlice.reducer;
