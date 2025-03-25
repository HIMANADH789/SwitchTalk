const User= require('../schemas/user.js');
const PrivateChat= require('../schemas/privateChat.js');
const GroupChat= require('../schemas/groupChat.js');
const Group= require('../schemas/group.js');
const passport = require("passport");

async function getChatList(userId, activeMode) {
    const user = await User.findById(userId).populate("groups followers following", "name profilePic mode");
    if (!user) return [];
    console.log(activeMode)
    // Filter groups based on activeMode
    const groups = user.groups.filter(g => g.mode === activeMode);
    console.log(groups)
    let allChats = [];

    if (activeMode === "general") {
        allChats = [...user.followers, ...user.following, ...user.groups];
    } else {
        allChats = [...user.followers, ...user.following, ...groups];
    }

    // Format the final list with correct structure
    const allChatList = allChats.map(c => ({
        _id: c._id,
        name: c.name,
        profilePic: c.profilePic || "",  // Handle cases where profilePic might be missing
        type: user.groups.some(g => g._id.toString() === c._id.toString()) ? "group" : "private"
    }));

    return allChatList;
}


const getChatsList = async (req, res, next) => {
    const { mode } = req.query;
    console.log(mode)
        const user = await User.findById(req.user._id)
            .populate('groups')
            .populate('followers')
            .populate('following');

        const chatList = await getChatList(user._id, mode);
        const test = [...user.following, ...user.followers, ...user.groups];

        console.log("Hitted",user);
        res.json({ chatList, test });
    
};


const showChats= async(req,res,next) =>{
    const {friendId,mode}= req.query;
   try{
    
    const user= await User.findById(req.user._id);
    const friend= await User.findById(friendId);

    const chats = await PrivateChat.find({ 
        members: { $all: [user._id, friend._id] },
        mode
    }).populate("messages.post");  // Populating the post field inside messages
    
    res.json({chats,user,friend});
   }catch(err){
    console.error("Error fetching chat list:", err);
    res.status(500).json("Error");
   }
}

const about = async (req, res, next) => {
    try {
        const { id } = req.query;
        console.log(id)

        // First, check if the user exists
        const user = await User.findById(id).populate('posts');
        if (user) {
            const details = { ...user.toObject(), type: 'user' };
            console.log(details)
            return res.json({ details });
        }

        
        const group = await Group.findById(id).populate('posts');
        if (group) {
            const details = { ...group.toObject(), type: 'group' };
            console.log(details)
            return res.json({ details });
        }

        // If neither user nor group is found
        return res.status(404).json({ message: 'No user or group found with this ID' });

    } catch (error) {
        console.error("Error fetching details:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = { getChatsList,showChats,about };
