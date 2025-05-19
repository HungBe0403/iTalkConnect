const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const mediaController = require("../controllers/mediaController");

// Upload media
router.post("/upload", verifyToken, mediaController.uploadMedia);
// Xóa media
router.delete("/delete", verifyToken, mediaController.deleteMedia);

module.exports = router;
