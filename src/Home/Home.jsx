import React, { useEffect,useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGroups } from '../Features/counter/createGroup';
import { io } from "socket.io-client";
import Navbar from '../Navbar/Navbar';
import Card from '../GroupCard/Card';
import CreateGroup from '../Navbar/CreateGroupBtn';
import SearchBar from '../Navbar/Search';


const socket = io(import.meta.env.VITE_SERVER_BASE_URL,{
    transports: ['websocket', 'polling'],
    withCredentials: true,// Ensure WebSocket is attempted first
  });

export default function Home() {
    const dispatch = useDispatch();
    const groupsState = useSelector((state) => state.group);
    const searchTerm = useSelector((state) => state.searchbar.searchTerm)
    const [filteredGroups, setFilteredGroups] = useState([]);



    // ✅ Fetch groups when component mounts
    useEffect(() => {
        dispatch(fetchGroups());
    }, [dispatch]);

    useEffect(() => {
        let filtered;
        const lowerCaseSearch = searchTerm.toLowerCase();

        // Start with only public groups
        const publicGroups = groupsState.groups.filter(group => group.GroupType === "public");

        // Show all public groups if searchTerm is empty or less than 2 characters
        if (!searchTerm || searchTerm.length < 2) {
            filtered = publicGroups;
        } else {
            // Filter public groups by topic when searchTerm has 2 or more characters
            filtered = publicGroups.filter(group =>
                group.Topic.toLowerCase().includes(lowerCaseSearch)
            );
        }
        setFilteredGroups(filtered);
    }, [groupsState.groups, searchTerm]);


    // ✅ Handle real-time socket events
    useEffect(() => {
        socket.on("connect", () => {
            console.log("✅ Connected to Socket.IO Server!", socket.id);
        });

        socket.on("newGroup", (newGroup) => {
            console.log("📢 New Group Created:", newGroup);
            dispatch(fetchGroups()); // Fetch latest groups
        });


        socket.on("userJoined", ({ groupId, userId }) => {
            console.log(`📌 User ${userId} joined group ${groupId}, fetching updated groups...`);
            dispatch(fetchGroups());
        });


        socket.on("userRemoved", ({ userId, groupId }) => {
            console.log(`❌ User ${userId} left group ${groupId}, fetching updated groups...`);
            dispatch(fetchGroups());
        });

        // Cleanup listeners on component unmount
        return () => {
            socket.off("newGroup");
            socket.off("userJoined");
            socket.off("userRemoved");
        };
    }, [dispatch]); // ✅ No `groupsState.groups` dependency here

    return (
        <div>
            <Navbar />

            <CreateGroup />
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-x-1 gap-y-6 px-22 relative top-[100px]">
                {filteredGroups.slice().reverse().map((group, index) => {
                    const members = group.connectedUsers.map(user => ({
                        initial: user.name.charAt(0).toUpperCase(),
                        name: user.name
                    }));

                    return (
                        <Card
                            key={index}
                            uniqueId={group._id}
                            language={group.Language}
                            topic={group.Topic}
                            members={members}
                            NumberOfMembers={group.NumberOfMembers}
                        />
                    );
                })}
            </div>
        </div>
    );
}
