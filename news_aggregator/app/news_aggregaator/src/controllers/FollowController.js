const User = require("../model/UserModel");

const followUser = async (req, res) => {
  try {
    const userId = req.user.id; // the one who is following
    const targetId = req.params.id; // the one being followed

    if (userId === targetId) {
      return res.status(400).json({ error: "You cannot follow yourself" });
    }

    const user = await User.findById(userId);
    const target = await User.findById(targetId);

    if (!user || !target) {
      return res.status(404).json({ error: "User not found" });
    }

    if (target.followers.includes(userId)) {
      return res.status(400).json({ error: "Already following" });
    }

    // Update both users
    target.followers.push(userId);
    user.following.push(targetId);

    await target.save();
    await user.save();

    res.redirect(`/profile/${targetId}`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const unfollowUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const targetId = req.params.id;

    const user = await User.findById(userId);
    const target = await User.findById(targetId);

    if (!user || !target) {
      return res.status(404).json({ error: "User not found" });
    }

    // Remove userId from target's followers
    target.followers = target.followers.filter(
      (followerId) => followerId.toString() !== userId
    );

    // Remove targetId from user's following
    user.following = user.following.filter(
      (followingId) => followingId.toString() !== targetId
    );

    await target.save();
    await user.save();

    res.redirect(`/profile/${targetId}`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getFollowersList = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("followers", "name email");
    res.render("followers", { users: user.followers, title: "Followers" ,profileId: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getFollowingList = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("following", "name email");
    res.render("followers", { users: user.following, title: "Following",profileId: req.params.id  });  // reuse same template
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


module.exports = { followUser, unfollowUser ,getFollowersList, getFollowingList};
