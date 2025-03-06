const mongoose = require('mongoose');
const User= require('./user.js');
const Group= require('./group.js');
const RoomMessage= require('./roomMessage.js')

const {Schema}= mongoose;

const RoomMessageSchema = new Schema({
  roomId: { type: Schema.Types.ObjectId, ref: "Room", required: true }, // The room this message belongs to
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Who sent the message
  type: { type: String, enum: ["text", "image", "video", "system"], default: "text" }, 
  content: { type: String }, 
  reactions: [{ userId: mongoose.Schema.Types.ObjectId, emoji: String }], // Reactions (e.g., 👍 ❤️ 😂)
  edited: { type: Boolean, default: false }, // If the message was edited
  deleted: { type: Boolean, default: false }, // If the message was deleted
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "RoomMessage" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("RoomMessage", RoomMessageSchema);
