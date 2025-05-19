const Notification = require("../models/notificationModel");

// Lấy danh sách thông báo của user
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const notifications = await Notification.find({ user: userId }).sort({
      createdAt: -1,
    });
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Đánh dấu thông báo đã đọc
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { notificationId } = req.body;
    const notification = await Notification.findOne({
      _id: notificationId,
      user: userId,
    });
    if (!notification)
      return res.status(404).json({ error: "Notification not found" });
    notification.read = true;
    await notification.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
