const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    type: { type: String, required: true }, // message, contact, group, etc.
    title: { type: String, default: "" },
    content: { type: String, default: "" },
    data: { type: Object, default: {} }, // Lưu thông tin bổ sung (id message, group, ...)
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);
