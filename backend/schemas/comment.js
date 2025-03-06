const mongoose = require('mongoose');

const User= require('./user.js');
const Post= require('./post.js');

const {Schema}= mongoose;

const CommentSchema = new Schema({
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  });
  
CommentSchema.index({ postId: 1, createdAt: -1 });

const Comment= new mongoose.model('Comment',CommentSchema);

module.exports=Comment;
  