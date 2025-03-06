const User= require('../schemas/user.js');
const Group= require('../schemas/group.js');
const Room= require('../schemas/room.js');
const Notification= require('../schemas/notification.js');
const RoomMessage= require('../schemas/roomMessage.js');
const passport = require("passport");
const mongoose= require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/chatApp');

const createRoom= async(req,res,next)=>{
    const {name,group,type,about,admin}= req.body;
    const groupMakingRoom= await Group.findById(group);
    const allHosts = [...new Set([...groupMakingRoom.members, ...groupMakingRoom.admin])];
    const hosts = allHosts.filter(memberId => memberId.toString() !== admin);
    const room = new Room({...req.body,hosts,mode:groupMakingRoom.mode})
    await room.save();
    groupMakingRoom.aliveRooms.push(room);
    await groupMakingRoom.save();
    const notifications = hosts.map(hostId => ({
        user: hostId,
        message: `A new ${type} room "${name}" has been created.`,
        type: "room-created",
        roomId: room._id,
        groupId: groupMakingRoom._id,
    }));
    await Notification.insertMany(notifications);
    res.json({roomId:room._id});
}

const getRoomMessages= async(req,res,next)=>{
    const {roomId}= req.query;
    const room = await Room.findById(roomId).populate('messages');
    res.json({room,messages:room.messages,user:req.user});
}

module.exports={createRoom,getRoomMessages}
