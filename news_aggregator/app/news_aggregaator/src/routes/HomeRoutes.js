const express = require("express");
const router = express.Router();
const {
    Home,
    HomePage,
    PostPage,
    vote
} = require("../controllers/HomeController");
const validateToken = require("../middleware/validateToken");

//For Home
router.get("/", validateToken, Home);
router.get("/posts/", HomePage); // Allow public access to posts
router.get("/posts/:_id", PostPage); // Allow public access to individual posts
router.post("/post/vote/:_id",validateToken, vote); // Voting still requires authentication
module.exports = router;