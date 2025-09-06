const express = require("express");
const User = require('../model/UserModel')
const router = express.Router();
const {
    registerUser,
    LoginUser,
    ForgotPassword,
    ResetPassword,
    logout,
    newpassword
    
} = require("../controllers/UserController");
const { getNotifications } = require('../controllers/notificationController');
const { updateSettings, deleteAccount } = require('../controllers/settingController');
const upload = require('../../utils/multer');
const validateToken = require("../middleware/validateToken");
const multer = require('multer');
const { validateUserRegistration, validateUserLogin, validateProfileUpdate } = require("../middleware/validation");


//For SignUp

router.post("/register", validateUserRegistration, registerUser);

//For login
router.post("/login", validateUserLogin, LoginUser);

//Forgot Passowrd
router.post("/forgotpassword/", ForgotPassword);
router.post("/newpassword/", newpassword);
//Reset Password

router.get("/resetpassword/send-email", ResetPassword);
router.get("/logout",validateToken, logout);
router.get('/notifications', validateToken, getNotifications);



router.get('/settings', validateToken, async(req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  
  // Return JSON for API requests
  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    return res.json(user);
  }
  
  console.log('Flash msg (GET):', req.flash('success_msg')); // Should show the message
  res.render('settings', { user });
});

// Update user settings
router.post('/settings', validateToken, upload.single('profileImage'), updateSettings);

// Delete user account
router.post('/delete-account', validateToken, deleteAccount);

module.exports = router;
