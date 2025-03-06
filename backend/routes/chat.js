const chat= require('../controllers/chat');
const express = require("express");
const passport = require("passport");
const {isLoggedIn}= require('../middlewares/auth.js');

const router = express.Router();

router.get('/allChats',chat.getChatsList);

router.get('/showChats',chat.showChats);

router.get('/about',chat.about);

module.exports= router;
