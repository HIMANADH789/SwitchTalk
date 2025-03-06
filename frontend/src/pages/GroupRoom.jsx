import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import io from "socket.io-client";
import { Typography, TextField, Button } from "@mui/material";
import { Send, Videocam, Mic, CallEnd } from "@mui/icons-material";

const socket = io("http://localhost:3000", { withCredentials: true });

const GroupRoom = () => {
    const location = useLocation();
    const roomId = location.state?.roomId;

    const [room, setRoom] = useState(null);
    const [user, setUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [isInCall, setIsInCall] = useState(false);

    const localVideoRef = useRef(null);
    const localStreamRef = useRef(null);

    useEffect(() => {
        if (!roomId) return;

        const fetchRoomData = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/room/getRoom`, {
                    params: { roomId },
                    withCredentials: true,
                });
                setRoom(response.data.room);
                setMessages(response.data.messages);
                setUser(response.data.user);
            } catch (error) {
                console.error("Error fetching room data:", error);
            }
        };

        fetchRoomData();
    }, [roomId]);

    useEffect(() => {
        if (!user || !roomId) return;

        socket.emit("joinRoom", { roomId, userId: user._id });
        socket.on("receiveRoomMessage", (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        return () => {
            socket.emit("leaveRoom", { roomId, userId: user._id });
            socket.off("receiveRoomMessage");
        };
    }, [user, roomId]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() === "" || !user || !roomId) return;
        
        const messageData = { senderId: user._id, text: newMessage };
        setMessages((prevMessages) => [...prevMessages, messageData]);
        socket.emit("sendRoomMessage", { roomId, sender: user._id, type: "text", content: newMessage });
        setNewMessage("");
    };

    const startVideoCall = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localStreamRef.current = stream;
            localVideoRef.current.srcObject = stream;
            setIsInCall(true);
        } catch (error) {
            console.error("Error starting video call:", error);
        }
    };

    const stopVideoCall = () => {
        localStreamRef.current?.getTracks().forEach((track) => track.stop());
        setIsInCall(false);
    };

    return (
        <div style={{ maxWidth: "500px", margin: "0 auto", padding: "10px", height: "100vh", display: "flex", flexDirection: "column" }}>
            {/* Room Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #ccc" }}>
                <Typography variant="h6" fontWeight="bold">
                    {room ? room.name : "Loading..."}
                </Typography>
                <div style={{ display: "flex", gap: "10px" }}>
                    <Button variant="text" onClick={startVideoCall}>🎥</Button>
                    {isInCall && <Button variant="text" onClick={stopVideoCall}>📴</Button>}
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
};

export default GroupRoom;