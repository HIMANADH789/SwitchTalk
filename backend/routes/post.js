const post= require('../controllers/post');
const express = require("express");
const passport = require("passport");
const {isLoggedIn}= require('../middlewares/auth.js');

const router= express.Router();

router.post('/createPersonalPost',post.createPersonalPost);

router.post('/createGroupPost',post.createGroupPost);

router.get('/getAllPosts',post.getUsersFeed);

router.get('/getPostComments',post.getPostComments);

router.post('/addPostComment',post.addPostComment);

router.get('/changeLike',post.changeLike);

module.exports=router;