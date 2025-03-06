const mongoose = require('mongoose');
const User= require('./user.js');
const Group= require('./group.js');
const RoomMessage= require('./roomMessage.js')

const {Schema}= mongoose;

const RoomSchema = new Schema({
    name: String,
    group:{type:Schema.Types.ObjectId, ref:"Group"},
    mode:{type:String, enum:['general','hobby','professional','event']},
    type: { type: String, enum: ["video", "chat"] }, 
    hosts: [{ type: Schema.Types.ObjectId, ref: "User" }], 
    admin:{ type: Schema.Types.ObjectId, ref: "User" },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }], // All users
    videoParticipants: [{ type: Schema.Types.ObjectId, ref: "User" }], 
    isLive: { type: Boolean, default: false },
    about:{type:String},
    isAlive: { type: Boolean, default: true },
    maxLimitMembers:{type:Number},
    maxLimitHosts:{type:Number},
    messages:[{type:Schema.Types.ObjectId,ref:'RoomMessage'}]
  });

module.exports= new mongoose.model('Room',RoomSchema)
  