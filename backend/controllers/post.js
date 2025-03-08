const User= require('../schemas/user.js');
const Group= require('../schemas/group.js');
const Post = require('../schemas/post.js');
const Comment = require('../schemas/comment.js');
const passport = require("passport");
const user = require('../schemas/user.js');

const createPersonalPost= async(req,res,next)=>{
    const user= await User.findById(req.user._id);
    const {content,image,mode}= req.body;
    const post= new Post({content,image,userId:user._id,mode});
    await post.save();
    user.posts.push(post);
    await user.save();
    res.status(200);
}

const createGroupPost= async(req,res,next)=>{
    const {groupId,userId, content,image}= req.body;
    const group= await Group.findById(groupId);
    const post= new Post({content,image,groupId,userId,mode:group.mode});
    await post.save();
    group.posts.push(post);
    await group.save();
    res.status(200);
}

const getUsersFeed = async (req, res, next) => {
    const { mode } = req.query;

    const user = await User.findById(req.user._id)
        .populate("following followers groups")
        .exec();

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // **Filter groups by mode first**
    let filteredGroups = user.groups;
    if (mode !== "general") {
        filteredGroups = await Group.find({ _id: { $in: user.groups }, mode: mode }).select("_id");
        filteredGroups = filteredGroups.map(group => group._id); // Extract only the IDs
    }

    // **Filter posts by mode**
    const modeFilter = mode !== "general" ? { mode: mode } : {};

    // Fetch posts from following users (apply mode filter if applicable)
    const followingPosts = await Post.find({
        userId: { $in: user.following },
        ...modeFilter, // Ensure post mode matches if needed
    })
        .populate("userId", "name profilePic")
        .lean();
    followingPosts.forEach(post => post.priority = 1);

    // Fetch posts from followers (apply mode filter if applicable)
    const followersPosts = await Post.find({
        userId: { $in: user.followers },
        ...modeFilter,
    })
        .populate("userId", "name profilePic")
        .lean();
    followersPosts.forEach(post => post.priority = 2);

    // Fetch posts from groups (only from groups matching the mode)
    const groupPosts = await Post.find({
        groupId: { $in: filteredGroups }, // Only groups that match the mode
        ...modeFilter, // Double-check post mode
    })
        .populate("groupId", "name icon")
        .lean();
    groupPosts.forEach(post => post.priority = 3);

    // Fetch the user's own posts (apply mode filter if applicable)
    const userPosts = await Post.find({
        userId: user._id,
        ...modeFilter,
    })
        .populate("userId", "name profilePic")
        .lean();
    userPosts.forEach(post => post.priority = 4);

    // Combine all posts
    const allPosts = [...followingPosts, ...followersPosts, ...groupPosts, ...userPosts];

    // **Ensure every post has a timestamp**
    allPosts.forEach(post => {
        if (!post.timestamp) {
            post.timestamp = new Date(0); // Default to the oldest possible date if missing
        }
    });

    // **Sort posts by timestamp (newest first), then by priority**
    allPosts.sort((a, b) => {
        const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;

        if (timeB === timeA) {
            return a.priority - b.priority; // Lower priority number is better
        }
        return timeB - timeA; // Newest posts first
    });

    res.json({ posts: allPosts });
};

const getPostComments= async(req,res,next)=>{
    
    const {postId}= req.query;
    const post = await Post.findById();
    const comments = await Comment.find({ postId }).populate("userId");
    res.json({comments,post})
}


const addPostComment= async(req,res,next)=>{
    console.log("hitted")
    const {comment,postId,userId}= req.body;
    const postComment= new Comment({text:comment,postId,userId});
    await postComment.save();
    const post= await Post.findById(postId);
    post.comments.push(postComment);
    await post.save();
    res.json("Success").status(200);
}

const changeLike = async (req, res, next) => {
    try {
        const { postId, toLike } = req.query;
        console.log("toLike:", toLike);
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (toLike === "true") { // Ensure correct boolean conversion
            if (post.likes.includes(req.user._id)) {
                return res.status(400).json({ message: "Already liked" });
            }
            post.likes.push(req.user._id);
            await post.save();
            return res.json({ message: "Successfully liked" });
        } else {
            if (!post.likes.includes(req.user._id)) {
                return res.status(400).json({ message: "Already unliked" });
            }
            post.likes = post.likes.filter((i) => !i.equals(req.user._id));
            await post.save();
            return res.json({ message: "Successfully unliked" });
        }
    } catch (error) {
        console.error("Error in like/unlike:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { createGroupPost, createPersonalPost, getUsersFeed,getPostComments,addPostComment,
    changeLike
 };

