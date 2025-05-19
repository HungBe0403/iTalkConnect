const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const contactController = require("../controllers/contactController");

// Middleware để log tất cả các request
router.use((req, res, next) => {
  console.log(`[Contact Routes] ${req.method} ${req.path}`);
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  next();
});

// Gửi yêu cầu kết bạn
router.post("/send", verifyToken, contactController.sendContactRequest);
// Chấp nhận yêu cầu kết bạn
router.post("/accept", verifyToken, contactController.acceptContactRequest);
// Từ chối yêu cầu kết bạn
router.post("/reject", verifyToken, contactController.rejectContactRequest);
// Hủy yêu cầu kết bạn
router.post("/cancel", verifyToken, contactController.cancelContactRequest);
// Chặn người dùng
router.post("/block", verifyToken, contactController.blockUser);
// Bỏ chặn người dùng
router.post("/unblock", verifyToken, contactController.unblockUser);
// Lấy danh sách bạn bè/yêu cầu
router.get("/", verifyToken, contactController.getContacts);
// Xóa liên hệ
router.delete("/remove", verifyToken, contactController.removeContact);

module.exports = router;
