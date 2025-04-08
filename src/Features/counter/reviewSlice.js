// src/redux/slices/reviewSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to send review
export const submitReview = createAsyncThunk(
  'review/submitReview',
  async ({ name, email, review, rating }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_SERVER_BASE_URL}/user/v1/review`, {
        name,
        email,
        review,
        rating,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk to fetch reviews
export const fetchReviews = createAsyncThunk(
  'review/fetchReviews',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_SERVER_BASE_URL}/user/v1/getReviews`);
      console.log("response",response)
      return response.data.reviews; // Return the reviews array directly
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const reviewSlice = createSlice({
  name: 'review',
  initialState: {
    loading: false,
    success: false,
    error: null,
    reviews: [], // Add reviews array to state
    fetchLoading: false, // Separate loading state for fetching reviews
    fetchError: null, // Separate error state for fetching reviews
  },
  reducers: {
    resetReviewState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Submit Review Cases
    builder
      .addCase(submitReview.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(submitReview.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong';
      })
      // Fetch Reviews Cases
      .addCase(fetchReviews.pending, (state) => {
        state.fetchLoading = true;
        state.fetchError = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.fetchLoading = false;
        state.reviews = action.payload; // Store fetched reviews
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.fetchLoading = false;
        state.fetchError = action.payload || 'Something went wrong';
      });
  },
});

export const { resetReviewState } = reviewSlice.actions;
export default reviewSlice.reducer;