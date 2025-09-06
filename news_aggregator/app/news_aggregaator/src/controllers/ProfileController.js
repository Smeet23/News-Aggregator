const User = require("../model/UserModel");

const myProfile = async (req, res) => {
  try {
    const userid = req.user.id;
    const user = await User.findById(userid).select('-password');
    
    // Return JSON for API requests
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.json(user);
    }
    
    res.render("myprofile", { user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const Profile = async (req, res) => {
  const reqid = req.params._id;

  try {
    const loggedInUserId = req.user.id;
    const user = await User.findById(reqid).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMyProfile = loggedInUserId.toString() === reqid.toString();
    let isFollowing = false;

    if (!isMyProfile) {
      const loggedInUser = await User.findById(loggedInUserId);
      isFollowing = loggedInUser.following.includes(reqid);
    }

    // Return JSON for API requests
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.json({
        ...user.toObject(),
        isMyProfile,
        isFollowing
      });
    }

    if (isMyProfile) {
      return res.render("myprofile", { user });
    }

    res.render("ProfilePage", {
      user,
      isMyProfile,
      isFollowing,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  myProfile,
  Profile,
};
