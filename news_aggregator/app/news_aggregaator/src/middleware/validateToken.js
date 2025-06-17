const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const validateToken = asyncHandler(async (req, res, next) => {
    let token = req.cookies.jwt;
    console.log("Token:", token); 

    if (!token) {
        console.error("Token not found");
        return res.redirect('/login'); // ✅ immediately return after redirect
    }

    const keyy = process.env.ACCESS_TOKEN_SECRET || "newsagr21";

    jwt.verify(token, keyy, (err, decoded) => {
        if (err) {
            console.error("Token verification failed:", err.message);
            return res.redirect('/login'); // ✅ early return on failure
        }

        req.user = decoded.user;
        next(); // ✅ continue if valid
    });
});

module.exports = validateToken;
