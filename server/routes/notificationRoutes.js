const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const notificationController = require("../controllers/notificationController");

// Lấy danh sách thông báo
router.get("/", verifyToken, notificationController.getNotifications);
// Đánh dấu đã đọc
router.post("/read", verifyToken, notificationController.markAsRead);

module.exports = router;
