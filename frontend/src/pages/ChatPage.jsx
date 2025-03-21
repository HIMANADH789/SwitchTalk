import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import io from "socket.io-client";
import { useSelector } from "react-redux";
import { TextField, Button, Typography } from "@mui/material";

const socket = io(import.meta.env.VITE_BACKEND_URL, {
    withCredentials: true,
    transports: ["websocket", "polling"]
});


function ChatPage() {
    const friendId = useSelector((state) => state.mode.friendId);
    const mode = useSelector((state) => state.mode.selectedMode);

    const [chats, setChats] = useState([]);
    const [user, setUser] = useState(null);
    const [friend, setFriend] = useState(null);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!friendId) return;

        const fetchChats = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/chat/showChats`, {
                    params: { friendId, mode },
                    withCredentials: true,
                });
                setChats(response.data.chats);
                setUser(response.data.user);
                setFriend(response.data.friend);
            } catch (error) {
                console.error("Error fetching chats:", error);
            }
        };

        fetchChats();
    }, [friendId, mode]);

    useEffect(() => {
        if (!user) return;
        socket.emit("registerUser", user._id);

        const handleMessage = (message) => {
            setChats((prevChats) => {
                return prevChats.map((chat) => {
                    if (chat.members.includes(message.senderId) && chat.members.includes(user._id)) {
                        return {
                            ...chat,
                            messages: [...chat.messages, message],
                        };
                    }
                    return chat;
                });
            });
        };

        socket.on("receivePrivateMessage", handleMessage);
        return () => socket.off("receivePrivateMessage", handleMessage);
    }, [user]);

    const sendMessage = () => {
        if (newMessage.trim() === "" || !user || !friend) return;

        const messageData = {
            senderId: user._id,
            receiverId: friend._id,
            text: newMessage,
            mode,
            timestamp: new Date(),
        };

        setChats((prevChats) =>
            prevChats.map((chat) => {
                if (chat.members.includes(user._id) && chat.members.includes(friend._id)) {
                    return { ...chat, messages: [...chat.messages, messageData] };
                }
                return chat;
            })
        );

        socket.emit("sendPrivateMessage", messageData);
        setNewMessage("");

        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    return (
        <div style={{ maxWidth: "500px", margin: "0 auto", padding: "10px", height: "100vh", display: "flex", flexDirection: "column" }}>
            {/* Chat Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #ccc" }}>
                <Typography variant="h6" fontWeight="bold">
                    {friend ? friend.name : "Loading..."}
                </Typography>
            </div>
            <div style={{
                flex: 1,
                overflowY: "auto",
                padding: "10px",
                display: "flex",
                flexDirection: "column",
                gap: "10px"
            }}>
                {chats.map((chat, index) => (
                    chat.messages.map((c, i) => (
                        <div key={i} style={{
                            alignSelf: c.senderId === user?._id ? "flex-end" : "flex-start",
                            backgroundColor: c.senderId === user?._id ? "#007AFF" : "#f1f1f1",
                            color: c.senderId === user?._id ? "#fff" : "#000",
                            padding: "8px 12px",
                            borderRadius: "18px",
                            maxWidth: "70%",
                            wordBreak: "break-word"
                        }}>
                            <Typography variant="body2">
                                {c.text}
                            </Typography>
                        </div>
                    ))
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} style={{
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
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
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

export default ChatPage;
