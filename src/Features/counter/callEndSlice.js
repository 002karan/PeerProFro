import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to remove user from group
export const removeUserFromGroup = createAsyncThunk(
  'group/removeUserFromGroup',
  async ({ groupId, userId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_BASE_URL}/user/v1/removeUser`, // Adjust if it should be /user/v1/removeUser
        { groupId, userId },
        { headers: { 'Content-Type': 'application/json' } }
      );
      return response.data; // Expecting { message, group, user }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const groupSlice = createSlice({
  name: 'group',
  initialState: {
    loading: false,
    success: false,
    error: null,
    group: null, // Store updated group data if needed
    user: null,  // Store updated user data if needed
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
        state.success = false;
        state.error = null;
      })
      .addCase(removeUserFromGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.group = action.payload.group; // Updated group data
        state.user = action.payload.user;   // Updated user data
      })
      .addCase(removeUserFromGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong';
      });
  },
});

export const { resetGroupState } = groupSlice.actions;
export default groupSlice.reducer;