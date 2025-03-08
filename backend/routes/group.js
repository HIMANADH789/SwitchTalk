const group= require('../controllers/group');
const express = require("express");
const passport = require("passport");
const {isLoggedIn}= require('../middlewares/auth.js');

const router = express.Router();

router.post('/createGroup',group.createGroup)

router.get('/messages',group.getGroupMessages)

module.exports= router;