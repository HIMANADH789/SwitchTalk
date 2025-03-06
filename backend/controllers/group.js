const User= require('../schemas/user.js');
const GroupChat= require('../schemas/groupChat.js');
const Group= require('../schemas/group.js');
const passport = require("passport");
const mongoose= require('mongoose');
const user = require('../schemas/user.js');
mongoose.connect('mongodb://127.0.0.1:27017/chatApp');

const createGroup= async(req,res,next)=>{
    const user= await User.findById(req.user._id);
    const {name,groupId,mode}= req.body;
    const group= new Group({name,groupid:groupId,admin:[user._id],mode});
    await group.save();
    user.groups.push(group._id);
    await user.save();

res.json({ message: "Successful Creation", groupId:group._id });
}

const getGroupMessages= async(req,res,next)=>{
    const user= await User.findById(req.user._id);
    const {groupId}= req.query;
    const messages= await GroupChat.find({groupId}).populate('post');
    const group= await Group.findById(groupId);
    const isAdmin = group.admin.some(i => i.toString() === user._id.toString());
    res.json({group,user,messages,isAdmin});
}


module.exports={createGroup,getGroupMessages}