const room= require('../controllers/room');
const express = require("express");
const passport = require("passport");
const {isLoggedIn}= require('../middlewares/auth.js');

const router= express.Router();


router.post('/createRoom',isLoggedIn,room.createRoom);

router.get('/getRoom',isLoggedIn,room.getRoomMessages)
module.exports=router;