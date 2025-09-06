const express = require("express");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Load environment variables FIRST, before anything else
const envFile = process.env.NODE_ENV === 'production' 
  ? 'prod.env' 
  : 'dev.env';

const dotenv = require("dotenv").config({
  path: path.resolve(__dirname, `../config/${envFile}`),
});

if (dotenv.error) {
  console.error(`⚠️  Could not load config/${envFile} file. Using default values.`);
} else {
  console.log(`✅ Loaded environment from config/${envFile}`);
}

// Now load database connection AFTER environment variables are loaded
require("../src/config/DbConnection");

const app = express();

// Security middleware - Apply helmet for security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable for now as it may conflict with your views
}));

// Setup logging
const { setupLogging } = require('./middleware/logger');
setupLogging(app);

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later."
});

// Apply rate limiting to API routes
app.use('/api/', limiter);
app.use('/user/', limiter);
app.use('/post/', limiter);
const jwt = require("jsonwebtoken");
const session = require('express-session');
const newsRoutes = require('./routes/UserRoutes');
const { startNewsScheduler } = require('../src/scheduler/newsScheduler');
const cookieParser = require("cookie-parser");
const flash = require('connect-flash');
const asyncHandler = require("express-async-handler");
const validateToken = require("./middleware/validateToken");
app.use(cookieParser());
// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret_key_change_this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  }
}));

// Flash messages
app.use(flash());


// Make flash messages available in all views
app.use((req, res, next) => {
  const success = req.flash('success_msg');
  const error = req.flash('error_msg');
  console.log('MIDDLEWARE FLASH', { success, error });
  res.locals.success_msg = success;
  res.locals.error_msg = error;
  next();
});

const UserRoutes = require("./routes/UserRoutes");
const PostRoutes = require("./routes/PostRoutes");
const HomeRoutes = require("./routes/HomeRoutes");
const SearchRoutes = require("./routes/SearchRoutes");
const CommentRoutes = require("./routes/CommentRoutes");
const ProfileRoutes = require("./routes/ProfileRoutes");

app.set("view engine", "ejs"); // To parse .ejs from view

app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api', newsRoutes);
app.use(express.urlencoded({ extended: false }));
if (process.env.ENABLE_NEWS_SCHEDULER === 'true') {
  startNewsScheduler();
}
// app.set('view engine', 'ejs');

// console.log(__dirname);
// console.log(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, "../public")));

app.get("/", validateToken, (req, res) => {
  res.render("home");
});

app.get("/register", (req, res) => {
  res.render("register");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/forgotpassword", (req, res) => {
  res.render("ForgotPassword");
});

app.get("/createpost", validateToken, (req, res) => {
  res.render("CreatePost");
});

app.get("/search", validateToken, (req, res) => {
  res.render("search");
});

const port = process.env.PORT || 3000;
app.use("/user", UserRoutes);
app.use("/post", PostRoutes);
app.use("/home", HomeRoutes);
app.use("/search", SearchRoutes);
app.use("/comments", CommentRoutes);
app.use("/profile", ProfileRoutes);

// Import error handlers
const { errorHandler, notFound } = require('./middleware/errorHandler');

// 404 handler - must be after all other routes
app.use(notFound);

// Global error handler - must be last middleware
app.use(errorHandler);

//process.env.PORT
const server = app.listen(port, () => {
  console.log("Server listening on port " + port + "✅");
});

module.exports = app;
