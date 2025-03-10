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

// ✅ MongoStore: Ensure proper session storage
const sessionStore = MongoStore.create({
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
        sameSite: "None"
    }
}));

// ✅ Initialize Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// ✅ Local Strategy Setup
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

// ✅ Middleware to Manually Set req.user from Session
app.use(async (req, res, next) => {
    if (!req.user && req.session.passport && req.session.passport.user) {
        try {
            req.user = await User.findById(req.session.passport.user);
            console.log("✅ Manually set req.user:", req.user);
        } catch (err) {
            console.error("❌ Error fetching user from session:", err);
        }
    }
    next();
});

// ✅ Debugging Middleware
app.use((req, res, next) => {
    console.log("🔍 Session:", req.session);
    console.log("🔍 Passport Data:", req.session.passport);
    console.log("🔍 User:", req.user);
    next();
});

// ✅ Routes
app.use('/auth', authRoutes);
app.use('/chat', chatRoutes);
app.use('/group', groupRoutes);
app.use('/post', postRoutes);
app.use('/room', roomRoutes);

// ✅ WebSocket Setup
setupWebSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
});
