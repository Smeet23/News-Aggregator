const User = require('../model/UserModel');
const bcrypt = require('bcryptjs');

exports.updateSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    console.log('User ID from token:', req.user?.id);
    console.log('Request body:', req.body);
    if (!user) return res.status(404).send("User not found");

    // Update fields
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.bio = req.body.bio || '';
    user.linkedin = req.body.linkedin || '';
    user.twitter = req.body.twitter || '';
    user.notifyFollow = req.body.notifyFollow === 'on';
    user.notifyComment = req.body.notifyComment === 'on';
    

    if (req.file) {
      user.profileImage = `/uploads/${req.file.filename}`;
    }


    await user.save();
    req.flash('success_msg', 'Settings updated successfully!');
    res.redirect('/user/settings');

  } catch (err) {
    console.error(err);
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
