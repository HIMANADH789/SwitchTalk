const { Server } = require("socket.io");
const PrivateChat = require("../schemas/privateChat");
const GroupChat = require("../schemas/groupChat");
const Room = require("../schemas/room");
const RoomMessage = require("../schemas/roomMessage");

const onlineUsers = new Map();
const rooms = new Map(); // Track room participants for WebRTC

function setupWebSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: [process.env.FRONTEND_URL || "http://localhost:5173"],
            methods: ["GET", "POST"],
            credentials: true
        }
    });    

    io.on("connection", (socket) => {
        console.log("New user connected:", socket.id);

        socket.on("registerUser", (userId) => {
            onlineUsers.set(userId, socket.id);
            console.log(`User ${userId} registered with socket ${socket.id}`);
        });

        socket.on("sendPrivateMessage", async (data) => {
            try {
                const { senderId, receiverId, text, mode } = data;
                console.log(`Received message from ${senderId} to ${receiverId} in mode ${mode}`);

                let chat = await PrivateChat.findOne({ members: { $all: [senderId, receiverId] }, mode });
                if (!chat) {
                    chat = new PrivateChat({ members: [senderId, receiverId].sort(), mode, messages: [] });
                    await chat.save();
                }

                const newMessage = { senderId, text, timestamp: new Date() };
                chat.messages.push(newMessage);
                await chat.save();

                const receiverSocket = onlineUsers.get(receiverId);
                io.to(socket.id).emit("receivePrivateMessage", newMessage);
                if (receiverSocket) {
                    io.to(receiverSocket).emit("receivePrivateMessage", newMessage);
                }
            } catch (error) {
                console.error("Error sending private message:", error);
            }
        });

        socket.on("sendGroupMessage", async (data) => {
            try {
                const { groupId, senderId, text } = data;
                const newMessage = new GroupChat({ groupId, senderId, text, timestamp: new Date() });
                await newMessage.save();
                io.to(`group_${groupId}`).emit("receiveGroupMessage", newMessage);
            } catch (error) {
                console.error("Error sending group message:", error);
            }
        });

        socket.on("sendRoomMessage", async (data) => {
            try {
                const { roomId, sender, type, content } = data;
                const newMessage = new RoomMessage({ roomId, sender, type, content, createdAt: new Date() });
                await newMessage.save();
                await Room.findByIdAndUpdate(roomId, { $push: { messages: newMessage._id } });
                io.to(`room_${roomId}`).emit("receiveRoomMessage", newMessage);
            } catch (error) {
                console.error("Error sending room message:", error);
            }
        });

        socket.on("joinRoom", (roomId) => {
            socket.join(`room_${roomId}`);
            if (!rooms.has(roomId)) rooms.set(roomId, new Set());
            rooms.get(roomId).add(socket.id);
            socket.to(`room_${roomId}`).emit("userJoined", { peerId: socket.id });
            console.log(`User joined room: ${roomId}`);
        });

        socket.on("leaveRoom", (roomId) => {
            socket.leave(`room_${roomId}`);
            if (rooms.has(roomId)) {
                rooms.get(roomId).delete(socket.id);
                if (rooms.get(roomId).size === 0) rooms.delete(roomId);
            }
            socket.to(`room_${roomId}`).emit("userLeft", { peerId: socket.id });
            console.log(`User left room: ${roomId}`);
        });

        // WebRTC Signaling
        socket.on("offer", ({ roomId, offer, sender }) => {
            socket.to(`room_${roomId}`).emit("receiveOffer", { offer, sender });
        });

        socket.on("answer", ({ roomId, answer, sender }) => {
            socket.to(`room_${roomId}`).emit("receiveAnswer", { answer, sender });
        });

        socket.on("ice-candidate", ({ roomId, candidate, sender }) => {
            socket.to(`room_${roomId}`).emit("receiveIceCandidate", { candidate, sender });
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
            for (let [userId, sockId] of onlineUsers.entries()) {
                if (sockId === socket.id) {
                    onlineUsers.delete(userId);
                    console.log(`User ${userId} removed from online list`);
                    break;
                }
            }
            rooms.forEach((sockets, roomId) => {
                if (sockets.has(socket.id)) {
                    sockets.delete(socket.id);
                    io.to(`room_${roomId}`).emit("userLeft", { peerId: socket.id });
                }
            });
        });
    });
}

module.exports = { setupWebSocket };
