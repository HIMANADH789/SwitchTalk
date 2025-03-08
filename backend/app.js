require('dotenv').config();
const express= require('express');
const passport= require('passport');
const localStrategy= require('passport-local');
const User= require('./schemas/user.js');
const authRoutes= require('./routes/auth.js');
const chatRoutes= require('./routes/chat.js');
const groupRoutes= require('./routes/group.js');
const roomRoutes= require('./routes/room.js');
const postRoutes= require('./routes/post.js');
const session= require('express-session');
const MongoStore = require('connect-mongo');
const { setupWebSocket } = require('./utils/websocket');
const http= require('http');
const cors = require("cors");
const connectDB = require('./database');


const app= express();
const server= http.createServer(app);


const allowedOrigins = [
    "http://localhost:5173", 
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
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI, 
        collectionName: 'sessions'
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, 
        secure: false, 
        httpOnly: true
    }
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


connectDB();
app.use((req, res, next) => {
    if (req.isAuthenticated()) {
        res.locals.userId = req.user._id;
    }
    next();
});


app.use('/auth',authRoutes);
app.use('/chat',chatRoutes);
app.use('/group',groupRoutes);
app.use('/post',postRoutes);
app.use('/room',roomRoutes);

setupWebSocket(server);

const PORT= process.env.PORT ;
server.listen(PORT,()=>{
    console.log("Listening ");
})