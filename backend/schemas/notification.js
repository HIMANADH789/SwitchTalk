const mongoose = require('mongoose');
const User= require('./user.js');
const Post= require('./post.js');
const Group= require('./group.js');

const {Schema}= mongoose;

const NotificationSchema= new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User',
    },
    senderId:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    groupId:{
        type:Schema.Types.ObjectId,
        ref:'Group'
    },
    type: { type: String, enum: ["like", "comment", "follow", "post","group","group-follower","room-created", "message"], required: true },
    postId:{
        type:Schema.Types.ObjectId,
        ref:'Post'
    },
    read:{
        type:Boolean,
        default:false
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    roomId:{
        type:Schema.Types.ObjectId,
        ref:'Post'
    },
    message:{
        type:String
    }

})

NotificationSchema.index({ userId: 1, createdAt: -1 });

const Notification= new mongoose.model('Notification',NotificationSchema);

module.exports=Notification;
