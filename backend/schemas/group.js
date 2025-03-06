const mongoose = require("mongoose");
const User= require('./user.js');

const {Schema}= mongoose;


const GroupSchema = new Schema({
    name: { type: String, required: true },
    groupid:{type:String,required:true,unique:true},
    members: [{ type:Schema.Types.ObjectId, ref: "User" }], 
    admin: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    posts: [{
        type:Schema.Types.ObjectId,
        ref:'Post'
    }],
    mode:{type:String,  enum: ["hobby", "professional", "general","event"], default:'general'},
    profilePic:{type:String},
    aliveRooms:[{type:Schema.Types.ObjectId,ref:"Room"}],
    deadRooms:[{type:Schema.Types.ObjectId,ref:"Room"}],
    createdAt: { type: Date, default: Date.now }
});

GroupSchema.index({ members: 1 }); // Faster querying by members

module.exports = mongoose.model("Group", GroupSchema);
