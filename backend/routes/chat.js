const chat= require('../controllers/chat');
const express = require("express");
const passport = require("passport");
const {isLoggedIn}= require('../middlewares/auth.js');

const router = express.Router();

router.get('/allChats',isLoggedIn,chat.getChatsList);

router.get('/showChats',isLoggedIn,chat.showChats);

router.get('/about',isLoggedIn,chat.about);

module.exports= router;
