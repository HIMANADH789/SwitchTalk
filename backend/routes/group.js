const group= require('../controllers/group');
const express = require("express");
const passport = require("passport");
const {isLoggedIn}= require('../middlewares/auth.js');

const router = express.Router();

router.post('/createGroup',isLoggedIn,group.createGroup)

router.get('/messages',isLoggedIn,group.getGroupMessages)

module.exports= router;