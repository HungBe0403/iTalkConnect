const express = require("express");
const router = express.Router();
const multer = require("multer");
const { verifyToken } = require("../middleware/authMiddleware");
const userController = require("../controllers/userController");

const upload = multer({ storage: multer.memoryStorage() });

// Cập nhật hồ sơ
router.put("/profile", verifyToken, userController.updateProfile);
// Cập nhật ảnh đại diện
router.put(
  "/profile-picture",
  verifyToken,
  upload.single("file"),
  userController.updateProfilePicture
);
// Lấy thông tin user (chính mình)
router.get("/profile", verifyToken, userController.getUserProfile);
// Lấy thông tin user (người khác)
router.get("/profile/:id", verifyToken, userController.getUserProfile);
// Tìm kiếm user
router.get("/search", verifyToken, userController.searchUsers);
// Vô hiệu hóa tài khoản
router.delete("/deactivate", verifyToken, userController.deactivateAccount);

module.exports = router;
