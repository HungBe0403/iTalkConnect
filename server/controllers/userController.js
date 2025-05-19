const UserModel = require("../models/userModels");
const cloudinary = require("cloudinary").v2;
const ContactModel = require("../models/contactModels");

// Cấu hình cloudinary từ biến môi trường
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 1. Cập nhật hồ sơ thông tin cá nhân
const updateProfile = async (req, res) => {
  try {
    const { name, bio, gender } = req.body;
    const userId = req.user.userId;
    const update = {};
    if (name) update.name = name;
    if (bio) update.bio = bio;
    if (gender) update.gender = gender;
    const user = await UserModel.findByIdAndUpdate(userId, update, {
      new: true,
    });
    res.json({ message: "Profile updated", user });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// 2. Cập nhật/Tải lên profilePicture qua cloudinary
const updateProfilePicture = async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // Upload buffer lên Cloudinary
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "profile_pictures",
        public_id: `user_${userId}_${Date.now()}`,
        overwrite: true,
      },
      async (error, result) => {
        if (error) {
          console.error(error);
          return res.status(500).json({ message: "Cloudinary upload error" });
        }
        const user = await UserModel.findByIdAndUpdate(
          userId,
          { profilePicture: result.secure_url },
          { new: true }
        );
        res.json({
          message: "Profile picture updated",
          profilePicture: result.secure_url,
          user,
        });
      }
    );
    stream.end(req.file.buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 3. Lấy thông tin người dùng
const getUserProfile = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const userId = req.params.id || currentUserId;
    const user = await UserModel.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Lấy trạng thái quan hệ
    let contactStatus = "none";
    let contactId = undefined;
    if (currentUserId !== userId) {
      const contact = await ContactModel.findOne({
        $or: [
          { requester: currentUserId, recipient: userId },
          { requester: userId, recipient: currentUserId },
        ],
      });
      if (contact) {
        contactStatus = contact.status;
        contactId = contact._id;
      }
    }

    res.json({
      ...user.toObject(),
      contactStatus,
      contactId,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// 4. Tìm kiếm người dùng
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: "Missing search query" });
    const users = await UserModel.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { phoneNumber: { $regex: q, $options: "i" } },
      ],
    }).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// 5. Vô hiệu hóa tài khoản
const deactivateAccount = async (req, res) => {
  try {
    const userId = req.user.userId;
    await UserModel.findByIdAndUpdate(userId, { isActive: false });
    res.json({ message: "Account deactivated" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  updateProfile,
  updateProfilePicture,
  getUserProfile,
  searchUsers,
  deactivateAccount,
};
