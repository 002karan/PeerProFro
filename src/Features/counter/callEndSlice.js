import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to remove user from group
export const removeUserFromGroup = createAsyncThunk(
  'callEnd/removeUserFromGroup', // Updated namespace to callEnd
  async ({ groupId, userId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_BASE_URL}/user/v1/removeUser`,
        { groupId: groupId.toString(), userId: userId.toString() }, // Ensure strings
        { headers: { 'Content-Type': 'application/json' } }
      );
      return response.data; // { success: true, groupId, userId }
    } catch (error) {
      console.error('API Error:', error);
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const callEndSlice = createSlice({
  name: 'callEnd',
  initialState: {
    loading: false,
    success: false,
    error: null,
    group: null, // Matches CallEnd's expected state
    user: null,  // Matches CallEnd's expected state
  },
  reducers: {
    resetGroupState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.group = null;
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(removeUserFromGroup.pending, (state) => {
        state.loading = true;
        state.success = false; // Fixed typo from earlier
        state.error = null;
      })
      .addCase(removeUserFromGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.group = action.payload.groupId; // Map groupId to group
        state.user = action.payload.userId;   // Map userId to user
      })
      .addCase(removeUserFromGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Network error';
      });
  },
});

export const { resetGroupState } = callEndSlice.actions;
export default callEndSlice.reducer;