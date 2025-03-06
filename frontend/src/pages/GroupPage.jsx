import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { setType } from "../redux/postSlice";
import { TextField, Button, Typography } from "@mui/material";

const socket = io("http://localhost:3000", { withCredentials: true });

function GroupPage() {
    const dispatch = useDispatch();
    const groupId = useSelector((state) => state.mode.groupId);
    console.log(groupId);
    const mode = useSelector((state) => state.mode.selectedMode);

    const [messages, setMessages] = useState([]);
    const [group, setGroup] = useState(null);
    const [user, setUser] = useState(null);
    const [text, setText] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (!groupId) return;

        const fetchGroupChats = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/group/messages`, {
                    params: { groupId },
                    withCredentials: true
                });

                setMessages(response.data.messages);
                setGroup(response.data.group);
                setUser(response.data.user);
                setIsAdmin(response.data.isAdmin);
            } catch (error) {
                console.error("Error fetching group chats:", error);
            }
        };

        fetchGroupChats();
    }, [groupId]);

    useEffect(() => {
        if (!user || !groupId) return;

        socket.emit("registerUser", user._id);
        socket.emit("joinGroup", groupId);

        return () => {
            socket.off("receiveGroupMessage");
        };
    }, [user, groupId]);

    useEffect(() => {
        if (!groupId) return;

        const handleMessage = (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        };

        socket.on("receiveGroupMessage", handleMessage);

        return () => {
            socket.off("receiveGroupMessage", handleMessage);
        };
    }, [groupId]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (text.trim()) {
            const messageData = { groupId, senderId: user?._id, text };

            setMessages((prevMessages) => [...prevMessages, messageData]);

            socket.emit("sendGroupMessage", messageData);
            setText("");
        }
    };

    return (
        <div style={{ maxWidth: "500px", margin: "0 auto", padding: "10px", height: "100vh", display: "flex", flexDirection: "column" }}>
            {/* Group Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #ccc" }}>
                <Typography variant="h6" fontWeight="bold">
                    {group ? group.name : "Loading..."}
                </Typography>
                <div style={{ display: "flex", gap: "10px" }}>
                    <Link to="/search-group-request" style={{ textDecoration: "none" }}>
                        <Button variant="text">🔍</Button>
                    </Link>
                    {isAdmin && (
                        <Link to="/create-post" onClick={() => dispatch(setType("group"))} style={{ textDecoration: "none" }}>
                            <Button variant="text">➕</Button>
                        </Link>
                    )}
                    <Link to="/create-room" state={{ groupId }}>
    <Button variant="text">🎥</Button>
</Link>

                </div>
            </div>

            {/* Chat Messages */}
            <div style={{
                flex: 1,
                overflowY: "auto",
                padding: "10px",
                display: "flex",
                flexDirection: "column",
                gap: "10px"
            }}>
                {messages.map((msg, index) => (
                    <div key={index} style={{
                        alignSelf: msg.senderId === user?._id ? "flex-end" : "flex-start",
                        backgroundColor: msg.senderId === user?._id ? "#007AFF" : "#f1f1f1",
                        color: msg.senderId === user?._id ? "#fff" : "#000",
                        padding: "8px 12px",
                        borderRadius: "18px",
                        maxWidth: "70%",
                        wordBreak: "break-word"
                    }}>
                        <Typography variant="body2">
                            {msg.text}
                        </Typography>
                        {msg.post?.image && <img src={msg.post.image} alt="Post" style={{ width: "100%", marginTop: "5px", borderRadius: "10px" }} />}
                    </div>
                ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={sendMessage} style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px",
                borderTop: "1px solid #ccc"
            }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Message..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    InputProps={{ style: { borderRadius: "20px", padding: "5px 10px" } }}
                />
                <Button variant="contained" type="submit" style={{
                    backgroundColor: "#007AFF",
                    color: "#fff",
                    borderRadius: "50%",
                    minWidth: "40px",
                    height: "40px"
                }}>
                    📩
                </Button>
            </form>
        </div>
    );
}

export default GroupPage;
