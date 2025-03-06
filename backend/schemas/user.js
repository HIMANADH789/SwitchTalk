const mongoose = require('mongoose');
const Post= require('./post.js');
const Group= require('./group.js');
const Notification= require('./notification.js');
const passportLocalMongoose= require('passport-local-mongoose');

const {Schema}= mongoose;

const UserSchema=new mongoose.Schema({
  name:{type:String,required: true },
    email: { type: String, required: true, unique: true },
    profilePic: { type: String, default: "" },
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
    posts:[{
        type:Schema.Types.ObjectId,
        ref:'Post'
    }],
    groups:[{type:Schema.Types.ObjectId,ref:"Group"}],
    createdAt: { type: Date, default: Date.now },
    notifications:[{type:Schema.Types.ObjectId,ref:"Notification"}],
    reqForFollow:[{type:Schema.Types.ObjectId,ref:"User"}],
    reqOfFollowing:[{type:Schema.Types.ObjectId,ref:"User"}],

  });
  

  UserSchema.index({ username: 1 });


  UserSchema.plugin(passportLocalMongoose);

  module.exports= mongoose.model('User',UserSchema);