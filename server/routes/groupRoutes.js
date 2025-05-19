const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const groupController = require("../controllers/groupController");

// Tạo nhóm
router.post("/create", verifyToken, groupController.createGroup);
// Thêm thành viên
router.post("/add-member", verifyToken, groupController.addMember);
// Xóa thành viên
router.post("/remove-member", verifyToken, groupController.removeMember);
// Cập nhật thông tin nhóm
router.put("/update", verifyToken, groupController.updateGroup);

module.exports = router;
