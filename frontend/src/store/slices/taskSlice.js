import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import api from '../../services/api';

export const taskAdapter = createEntityAdapter({
  selectId: (task) => task.id,
  sortComparer: (a, b) => b.id - a.id,
});

export const fetchKanbanTasks = createAsyncThunk('tasks/fetchKanbanTasks', async (workspaceId, { rejectWithValue }) => {
  try {
    const res = await api.get(`/tasks/kanban?workspaceId=${workspaceId}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to load tasks');
  }
});

export const createTask = createAsyncThunk('tasks/createTask', async (taskData, { rejectWithValue }) => {
  try {
    const res = await api.post('/tasks', taskData);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to create task');
  }
});

export const updateTaskStatus = createAsyncThunk('tasks/updateStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const res = await api.patch(`/tasks/${id}/status`, { status });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to update task status');
  }
});

export const deleteTask = createAsyncThunk('tasks/deleteTask', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/tasks/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to delete task');
  }
});

const taskSlice = createSlice({
  name: 'tasks',
  initialState: taskAdapter.getInitialState({
    loading: false,
    error: null,
    searchQuery: '',
    filterPriority: 'ALL',
    selectedTaskId: null,
    comments: {}, // taskId -> comments array
  }),
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setFilterPriority: (state, action) => {
      state.filterPriority = action.payload;
    },
    setSelectedTaskId: (state, action) => {
      state.selectedTaskId = action.payload;
    },
    // Optimistic drag-and-drop status update
    optimisticStatusChange: (state, action) => {
      const { id, status } = action.payload;
      const existing = state.entities[id];
      if (existing) {
        existing.status = status;
      }
    },
    setTaskComments: (state, action) => {
      const { taskId, comments } = action.payload;
      state.comments[taskId] = comments;
    },
  },
  extraReducers: (builder) => {
    // Fetch
    builder.addCase(fetchKanbanTasks.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchKanbanTasks.fulfilled, (state, action) => {
      state.loading = false;
      taskAdapter.setAll(state, action.payload);
    });
    builder.addCase(fetchKanbanTasks.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Create
    builder.addCase(createTask.fulfilled, (state, action) => {
      taskAdapter.addOne(state, action.payload);
    });

    // Update status
    builder.addCase(updateTaskStatus.fulfilled, (state, action) => {
      taskAdapter.upsertOne(state, action.payload);
    });

    // Delete
    builder.addCase(deleteTask.fulfilled, (state, action) => {
      taskAdapter.removeOne(state, action.payload);
    });
  },
});

export const { setSearchQuery, setFilterPriority, setSelectedTaskId, optimisticStatusChange, setTaskComments } =
  taskSlice.actions;

// Export normalized adapter selectors
export const {
  selectAll: selectAllTasks,
  selectById: selectTaskById,
  selectIds: selectTaskIds,
  selectEntities: selectTaskEntities,
} = taskAdapter.getSelectors((state) => state.tasks);

export default taskSlice.reducer;
