const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const chatController = require("../controllers/chatController");

// Gửi tin nhắn
router.post("/send", verifyToken, chatController.sendMessage);
// Đánh dấu đã đọc
router.post("/read", verifyToken, chatController.readMessage);
// Thêm reaction
router.post("/reaction", verifyToken, chatController.addReaction);
// Thu hồi tin nhắn
router.post("/recall", verifyToken, chatController.recallMessage);
// Lấy lịch sử tin nhắn
router.get("/messages", verifyToken, chatController.getMessages);
// Lấy danh sách conversation
router.get("/conversations", verifyToken, chatController.getConversations);
// Tìm kiếm tin nhắn
router.get("/search", verifyToken, chatController.searchMessages);
// Lấy media của conversation
router.get("/media", verifyToken, chatController.getMedia);
// Lấy chi tiết conversation
router.get("/detail", verifyToken, chatController.getConversationDetail);

module.exports = router;
