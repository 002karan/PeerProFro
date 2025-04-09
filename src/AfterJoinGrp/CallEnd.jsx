import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchUserProfile } from "../Features/counter/getProfile";
import { removeUserFromGroup, resetGroupState } from '../Features/counter/callEndSlice';
import { setFalse } from "../Features/counter/toggleConnectUsers";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CallEnd() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profile } = useSelector((state) => state.user);
  const { loading, success, error, group, user } = useSelector((state) => state.callEndSlice);
  const isCallEnd = useSelector((state) => state.connectedUsers.isCallEnd);
  const groupId = useSelector((state) => state.passingGroupId.groupId);
  const userId = profile?.user?._id;

  // Debug initial state
  useEffect(() => {
    console.log("Initial state:", { isCallEnd, groupId, userId });
  }, [isCallEnd, groupId, userId]);

  // Fetch user profile on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !profile) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, profile]);

  // Dispatch removeUserFromGroup when isCallEnd becomes true
  useEffect(() => {
    if (isCallEnd && groupId && userId) {
      const groupIdStr = groupId.toString();
      const userIdStr = userId.toString();
      console.log(`Call ended. Removing user ${userIdStr} from group ${groupIdStr}`);
      dispatch(removeUserFromGroup({ groupId: groupIdStr, userId: userIdStr }))
        .unwrap()
        .then(() => {
          toast.success('User removed from group successfully!', {
            onClose: () => {
              dispatch(setFalse('isCallEnd'));
              dispatch(resetGroupState());
              navigate('/'); // Navigate after toast closes
            },
            autoClose: 1000, // Show for 2 seconds
          });
        })
        .catch((err) => {
          console.error('Remove user error:', err);
          toast.error(`Error: ${err || 'Network error'}`, {
            onClose: () => {
              dispatch(setFalse('isCallEnd'));
              dispatch(resetGroupState());
              navigate('/'); // Navigate after toast closes
            },
            autoClose: 1000,
          });
        });
    }
  }, [isCallEnd, groupId, userId, dispatch, navigate]);

  // Handle success/error feedback
  useEffect(() => {
    if (success) {
      console.log('Success:', { group, user });
      dispatch(resetGroupState());
    }
    if (error) {
      console.error('Error:', error);
      dispatch(resetGroupState());
    }
  }, [success, error, group, user, dispatch]);

  return <ToastContainer />;
}