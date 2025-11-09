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
app.set('trust proxy', 1); // Needed for secure cookies on Vercel/Render

const server = http.createServer(app);

// -----------------------------
// 🌐 ENV + DB Connection
// -----------------------------
connectDB();

const isProduction = process.env.NODE_ENV === 'production';
const CLIENT_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const db = process.env.MONGO_URL;

// -----------------------------
// ⚙️ CORS Configuration
// -----------------------------
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true, // ✅ Allows cookies
  })
);

// -----------------------------
// ⚙️ Express Middleware
// -----------------------------
app.use(express.json());

// -----------------------------
// 🧱 Session + Passport Setup
// -----------------------------

// ✅ Create the session store FIRST
const sessionStore = MongoStore.create({
  mongoUrl: db,
  collectionName: 'sessions',
  ttl: 24 * 60 * 60, // 1 day
});

// ✅ Then configure sessions using the store
app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'fallback-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      httpOnly: true,
      sameSite: isProduction ? 'none' : 'lax', // ✅ Works locally & in production
      secure: isProduction, // ✅ True only over HTTPS
    },
  })
);

// ✅ Initialize Passport (after session setup)
app.use(passport.initialize());
app.use(passport.session());

// -----------------------------
// 🧠 Passport Strategy
// -----------------------------
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

// -----------------------------
// 🔐 Auth Middleware
// -----------------------------
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: 'Not authenticated' });
}

// -----------------------------
// 🧩 Debug Cookie Logging
// -----------------------------
app.use((req, res, next) => {
  console.log('🍪 Cookie:', req.headers.cookie || 'None');
  next();
});

// -----------------------------
// 🚏 Routes
// -----------------------------
app.use('/auth', authRoutes);
app.use('/chat', isAuthenticated, chatRoutes);
app.use('/group', isAuthenticated, groupRoutes);
app.use('/post', isAuthenticated, postRoutes);
app.use('/room', isAuthenticated, roomRoutes);

// -----------------------------
// 💬 WebSocket Setup
// -----------------------------
setupWebSocket(server);

// -----------------------------
// ⚠️ Error Handling
// -----------------------------
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: isProduction ? undefined : err.message,
  });
});

// -----------------------------
// 🚀 Start Server
// -----------------------------
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌍 Mode: ${isProduction ? 'Production' : 'Development'}`);
  console.log(`🧠 Frontend URL: ${CLIENT_URL}`);
});

// -----------------------------
// 🧹 Graceful Shutdown
// -----------------------------
process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
