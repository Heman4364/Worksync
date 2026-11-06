import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchTeams = createAsyncThunk('teams/fetchTeams', async (workspaceId, { rejectWithValue }) => {
  try {
    const res = await api.get(`/teams?workspaceId=${workspaceId}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch teams');
  }
});

export const createTeam = createAsyncThunk('teams/createTeam', async (teamData, { rejectWithValue }) => {
  try {
    const res = await api.post('/teams', teamData);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to create team');
  }
});

export const fetchTeamMembers = createAsyncThunk('teams/fetchMembers', async (teamId, { rejectWithValue }) => {
  try {
    const res = await api.get(`/teams/${teamId}/members`);
    return { teamId, members: res.data };
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch team members');
  }
});

const teamSlice = createSlice({
  name: 'teams',
  initialState: {
    teams: [],
    members: {}, // teamId -> array of members
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // Fetch
    builder.addCase(fetchTeams.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTeams.fulfilled, (state, action) => {
      state.loading = false;
      state.teams = action.payload;
    });
    builder.addCase(fetchTeams.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Create
    builder.addCase(createTeam.fulfilled, (state, action) => {
      state.teams.push(action.payload);
    });

    // Members
    builder.addCase(fetchTeamMembers.fulfilled, (state, action) => {
      state.members[action.payload.teamId] = action.payload.members;
    });
  },
});

export default teamSlice.reducer;
