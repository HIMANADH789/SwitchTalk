require('dotenv').config();
const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
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

connectDB();

const CLIENT_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ✅ CORS for cross-origin cookies
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// ✅ In-memory session (default store)
app.use(session({
  secret: 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true,
    sameSite: 'none',  // Required for cross-origin cookies
    secure: true       // Required for HTTPS
  }
}));

// ✅ Passport setup
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser((user, done) => done(null, user._id.toString()));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// ✅ Middleware to protect routes
function isAuthenticated(req, res, next) {
  return req.isAuthenticated() ? next() : res.status(401).json({ message: "Not authenticated" });
}

// ✅ Routes
app.use('/auth', authRoutes);
app.use('/chat', isAuthenticated, chatRoutes);
app.use('/group', isAuthenticated, groupRoutes);
app.use('/post', isAuthenticated, postRoutes);
app.use('/room', isAuthenticated, roomRoutes);

setupWebSocket(server);

// ✅ Global error handler
app.use((err, req, res, next) => {
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV !== 'production' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
