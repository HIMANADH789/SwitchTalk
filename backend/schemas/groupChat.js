const mongoose = require("mongoose");
const User= require('./user.js');
const Group= require('./group.js');
const Post= require('./post.js');

const {Schema}= mongoose;

const GroupChatSchema = new Schema({
    groupId: { type: Schema.Types.ObjectId, ref: "Group", required: true }, // Links to Group
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String},
    post:{type:Schema.Types.ObjectId, ref:"Post"},
    createdAt: { type: Date, default: Date.now }
});

GroupChatSchema.index({ groupId: 1, createdAt: -1 }); 

module.exports = mongoose.model("GroupChat", GroupChatSchema);

  