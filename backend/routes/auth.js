const express = require("express");
const passport = require("passport");
const auth= require('../controllers/auth.js');
const {isLoggedIn}= require('../middlewares/auth.js');

const router = express.Router();

router.post("/register",auth.registerUser);

router.post('/login', passport.authenticate('local'), (req, res) => {
    console.log("✅ Login Successful - User:", req.user);
    console.log("✅ Session After Login:", req.session);
    res.json({ message: "Login successful", user: req.user });
});


router.get("/user",auth.userInfo);

router.post("/search",auth.search);

router.get("/logout",auth.logoutUser);

router.post("/followUser",auth.reqFriend);

router.get("/notifications",auth.getNotifications);

router.post("/acceptFriend",auth.acceptFriendRequest);

router.post("/reqUserForFollowGroup",auth.reqUserForFollowGroup);

router.post("/acceptGroup",auth.acceptGroupRequest);

router.post("/searchGroupRequest",auth.searchGroupRequest);

router.post("/followGroup",auth.reqGroup);

router.post("/acceptGroupFollow",auth.acceptGroupFollow);

router.get('/getMates',auth.getMates);

router.post('/shareToMates',auth.shareToMates);

module.exports= router;