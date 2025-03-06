const post= require('../controllers/post');
const express = require("express");
const passport = require("passport");
const {isLoggedIn}= require('../middlewares/auth.js');

const router= express.Router();

router.post('/createPersonalPost',isLoggedIn,post.createPersonalPost);

router.post('/createGroupPost',isLoggedIn,post.createGroupPost);

router.get('/getAllPosts',isLoggedIn,post.getUsersFeed);

router.get('/getPostComments',isLoggedIn,post.getPostComments);

router.post('/addPostComment',isLoggedIn,post.addPostComment);

router.get('/changeLike',post.changeLike);

module.exports=router;