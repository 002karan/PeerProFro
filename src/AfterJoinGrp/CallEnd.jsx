import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { fetchUserProfile } from "../Features/counter/getProfile";
import { removeUserFromGroup, resetGroupState } from '../Features/counter/callEndSlice';
import { toggleState, setTrue, setFalse } from "../Features/counter/toggleConnectUsers";
import { ToastContainer, toast } from "react-toastify"; // Optional: for feedback
import "react-toastify/dist/ReactToastify.css";

export default function CallEnd() {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Hook for navigation
  const { profile } = useSelector((state) => state.user);
  const { loading, success, error, group, user } = useSelector((state) => state.callEndSlice);
  const isCallEnd = useSelector((state) => state.connectedUsers.isCallEnd);
  const groupId = useSelector((state) => state.passingGroupId.groupId);
  const userId = profile?.user?._id; // Renamed to userId for clarity

  console.log("userId",groupId)

  // Fetch user profile on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch]);

  // Dispatch removeUserFromGroup when isCallEnd becomes true
  useEffect(() => {
    if (isCallEnd && groupId && userId) {
      console.log(`Call ended. Removing user ${userId} from group ${groupId}`);
      dispatch(removeUserFromGroup({ groupId, userId }))
        .unwrap() // Unwrap to handle promise directly
        .then(() => {
          toast.success('User removed from group successfully!');
          dispatch(setFalse('isCallEnd')) // Optional feedback
          navigate('/'); // Navigate to home route
        })
        .catch((err) => {
          toast.error(`Error: ${err.message || err}`); // Optional error feedback
          navigate('/'); // Navigate even on error (optional, adjust as needed)
        });
    }
  }, [isCallEnd, groupId, userId, dispatch, navigate]);

  // Handle success/error feedback (optional)
  useEffect(() => {
    if (success) {
      console.log('Success:', { group, user });
      dispatch(resetGroupState()); // Reset state after success
    }
    if (error) {
      console.error('Error:', error);
      dispatch(resetGroupState()); // Reset state after error
    }
  }, [success, error, dispatch]);

  return null
}