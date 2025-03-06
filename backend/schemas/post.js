const mongoose = require('mongoose');
const User= require('./user.js');
const Group= require('./group.js');
const Comment= require('./comment.js');

const {Schema}= mongoose;

const PostSchema= new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User',
    },
    groupId:{
        type:Schema.Types.ObjectId,
        ref:'Group',
    },
    content:{
        type:String,
        required:true
    },
    image:{
        type:String,
        default:''
    },
    mode:{
        type:String,
        enum:['hobby','professional','general','event'],
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    shares: { type: Number, default: 0 },
    comments:[{ type: Schema.Types.ObjectId, ref: "Comment" }]
});

PostSchema.index({ mode: 1, createdAt: -1 }); 
PostSchema.index({ userId: 1, createdAt: -1 });

const Post= mongoose.model('Post',PostSchema);

module.exports=Post;