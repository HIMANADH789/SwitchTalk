require('dotenv').config();
const express = require('express');
const passport = require('passport');
const localStrategy = require('passport-local');
const session = require('express-session');
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
    origin: allowedOrigins,
    credentials: true
}));

app.use(express.json());


app.use(session({
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

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

connectDB();

app.use((req, res, next) => {
    console.log("Session:", req.session);
    console.log("User:", req.user);
    
    if (req.user) {
        res.locals.user = req.user;  // Store user in res.locals
    }

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
