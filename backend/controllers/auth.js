const User= require('../schemas/user.js');
const passport = require("passport");
const Group= require('../schemas/group.js');
const PrivateChat= require('../schemas/privateChat.js');
const GroupChat= require('../schemas/groupChat.js');
const Notification= require('../schemas/notification.js');
const mongoose= require('mongoose');
const user = require('../schemas/user.js');
mongoose.connect('mongodb://127.0.0.1:27017/chatApp');

const userInfo= async(req,res,next)=>{
    if (req.user) {
        res.json({ isAuthenticated: true, user: req.user });
    } else {
        res.json({ isAuthenticated: false });
    }
}

async function getChatList(userId, activeMode) {
    const user = await User.findById(userId).populate("groups followers following", "name mode");
    if (!user) return [];

    console.log(activeMode);

    // Filter groups based on activeMode
    const groups = user.groups.filter(g => g.mode === activeMode);
    console.log(groups);

    let chatList = new Map(); // Using Map to ensure unique entries

    // Add followers and following as users
    user.followers.forEach(f => chatList.set(f._id.toString(), { _id: f._id.toString(), name: f.name, type: "user" }));
    user.following.forEach(f => chatList.set(f._id.toString(), { _id: f._id.toString(), name: f.name, type: "user" }));

    // Add groups based on activeMode
    if (activeMode === "general") {
        user.groups.forEach(g => chatList.set(g._id.toString(), { _id: g._id.toString(), name: g.name, type: "group" }));
    } else {
        groups.forEach(g => chatList.set(g._id.toString(), { _id: g._id.toString(), name: g.name, type: "group" }));
    }

    return Array.from(chatList.values()); // Convert Map to array
}



const registerUser= async (req, res) => {
    try {
        const { username,name, email, password } = req.body;
        const newUser = new User({ username,name, email });

    
        User.register(newUser, password, (err, user) => {
            if (err) return res.status(400).json({ error: err.message });

            
        });
    } catch (error) {
        res.status(500).json({ error: "Server error!" });
    }
}

const logoutUser= async(req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).json({ error: "Logout failed!" });
        res.json({ message: "Logged out successfully!" });
    });
}

const search= async(req,res,next)=>{
    console.log(req.user._id);
    const {id}= req.body;
    const user= await User.findById(req.user._id);
    const findUser= await User.find({username:id});
    console.log(findUser);
    const findGroup= await Group.find({groupid:id});
    console.log(findGroup);
    if(findUser.length>0){
        let status;
        for(let u of user.reqForFollow){
            const us= await User.findById(u);
            console.log(us.name,us._id,findUser[0]._id);
        }
        if(user.followers.some(i=>i.equals(findUser[0]._id))){
            status="follower";
        }else if(user.following.some(i=>i.equals(findUser[0]._id))){
            status= "following";
        }else if(user.reqForFollow.some(i=>i.equals(findUser[0]._id))){
            status="reqForFollow";
        }else if(user.reqOfFollowing.some(i=>i.equals(findUser[0]._id))){
            status="reqOfFollowing";
        }else{
            status="none"
        }
        res.json({searched:findUser[0],type:'user',status});
        console.log(status);
    }else if(findGroup.length>0){
        let status;
        if( findGroup[0].admin.some(i => i.toString() === user._id.toString())){
            status='admin'
        }else if( findGroup[0].members.some(i => i.toString() === user._id.toString())){
            status='member'
        }else{
            status='none'
        }

        res.json({searched:findGroup[0],type:'group',status});
    }else{
        res.json({message:"Not found"});
    }

}

const reqFriend= async(req,res,next)=>{
    const {id}= req.body;
    const requestedFriend= await User.findById(id);
    const user= await User.findById(req.user._id);
    const notification= new Notification({userId:requestedFriend._id, senderId:req.user._id,type:'follow'});
    await notification.save();
    requestedFriend.notifications.push(notification);
    requestedFriend.reqOfFollowing.push(user._id);
    await requestedFriend.save();
    user.reqForFollow.push(requestedFriend._id);
    await user.save();
    res.json({message:'successful',user:requestedFriend});
}

const reqGroup=async(req,res,next)=>{
    const {id}= req.body;
    const requestedGroup= await Group.findById(id).populate('admin');

    
    const notification = new Notification({
        groupId: requestedGroup._id,
        senderId: req.user._id,
        receiverId: requestedGroup.admin.map(admin => admin._id), // Store all admin IDs
        type: "group-follower",
    });
    await notification.save()
    await Promise.all(
        requestedGroup.admin.map(async (admin) => {
            await User.findByIdAndUpdate(admin._id, {
                $push: { notifications: notification._id },
            });
        })
    )
    res.json({message:'successful',group:requestedGroup});
}

