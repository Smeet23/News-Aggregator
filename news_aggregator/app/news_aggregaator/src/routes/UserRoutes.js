const express = require("express");
const router = express.Router();
const {
    registerUser,
    LoginUser,
    ForgotPassword,
    ResetPassword,
    logout,
    newpassword
    
} = require("../controllers/UserController");

const validateToken = require("../middleware/validateToken");

//For SignUp

router.post("/register", registerUser);

//For login
router.post("/login", LoginUser);

//Forgot Passowrd
router.post("/forgotpassword/", ForgotPassword);
router.post("/newpassword/", newpassword);
//Reset Password

router.get("/resetpassword/send-email", ResetPassword);
router.get("/logout",validateToken, logout);




// router.post("/follow/:id", validateToken, (req, res) => {
//   console.log("Follow route hit for:", req.params.id);
//   res.send("Follow endpoint working");
// });


module.exports = router;
