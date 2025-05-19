const cloudinary = require("../config/cloudinary");
const multer = require("multer");
const { producer, topics } = require("../config/kafka");
const Media = require("../models/mediaModels");
const Conversation = require("../models/conversationModel");

// Cấu hình Multer để xử lý tệp
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
}).single("file");

// Upload media
exports.uploadMedia = (req, res) => {
  const userId = req.user.userId;

  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        error: "File upload failed",
        details: err.message,
      });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    try {
      // Xác định resource_type phù hợp
      let resourceType = "auto";
      const ext = req.file.originalname.split(".").pop()?.toLowerCase();
      if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
        resourceType = "raw";
      }

      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: resourceType,
            folder: "iTalk/media",
            use_filename: true,
            unique_filename: true,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      // Determine file type
      let type = "file";
      if (result.resource_type === "image") type = "image";
      else if (result.resource_type === "video") type = "video";
      else if (result.resource_type === "audio") type = "audio";

      // Lấy format fallback nếu Cloudinary không trả về
      let format = result.format;
      if (!format) {
        const nameParts = req.file.originalname.split(".");
        format = nameParts.length > 1 ? nameParts.pop().toLowerCase() : "bin";
      }

      // Save media info to MongoDB
      const media = new Media({
        url: result.secure_url,
        publicId: result.public_id,
        type,
        format,
        size: result.bytes,
        uploadedBy: userId,
        name: req.file.originalname,
        duration: result.duration,
        width: result.width,
        height: result.height,
      });
      await media.save();

      res.json({
        success: true,
        media: {
          _id: media._id,
          url: media.url,
          type: media.type,
          format: media.format,
          size: media.size,
          name: media.name,
          duration: media.duration,
          width: media.width,
          height: media.height,
        },
      });
    } catch (error) {
      console.error("Cloudinary upload error:", error, {
        name: error?.name,
        message: error?.message,
        http_code: error?.http_code,
        stack: error?.stack,
      });
      res.status(500).json({
        error: "Failed to upload media",
        details: error.message,
      });
    }
  });
};

// Xóa media
exports.deleteMedia = async (req, res) => {
  const { mediaId } = req.body;
  const userId = req.user.userId;

  const media = await Media.findById(mediaId);
  if (!media || media.uploadedBy.toString() !== userId) {
    return res.status(403).json({ error: "Not authorized" });
  }

  try {
    // Xóa trên Cloudinary
    await cloudinary.uploader.destroy(media.publicId);

    // Xóa trong MongoDB
    await media.deleteOne();

    res.json({ success: true });
  } catch (error) {
    console.error("Delete media error:", error);
    res.status(500).json({
      error: "Failed to delete media",
      details: error.message,
    });
  }
};