const acceptGroupFollow = async (req, res, next) => {
    try {
        // 🔹 Check authentication
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized: Please log in" });
        }

        const { fid, id } = req.body;
        console.log("ids",fid, id)
        const followerId= fid;
        const grpId= id;
        if (!followerId || !grpId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const user = await User.findById(followerId);
        const group = await Group.findById(grpId).populate("admin");

        if (!user || !group) {
            return res.status(404).json({ message: "User or Group not found" });
        }

        const notification = await Notification.findOne({
            senderId: followerId,
            groupId: grpId,
            type: "group-follower",
        });

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        group.members.push(user._id);
        await group.save();

        for (let admin of group.admin) {
            admin.notifications = admin.notifications.filter(
                (notifId) => notifId.toString() !== notification._id.toString()
            );
            await admin.save();
        }

        user.groups.push(grpId);
        await user.save();
        await Notification.findByIdAndDelete(notification._id);

        return res.status(200).json({ message: "Group follow request accepted" });
    } catch (error) {
        console.error("Error accepting group follow:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


const getNotifications = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id)
            .populate({
                path: "notifications",  // Filter unread notifications
                populate: [
                    { path: "userId", select: "username name email" }, 
                    { path: "senderId", select: "username name email" }, 
                    { path: "groupId", select: "name" },
                    { path: "postId", select: "username title content" } 
                ]
            });

        res.json({ notifications: user.notifications });

    } catch (error) {
        next(error);
    }
};


const acceptFriendRequest= async(req,res,next)=>{
    const {id}= req.body;
    const user= await User.findById(req.user._id);
    const sender= await User.findById(id);
    const notificationsToDelete = await Notification.find({
        senderId: sender._id,
        userId: user._id,
        type: "follow"
    });

    const notificationIdsToRemove = notificationsToDelete.map(n => n._id.toString());

    // Step 2: Filter out these IDs from user.notifications
    user.notifications = user.notifications.filter(n => !notificationIdsToRemove.includes(n.toString()));
    
    // Step 3: Delete these notifications from DB
    await Notification.deleteMany({ _id: { $in: notificationIdsToRemove } });
    
    user.reqOfFollowing = user.reqOfFollowing
    .filter(i => i) // Remove null/undefined values
    .map(i => i.toString()) // Convert ObjectId to string
    .filter(i => i !== sender._id.toString()); // Remove the sender
    
    user.followers.push(sender._id);
    await user.save();
    sender.reqForFollow= sender.reqForFollow.filter(i=>!i.equals(user._id));
    sender.following.push(user._id);
    await sender.save();
    res.status(200);
}

const reqUserForFollowGroup= async(req,res,next)=>{
    const {id, groupId}= req.body;
    const user= await User.findById(id);
    const notification= new Notification({userId:id,groupId,type:'group'});
    await notification.save();
    user.notifications.push(notification);
    await user.save();
    res.json({message:'successful',user});
}

const acceptGroupRequest= async(req,res,next)=>{
    const {id}= req.body;
    const user= await User.findById(req.user._id);
    const group= await Group.findById(id);
    const notificationsToDelete = await Notification.find({
        groupId: group._id,
        userId: user._id,
        type: "group"
    });

    const notificationIdsToRemove = notificationsToDelete.map(n => n._id.toString());

    // Step 2: Filter out these IDs from user.notifications
    user.notifications = user.notifications.filter(n => !notificationIdsToRemove.includes(n.toString()));
    
    // Step 3: Delete these notifications from DB
    await Notification.deleteMany({ _id: { $in: notificationIdsToRemove } });
    
    user.groups.push(group._id);
    await user.save();
    group.members.push(user._id);
    await group.save();
    res.status(200);
}

const searchGroupRequest= async(req,res,next)=>{
    const {id,groupId}= req.body;
    const user= await User.findById(req.user._id);
    const findUser= await User.find({username:id});
    const group= await Group.findById(groupId).populate('admin');
        let status;
        console.log(group._id);
        if( group.admin.some(i => i.toString() === user._id.toString())){
            status='admin'
        }else if( group.members.some(i => i.toString() === user._id.toString())){
            status='member'
        }else{
            status='none'
        }

        res.json({searched:findUser[0],status});
        console.log(status);
   

}

const getMates= async(req,res,next)=>{
    const {mode}= req.query;
    const chatList=await getChatList(req.user._id,mode);
    res.json({mates:chatList});

}

const shareToMates = async (req, res, next) => {
    console.log('hitted')
    try {
        const { form, postId, chatId } = req.body;

        if (!postId) {
            return res.status(400).json({ message: "Post ID is required" });
        }

        for (const f of form) {
            if (f.type === "user") {
                const chat = await PrivateChat.findOne({
                    members: { $all: [req.user._id, f._id] }
                });

                if (!chat) {
                    return res.status(404).json({ message: "Private chat not found" });
                }

                chat.messages.push({ senderId: req.user._id, post: postId });
                await chat.save();
            } else {
                const group = await Group.findById(f._id);
                if (!group) {
                    return res.status(404).json({ message: "Group not found" });
                }

                const newChatMessage = new GroupChat({
                    groupId: f._id,
                    senderId: req.user._id,
                    post: postId
                });

                await newChatMessage.save();
            }
        }

        res.status(200).json({ message: "Post shared successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};






module.exports= {registerUser,logoutUser,search,reqFriend,getNotifications,acceptFriendRequest,
    userInfo,reqUserForFollowGroup,acceptGroupRequest,searchGroupRequest,reqGroup,acceptGroupFollow,
getMates,shareToMates};

    