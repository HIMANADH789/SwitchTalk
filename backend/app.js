require('dotenv').config();
const express = require('express');
const passport = require('passport');
const localStrategy = require('passport-local');
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

const allowedOrigins = [
    process.env.FRONTEND_URL
];

app.use(cors({
    origin: process.env.FRONTEND_URL, // ✅ Ensure correct frontend URL
    credentials: true // ✅ Required for sending cookies
}));

app.use(express.json());

MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
})
.then(store => console.log("✅ MongoStore initialized"))
.catch(err => console.error("❌ MongoStore error:", err));


app.use(session({
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI, // ✅ Your MongoDB connection URL
        collectionName: 'sessions',  // Optional: Specify collection name
        ttl: 24 * 60 * 60  // Sessions expire after 24 hours
    }),
    secret: 'fallback-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        secure: process.env.NODE_ENV === "production",  // ✅ Secure only in production
        httpOnly: true,
        sameSite: "None"
    }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

connectDB();

app.use((req, res, next) => {
    if (req.user) {
        res.locals.user = req.user;
    }
    next();
});

app.use((req, res, next) => {
    console.log("🔍 Session:", req.session);
    console.log("🔍 Passport Data:", req.session.passport);
    console.log("🔍 User:", req.user);
    next();
  });
  

app.use('/auth', authRoutes);
app.use('/chat', chatRoutes);
app.use('/group', groupRoutes);
app.use('/post', postRoutes);
app.use('/room', roomRoutes);

setupWebSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
});
