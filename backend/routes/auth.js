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

router.post("/search",isLoggedIn,auth.search);

router.get("/logout",auth.logoutUser);

router.post("/followUser",isLoggedIn,auth.reqFriend);

router.get("/notifications",isLoggedIn,auth.getNotifications);

router.post("/acceptFriend",isLoggedIn,auth.acceptFriendRequest);

router.post("/reqUserForFollowGroup",isLoggedIn,auth.reqUserForFollowGroup);

router.post("/acceptGroup",isLoggedIn,auth.acceptGroupRequest);

router.post("/searchGroupRequest",isLoggedIn,auth.searchGroupRequest);

router.post("/followGroup",isLoggedIn,auth.reqGroup);

router.post("/acceptGroupFollow",isLoggedIn,auth.acceptGroupFollow);

router.get('/getMates',isLoggedIn,auth.getMates);

router.post('/shareToMates',isLoggedIn,auth.shareToMates);

module.exports= router;