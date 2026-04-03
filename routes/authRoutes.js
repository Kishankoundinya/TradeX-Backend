const express = require("express");
const { register, login, logout, sendVerifyOtp, verifyEmail, isAuthenticated, sendResetOtp, resetPassword } = require("../controllers/authController");
const { userAuth } = require("../Middleware/userAuth");
const { userModel } = require("../Model/userModel");
const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/send-verify-otp', userAuth, sendVerifyOtp);
authRouter.post('/verify-account', userAuth, verifyEmail);
authRouter.get('/is-auth', userAuth, isAuthenticated);
authRouter.post('/send-reset-otp', sendResetOtp);
authRouter.post('/reset-password', resetPassword);

// DEBUG ENDPOINT - Add this to test tokens
authRouter.get('/debug-token', userAuth, async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id);
        res.json({
            success: true,
            message: 'Token debug info',
            userId: req.user.id,
            userEmail: user?.email,
            tokenFromCookie: req.cookies.token ? 'Present' : 'Missing',
            tokenFromHeader: req.headers.authorization ? 'Present' : 'Missing'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = authRouter;