const express = require("express");
// require('ejs');
require("../src/config/DbConnection");
const app = express();
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
  secret: 'your_secret_key', // change to a strong secret
  resave: false,
  saveUninitialized: false
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

const path = require("path");


console.log({ path: path.resolve(__dirname, "../.env") });
const dotenv = require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

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








//process.env.PORT
const server = app.listen(port, () => {
  console.log("Server listening on port " + port + "✅");
});

module.exports = app;
