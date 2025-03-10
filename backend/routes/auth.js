const express = require("express");
const passport = require("passport");
const auth= require('../controllers/auth.js');
const {isLoggedIn}= require('../middlewares/auth.js');

const router = express.Router();

router.post("/register",auth.registerUser);

// This should be in your auth.js routes file or equivalent
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ message: info.message || 'Authentication failed' });
        
        req.login(user, (err) => {
            if (err) return next(err);
            console.log("✅ Login successful, user:", user.username);
            console.log("✅ Session:", req.session);
            return res.json({ user: { id: user._id, username: user.username } });
        });
    })(req, res, next);
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