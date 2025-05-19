const express = require("express");
const router = express.Router();
const { checkOtpAttempts } = require("../middleware/authMiddleware");
const {
  register,
  verifyOTP,
  login,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/verify-otp", checkOtpAttempts, verifyOTP);

router.post("/login", login);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", checkOtpAttempts, resetPassword);

module.exports = router;
