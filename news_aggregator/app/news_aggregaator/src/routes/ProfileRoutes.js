const express = require("express");
const router = express.Router();
const{
    myProfile,
    Profile
} = require("../controllers/ProfileContoller");
const validateToken = require("../middleware/validateToken");
const upload = require("../../utils/multer");
const {followUser,unfollowUser,getFollowersList,getFollowingList}  = require("../controllers/FollowController");

router.get("/",validateToken,myProfile);
router.get("/:_id",validateToken,Profile);
router.post("/follow/:id", validateToken, followUser);
router.post("/unfollow/:id", validateToken, unfollowUser);
router.get("/followers/:id", validateToken, getFollowersList);
router.get("/following/:id", validateToken, getFollowingList);


module.exports = router;