import React, { useEffect,useState} from 'react';
import SlideBar from './SlideBar';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserProfile } from "../Features/counter/getProfile";
import { submitReview, fetchReviews, resetReviewState } from '../Features/counter/reviewSlice';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ReviewComponent() {
  const dispatch = useDispatch();
  const { profile } = useSelector((state) => state.user);
  const username = profile?.user?.name || ''; // Default to empty string if undefined
  const { loading, success, error, reviews, fetchLoading, fetchError } = useSelector((state) => state.ReviewReducer);

  const [email, setEmail] = useState('');
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(0); // State for star rating

  // Fetch user profile
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch]);

  // Fetch reviews on mount
  useEffect(() => {
    dispatch(fetchReviews());
  }, [dispatch]);

  // Handle success/error from review submission and refresh reviews
  useEffect(() => {
    if (success) {
      toast.success('Review submitted successfully!');
      dispatch(resetReviewState());
      dispatch(fetchReviews()); // Refresh reviews after submission
    }
    if (error) {
      const errorMessage = typeof error === 'object' && error.message ? error.message : error;
      toast.error(`Error: ${errorMessage}`);
      dispatch(resetReviewState());
    }
    if (fetchError) {
      const fetchErrorMessage = typeof fetchError === 'object' && fetchError.message ? fetchError.message : fetchError;
      toast.error(`Error fetching reviews: ${fetchErrorMessage}`);
    }
  }, [success, error, fetchError, dispatch]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    const reviewData = {
      name: username || 'Anonymous',
      email: email,
      review: review,
      rating: rating,
    };

    dispatch(submitReview(reviewData))
      .unwrap()
      .then(() => {
        // Reset form on success
        setEmail('');
        setReview('');
        setRating(0);
      })
      .catch((err) => {
        console.log('Review submission failed:', err);
      });
  };

  // Sort reviews by createdAt (newest first)
  const sortedReviews = [...reviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Star rating component
  const StarRating = ({ rating, setRating = null, readOnly = false }) => {
    const stars = [1, 2, 3, 4, 5];
    return (
      <div className="flex space-x-1">
        {stars.map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 cursor-${readOnly ? 'default' : 'pointer'} ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-400'
            }`}
            onClick={!readOnly ? () => setRating(star) : undefined}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <>
      <SlideBar />
      <div className="max-w-4xl mx-auto p-4 bg-gray-800">
        {/* Review Submission Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-[#5f83f5]">Submit Your Review</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-white text-white"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="review" className="block text-sm font-medium text-white mb-1">
                Review
              </label>
              <textarea
                id="review"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-white text-white"
                rows="4"
                placeholder="Write your review here"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Rating
              </label>
              <StarRating rating={rating} setRating={setRating} />
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </section>

        {/* Reviews Display Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-white">Customer Reviews</h2>
          {fetchLoading ? (
            <p className="text-gray-600">Loading reviews...</p>
          ) : fetchError ? (
            <p className="text-red-600">Failed to load reviews: {fetchError}</p>
          ) : sortedReviews.length === 0 ? (
            <p className="text-gray-600">No reviews yet. Be the first to submit one!</p>
          ) : (
            <div
              className="space-y-6 h-96 overflow-y-auto pr-2"
              style={{ scrollbarWidth: 'thin' }}
            >
              {sortedReviews.map((reviewItem) => (
                <div
                  key={reviewItem._id} // Use MongoDB _id
                  className="border border-gray-200 rounded-md p-4 bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <h3 className="text-lg font-semibold text-white">{reviewItem.name}</h3>
                  <p className="text-sm text-white mt-1">{reviewItem.review}</p>
                  <div className="mt-2">
                    <StarRating rating={reviewItem.rating} readOnly={true} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      <ToastContainer />
    </>
  );
}