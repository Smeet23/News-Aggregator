const User = require('../model/UserModel');
const bcrypt = require('bcryptjs');

exports.updateSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    console.log('User ID from token:', req.user?.id);
    console.log('Request body:', req.body);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Check if this is a password change request
    if (req.body.currentPassword && req.body.newPassword) {
      // Verify current password
      const isMatch = await user.comparePassword(req.body.currentPassword);
      if (!isMatch) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }
      
      // Set new password (will be hashed by pre-save hook)
      user.password = req.body.newPassword;
    }

    // Update basic fields
    if (req.body.name !== undefined) user.name = req.body.name;
    if (req.body.username !== undefined) user.username = req.body.username;
    if (req.body.email !== undefined) user.email = req.body.email;
    if (req.body.mobile !== undefined) user.mobile = req.body.mobile;
    if (req.body.dob !== undefined) user.dob = req.body.dob;
    
    // Update profile fields
    if (req.body.bio !== undefined) user.bio = req.body.bio;
    if (req.body.location !== undefined) user.location = req.body.location;
    if (req.body.website !== undefined) user.website = req.body.website;
    
    // Update social links
    if (req.body.linkedin !== undefined) user.linkedin = req.body.linkedin;
    if (req.body.twitter !== undefined) user.twitter = req.body.twitter;
    if (req.body.github !== undefined) user.github = req.body.github;
    
    // Handle boolean fields properly for JSON requests
    const isJsonRequest = req.headers['content-type']?.includes('application/json');
    
    // Notification settings
    if (isJsonRequest) {
      if (req.body.notifyFollow !== undefined) user.notifyFollow = req.body.notifyFollow;
      if (req.body.notifyComment !== undefined) user.notifyComment = req.body.notifyComment;
      if (req.body.notifyMention !== undefined) user.notifyMention = req.body.notifyMention;
      if (req.body.notifyNewsletter !== undefined) user.notifyNewsletter = req.body.notifyNewsletter;
      
      // Privacy settings
      if (req.body.profilePublic !== undefined) user.profilePublic = req.body.profilePublic;
      if (req.body.showEmail !== undefined) user.showEmail = req.body.showEmail;
      if (req.body.showActivity !== undefined) user.showActivity = req.body.showActivity;
    } else {
      // Form data (checkboxes)
      user.notifyFollow = req.body.notifyFollow === 'on';
      user.notifyComment = req.body.notifyComment === 'on';
      user.notifyMention = req.body.notifyMention === 'on';
      user.notifyNewsletter = req.body.notifyNewsletter === 'on';
      user.profilePublic = req.body.profilePublic === 'on';
      user.showEmail = req.body.showEmail === 'on';
      user.showActivity = req.body.showActivity === 'on';
    }

    if (req.file) {
      user.profileImage = `/uploads/${req.file.filename}`;
    }

    await user.save();
    
    // Return JSON for API requests
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.json({ 
        success: true, 
        message: 'Settings updated successfully!',
        user: user.toObject({ versionKey: false, transform: (doc, ret) => {
          delete ret.password;
          return ret;
        }})
      });
    }
    
    req.flash('success_msg', 'Settings updated successfully!');
    res.redirect('/user/settings');

  } catch (err) {
    console.error(err);
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(500).json({ error: 'Something went wrong.' });
    }
    res.status(500).send('Something went wrong.');
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    
    // Delete all posts by this user
    const Post = require('../model/PostModel');
    await Post.deleteMany({ userid: userId });
    
    // Remove user from followers/following lists of other users
    await User.updateMany(
      { followers: userId },
      { $pull: { followers: userId } }
    );
    
    await User.updateMany(
      { following: userId },
      { $pull: { following: userId } }
    );
    
    // Delete the user account
    await User.findByIdAndDelete(userId);
    
    // Return JSON for API requests
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.json({ 
        success: true, 
        message: 'Account deleted successfully' 
      });
    }
    
    // For traditional form submission
    if (req.session) {
      req.session.destroy();
    }
    res.redirect('/signup');
  } catch (err) {
    console.error(err);
    
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(500).json({ error: 'Error deleting account.' });
    }
    
    res.status(500).send('Error deleting account.');
  }
};
