const User = require("../model/UserModel");

const myProfile = async (req, res) => {
  try {
    const userid = req.user.id;
    const user = await User.findById(userid).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Always return JSON for the React frontend
    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username || user.email.split('@')[0],
      bio: user.bio || '',
      location: user.location || '',
      website: user.website || '',
      github: user.github || '',
      mobile: user.mobile || '',
      dob: user.dob,
      followers: user.followers || [],
      following: user.following || [],
      createdAt: user.createdAt,
      profilePublic: user.profilePublic !== false,
      showEmail: user.showEmail || false,
      showActivity: user.showActivity !== false,
      isMyProfile: true
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const Profile = async (req, res) => {
  const reqid = req.params._id;

  try {
    const loggedInUserId = req.user.id;
    
    // If user is viewing their own profile, send redirect flag
    if (loggedInUserId.toString() === reqid.toString()) {
      return res.json({ 
        redirect: true, 
        redirectTo: '/myprofile',
        message: 'Redirecting to your profile'
      });
    }
    
    const user = await User.findById(reqid).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if logged in user is following this profile
    const loggedInUser = await User.findById(loggedInUserId);
    const isFollowing = loggedInUser.following && loggedInUser.following.includes(reqid);

    // Always return JSON for the React frontend
    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username || user.email.split('@')[0],
      bio: user.bio || '',
      location: user.location || '',
      website: user.website || '',
      github: user.github || '',
      mobile: user.mobile || '',
      dob: user.dob,
      followers: user.followers || [],
      following: user.following || [],
      createdAt: user.createdAt,
      profilePublic: user.profilePublic !== false,
      showEmail: user.showEmail || false,
      showActivity: user.showActivity !== false,
      isMyProfile: false,
      isFollowing
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserPosts = async (req, res) => {
  try {
    const userId = req.params._id || req.user.id;
    const Post = require("../model/PostModel");
    
    // Fetch posts for this user
    const posts = await Post.find({ userid: userId })
      .sort({ createdAt: -1 })
      .lean();
    
    res.json({ 
      posts: posts,
      count: posts.length 
    });
  } catch (error) {
    console.error('Error in getUserPosts:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  myProfile,
  Profile,
  getUserPosts,
};
