const mongoose = require("mongoose");

const OtpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    phoneNumber: { type: String },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    purpose: {
      type: String,
      enum: ["verify", "reset-password"],
      required: true,
    },
    attempts: { type: Number, default: 0 },
    lockedUntil: { type: Date },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

OtpSchema.index({ email: 1, purpose: 1 });
OtpSchema.index({ phoneNumber: 1, purpose: 1 });

module.exports = mongoose.model("Auths", OtpSchema);
