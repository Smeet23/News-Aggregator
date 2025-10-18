const express = require("express");
const router = express.Router();
const{
    myProfile,
    Profile,
    getUserPosts
} = require("../controllers/ProfileController");
const validateToken = require("../middleware/validateToken");
const {followUser,unfollowUser,getFollowersList,getFollowingList}  = require("../controllers/FollowController");

// Main profile route - returns current user's profile
router.get("/me",validateToken,myProfile);

// Get posts for current user
router.get("/posts",validateToken,getUserPosts);

// Get posts for a specific user
router.get("/posts/:_id",validateToken,getUserPosts);

// View another user's profile (must be last to avoid catching other routes)
router.get("/:_id",validateToken,Profile);

// Follow/Unfollow functionality
router.post("/follow/:id", validateToken, followUser);
router.post("/unfollow/:id", validateToken, unfollowUser);
router.get("/followers/:id", validateToken, getFollowersList);
router.get("/following/:id", validateToken, getFollowingList);

module.exports = router;