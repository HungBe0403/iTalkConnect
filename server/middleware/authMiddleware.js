const jwt = require("jsonwebtoken");
const AuthModel = require("../models/authModels");

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const checkOtpAttempts = async (req, res, next) => {
  try {
    const { email, phoneNumber } = req.body;
    const identifier = email || phoneNumber;

    const otpRecord = await AuthModel.findOne({
      $or: [{ email }, { phoneNumber }],
      purpose: req.body.purpose,
    });

    if (!otpRecord) {
      return next();
    }

    if (otpRecord.lockedUntil && otpRecord.lockedUntil > new Date()) {
      const remainingTime = Math.ceil(
        (otpRecord.lockedUntil - new Date()) / 1000 / 60
      );
      return res.status(429).json({
        message: `Too many attempts. Please try again after ${remainingTime} minutes`,
      });
    }

    if (otpRecord.attempts >= 5) {
      otpRecord.lockedUntil = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes lockout
      await otpRecord.save();
      return res.status(429).json({
        message: "Too many attempts. Please try again after 5 minutes",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  verifyToken,
  checkOtpAttempts,
};
