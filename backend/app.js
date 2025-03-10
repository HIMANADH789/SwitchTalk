require('dotenv').config();
const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const MongoStore = require('connect-mongo');
const http = require('http');
const cors = require('cors');
const connectDB = require('./database');
const User = require('./schemas/user.js');
const authRoutes = require('./routes/auth.js');
const chatRoutes = require('./routes/chat.js');
const groupRoutes = require('./routes/group.js');
const roomRoutes = require('./routes/room.js');
const postRoutes = require('./routes/post.js');
const { setupWebSocket } = require('./utils/websocket');

const app = express();
const server = http.createServer(app);

connectDB();

// ✅ CORS Configuration (Frontend should send credentials)
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

app.use(express.json());

// ✅ Session Store using MongoDB
const sessionStore = new MongoStore({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
    ttl: 24 * 60 * 60 // Sessions expire after 24 hours
});

app.use(session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'fallback-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax"
    }
}));

// ✅ Initialize Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// ✅ Passport Local Strategy
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser((user, done) => {
    console.log("🔒 Serializing user:", user._id);
    done(null, user._id); // Store user ID in session
});

passport.deserializeUser(async (id, done) => {
    try {
        console.log("🔄 Deserializing user with ID:", id);
        const user = await User.findById(id);
        console.log("🔄 Found user:", user ? "Yes" : "No");
        if (!user) return done(null, false);
        done(null, user);
    } catch (err) {
        console.error("❌ Deserialization error:", err);
        done(err);
    }
});

// ✅ Authentication check middleware
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.status(401).json({ message: "Not authenticated" });
}

// ✅ Debugging Middleware
app.use((req, res, next) => {
    console.log("🔍 Session ID:", req.sessionID);
    console.log("🔍 Is Authenticated:", req.isAuthenticated());
    console.log("🔍 User:", req.user ? `ID: ${req.user._id}, Username: ${req.user.username}` : "Not logged in");
    next();
});

// ✅ Routes with authentication middleware where needed
app.use('/auth', authRoutes);
app.use('/chat', isAuthenticated, chatRoutes);
app.use('/group', isAuthenticated, groupRoutes);
app.use('/post', isAuthenticated, postRoutes);
app.use('/room', isAuthenticated, roomRoutes);

// ✅ WebSocket Setup
setupWebSocket(server);

// ✅ Error handling middleware
app.use((err, req, res, next) => {
    console.error("❌ Server Error:", err);
    res.status(500).json({ message: "Internal server error", error: process.env.NODE_ENV === "development" ? err.message : undefined });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
});