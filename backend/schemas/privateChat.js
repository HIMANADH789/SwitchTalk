const mongoose = require('mongoose');
const User= require('./user.js');
const Post= require('./post.js');

const {Schema}= mongoose;

const PrivateChatSchema = new Schema({
    members: [
      { type: Schema.Types.ObjectId, ref: "User", required: true }
    ],
    messages: [
      {
        senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        text: { type: String },
        post:{type:Schema.Types.ObjectId,ref:'Post'},
        createdAt: { type: Date, default: Date.now }
      }
    ],
    mode:{type:String,enum:['hobby','professional','general','event'],default:'general'},
    createdAt: { type: Date, default: Date.now }
  });
PrivateChatSchema.index({ members: 1 });

const PrivateChat= new mongoose.model('PrivateChat',PrivateChatSchema);

module.exports=PrivateChat;