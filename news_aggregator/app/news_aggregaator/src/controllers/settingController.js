const User = require('../model/UserModel');
const bcrypt = require('bcryptjs');

exports.updateSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    console.log('User ID from token:', req.user?.id);
    console.log('Request body:', req.body);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Update fields
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.bio = req.body.bio || user.bio || '';
    user.linkedin = req.body.linkedin || user.linkedin || '';
    user.twitter = req.body.twitter || user.twitter || '';
    
    // Handle boolean fields properly for JSON requests
    if (req.headers['content-type']?.includes('application/json')) {
      user.notifyFollow = req.body.notifyFollow !== undefined ? req.body.notifyFollow : user.notifyFollow;
      user.notifyComment = req.body.notifyComment !== undefined ? req.body.notifyComment : user.notifyComment;
    } else {
      user.notifyFollow = req.body.notifyFollow === 'on';
      user.notifyComment = req.body.notifyComment === 'on';
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
    await User.findByIdAndDelete(req.user._id);
    req.session.destroy();
    res.redirect('/signup');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting account.');
  }
};
