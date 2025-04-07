import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import { fetchUserProfile } from "../Features/counter/getProfile";
import { addUserToGroup } from "../Features/counter/connectedUsersSlice";
import { setTrue } from "../Features/counter/toggleConnectUsers";
import { setOwnerId, setGroupId } from "../Features/counter/passingGroupId";
import { X } from "lucide-react";
import { createGroup, joinPrivateGroup } from "../Features/counter/createGroup";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const socket = io(import.meta.env.VITE_SERVER_BASE_URL, { transports: ["websocket"] });

const CreateGroup = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isGroupIdOpen, setIsGroupIdOpen] = useState(false);
  const [createdGroupId, setCreatedGroupId] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("");
  const [groupType, setGroupType] = useState("");
  const [numberOfMembers, setNumberOfMembers] = useState("");
  const [password, setPassword] = useState("");
  const [joinGroupId, setJoinGroupId] = useState("");
  const [joinPassword, setJoinPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { profile } = useSelector((state) => state.user);
  const ownerId = profile?.user?._id;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const toggleCreatePopup = () => {
    setIsCreateOpen(!isCreateOpen);
    if (isCreateOpen) {
      setTopic("");
      setLanguage("");
      setGroupType("");
      setNumberOfMembers("");
      setPassword("");
    }
  };

  const toggleJoinPopup = () => {
    setIsJoinOpen(!isJoinOpen);
    if (isJoinOpen) {
      setJoinGroupId("");
      setJoinPassword("");
      setConfirmPassword("");
    }
  };

  const toggleGroupIdPopup = () => {
    setIsGroupIdOpen(!isGroupIdOpen);
    if (isGroupIdOpen) {
      setCreatedGroupId("");
      setIsCopied(false);
    }
  };

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!topic || !language || !groupType || (groupType === "public" && !numberOfMembers) || (groupType === "private" && !password)) {
      toast.error("Please fill all required fields");
      return;
    }

    const groupData = {
      Topic: topic,
      Language: language,
      GroupType: groupType,
      ...(groupType === "public" && { NumberOfMembers: parseInt(numberOfMembers) }),
      ...(groupType === "private" && { Password: password }),
    };

    try {
      const response = await dispatch(createGroup(groupData)).unwrap();
      console.log(`✅ ${groupType === "private" ? "Private" : "Public"} group created successfully:`, response);
      toast.success(`${groupType === "private" ? "Private" : "Public"} group created successfully!`, {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      if (groupType === "private") {
        setCreatedGroupId(response._id);
        setIsGroupIdOpen(true);
      }

      dispatch(setOwnerId(ownerId));
      toggleCreatePopup();
    } catch (err) {
      console.error("❌ Failed to create group:", err);
      toast.error("Failed to create group. Please try again.");
    }
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    if (!joinGroupId || !joinPassword || !confirmPassword) {
      toast.error("Please enter group ID, password, and confirmation");
      return;
    }
    if (joinPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const response = await dispatch(joinPrivateGroup({ groupId: joinGroupId, password: joinPassword })).unwrap();
      console.log("✅ Successfully joined private group:", response);
      toast.success("Successfully joined private group!", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Dispatch groupId and join group logic
      if (profile && profile.user && profile.user._id && joinGroupId) {
        console.log("groupID", joinGroupId);
        dispatch(setGroupId(joinGroupId));
        dispatch(addUserToGroup({ groupId: joinGroupId, userId: profile.user._id }));
        socket.emit("joinGroup", { groupId: joinGroupId, username: profile.user.name });
        dispatch(setTrue("isUserJoinedCall"));
      }

      toggleJoinPopup();
      navigate("/home");
    } catch (err) {
      console.error("❌ Failed to join group:", err);
      toast.error(err || "Failed to join group. Check group ID and password.");
    }
  };

  const copyGroupIdToClipboard = () => {
    navigator.clipboard.writeText(createdGroupId)
      .then(() => {
        setIsCopied(true);
        toast.success("Group ID copied to clipboard!");
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => toast.error("Failed to copy Group ID"));
  };

  return (
    <>
      <div className="flex fixed top-[70px] ">
        <button
          className="bg-[#2D2F2B] text-white h-10 w-auto px-4 py-2 rounded-[15px] flex justify-center items-center ml-4 text-sm md:text-base whitespace-nowrap"
          onClick={toggleCreatePopup}
        >
          + Create Your Group
        </button>

        <button
          className="bg-[#2D2F2B] text-white h-10 w-auto px-4 py-2 rounded-[15px] flex justify-center items-center ml-4 text-sm md:text-base whitespace-nowrap"
          onClick={toggleJoinPopup}
        >
          + Join Private Group
        </button>
      </div>

      <ToastContainer />

      {/* Create Group Overlay */}
      <AnimatePresence>
        {isCreateOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {/* Create Group Popup */}
      <AnimatePresence>
        {isCreateOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative bg-[#2D2F2B] p-6 rounded-[15px] w-full max-w-md shadow-lg transform transition-transform duration-300 ease-in-out scale-100 md:scale-90 sm:scale-75 text-white"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <button
                className="absolute top-3 right-3 bg-transparent border-none text-gray-300 hover:text-gray-500 focus:outline-none"
                onClick={toggleCreatePopup}
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-xl font-bold mb-4">Create Your Group</h2>
              <form onSubmit={handleCreateSubmit}>
                <input
                  type="text"
                  placeholder="Topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full p-2 mb-4 border border-gray-300 rounded bg-white text-black"
                  required
                />
                <input
                  type="text"
                  placeholder="Language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-2 mb-4 border border-gray-300 rounded bg-white text-black"
                  required
                />
                <div className="mb-4">
                  <label htmlFor="groupType" className="block text-sm font-medium mb-1">
                    Group Type
                  </label>
                  <select
                    id="groupType"
                    value={groupType}
                    onChange={(e) => setGroupType(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                    required
                  >
                    <option value="" disabled>
                      Select group type
                    </option>
                    <option value="public">Public Group</option>
                    <option value="private">Private Group</option>
                  </select>
                </div>
                {groupType === "public" && (
                  <div className="mb-4">
                    <label htmlFor="numberOfMembers" className="block text-sm font-medium mb-1">
                      Number of Members
                    </label>
                    <select
                      id="numberOfMembers"
                      value={numberOfMembers}
                      onChange={(e) => setNumberOfMembers(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                      required
                    >
                      <option value="" disabled>
                        Select number of members
                      </option>
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                        <option key={num} value={num}>
                          {num}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {groupType === "private" && (
                  <div className="mb-4">
                    <label htmlFor="password" className="block text-sm font-medium mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                      required
                    />
                  </div>
                )}
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="bg-[#4A4A4A] text-white px-4 py-2 rounded-[20px] w-full"
                  >
                    Create Group
                  </button>
                  <button
                    type="button"
                    className="bg-gray-500 text-white px-4 py-2 rounded-[20px] w-full"
                    onClick={toggleCreatePopup}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Join Private Group Overlay */}
      <AnimatePresence>
        {isJoinOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {/* Join Private Group Popup */}
      <AnimatePresence>
        {isJoinOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative bg-[#2D2F2B] p-6 rounded-[15px] w-full max-w-md shadow-lg transform transition-transform duration-300 ease-in-out scale-100 md:scale-90 sm:scale-75 text-white"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <button
                className="absolute top-3 right-3 bg-transparent border-none text-gray-300 hover:text-gray-500 focus:outline-none"
                onClick={toggleJoinPopup}
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-xl font-bold mb-4">Join Private Group</h2>
              <form onSubmit={handleJoinSubmit}>
                <div className="mb-4">
                  <label htmlFor="joinGroupId" className="block text-sm font-medium mb-1">
                    Group ID
                  </label>
                  <input
                    type="text"
                    id="joinGroupId"
                    placeholder="Enter group ID"
                    value={joinGroupId}
                    onChange={(e) => setJoinGroupId(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="joinPassword" className="block text-sm font-medium mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    id="joinPassword"
                    placeholder="Enter password"
                    value={joinPassword}
                    onChange={(e) => setJoinPassword(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                    required
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="bg-[#4A4A4A] text-white px-4 py-2 rounded-[20px] w-full"
                  >
                    Join Group
                  </button>
                  <button
                    type="button"
                    className="bg-gray-500 text-white px-4 py-2 rounded-[20px] w-full"
                    onClick={toggleJoinPopup}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Group ID Popup */}
      <AnimatePresence>
        {isGroupIdOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isGroupIdOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative bg-[#2D2F2B] p-6 rounded-[15px] w-full max-w-md shadow-lg transform transition-transform duration-300 ease-in-out scale-100 md:scale-90 sm:scale-75 text-white"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <button
                className="absolute top-3 right-3 bg-transparent border-none text-gray-300 hover:text-gray-500 focus:outline-none"
                onClick={toggleGroupIdPopup}
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-xl font-bold mb-4">Private Group Created</h2>
              <p className="mb-4">Share this ID with others to join:</p>
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  value={createdGroupId}
                  readOnly
                  className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                />
                <button
                  type="button"
                  onClick={copyGroupIdToClipboard}
                  className={`px-4 py-2 rounded-[20px] text-white ${isCopied ? "bg-green-500" : "bg-[#4A4A4A]"}`}
                >
                  {isCopied ? "Copied" : "Copy"}
                </button>
              </div>
              <button
                type="button"
                className="mt-4 bg-gray-500 text-white px-4 py-2 rounded-[20px] w-full"
                onClick={toggleGroupIdPopup}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CreateGroup;