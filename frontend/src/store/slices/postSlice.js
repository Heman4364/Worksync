import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const validatePostStrategy = createAsyncThunk(
  'posts/validateStrategy',
  async ({ platform, content, mediaUrls }, { rejectWithValue }) => {
    try {
      const res = await api.post('/posts/validate', { platform, content, mediaUrls });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Validation failed');
    }
  }
);

export const createPost = createAsyncThunk('posts/createPost', async (postData, { rejectWithValue }) => {
  try {
    const res = await api.post('/posts', postData);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to submit post');
  }
});

export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async ({ workspaceId, page = 0, size = 15 }, { rejectWithValue }) => {
    try {
      const res = await api.get(`/posts?workspaceId=${workspaceId}&page=${page}&size=${size}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch posts');
    }
  }
);

const initialState = {
  posts: [],
  selectedPlatform: 'INSTAGRAM',
  content: '',
  mediaUrls: '',
  scheduledAt: '',
  simulationMode: 'NONE',
  validation: {
    valid: true,
    characterCount: 0,
    maxCharacters: 2200,
    errors: [],
    warnings: [],
    loading: false,
  },
  loading: false,
  error: null,
  successMessage: null,
};

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setSelectedPlatform: (state, action) => {
      state.selectedPlatform = action.payload;
      if (action.payload === 'INSTAGRAM') state.validation.maxCharacters = 2200;
      else if (action.payload === 'LINKEDIN') state.validation.maxCharacters = 3000;
      else if (action.payload === 'X') state.validation.maxCharacters = 280;
    },
    setContent: (state, action) => {
      state.content = action.payload;
    },
    setMediaUrls: (state, action) => {
      state.mediaUrls = action.payload;
    },
    setScheduledAt: (state, action) => {
      state.scheduledAt = action.payload;
    },
    setSimulationMode: (state, action) => {
      state.simulationMode = action.payload;
    },
    clearPostForm: (state) => {
      state.content = '';
      state.mediaUrls = '';
      state.scheduledAt = '';
      state.validation = {
        valid: true,
        characterCount: 0,
        maxCharacters: state.selectedPlatform === 'X' ? 280 : state.selectedPlatform === 'LINKEDIN' ? 3000 : 2200,
        errors: [],
        warnings: [],
        loading: false,
      };
      state.successMessage = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // Validate Strategy
    builder.addCase(validatePostStrategy.pending, (state) => {
      state.validation.loading = true;
    });
    builder.addCase(validatePostStrategy.fulfilled, (state, action) => {
      state.validation = {
        ...action.payload,
        loading: false,
      };
    });
    builder.addCase(validatePostStrategy.rejected, (state) => {
      state.validation.loading = false;
    });

    // Create post
    builder.addCase(createPost.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.successMessage = null;
    });
    builder.addCase(createPost.fulfilled, (state, action) => {
      state.loading = false;
      state.posts.unshift(action.payload);
      state.successMessage = 'Post submitted successfully to queue!';
      state.content = '';
      state.mediaUrls = '';
      state.scheduledAt = '';
    });
    builder.addCase(createPost.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Fetch posts
    builder.addCase(fetchPosts.fulfilled, (state, action) => {
      state.posts = action.payload.content || action.payload;
    });
  },
});

export const {
  setSelectedPlatform,
  setContent,
  setMediaUrls,
  setScheduledAt,
  setSimulationMode,
  clearPostForm,
  clearSuccessMessage,
} = postSlice.actions;

export default postSlice.reducer;
