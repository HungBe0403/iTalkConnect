const UserModel = require("../models/userModels");
const ContactModel = require("../models/contactModels");
const Conversation = require("../models/conversationModel");
const mongoose = require("mongoose");

// 1. Sửa lại hàm gửi yêu cầu kết bạn
const sendContactRequest = async (req, res) => {
  try {
    const requesterId = req.user.userId;
    const { recipientId } = req.body;

    if (requesterId === recipientId)
      return res
        .status(400)
        .json({ message: "Không thể gửi yêu cầu cho chính mình" });

    // Kiểm tra người dùng tồn tại
    const recipient = await UserModel.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Kiểm tra đã tồn tại yêu cầu chưa
    const existing = await ContactModel.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId },
      ],
    });

    if (existing)
      return res
        .status(400)
        .json({ message: "Yêu cầu đã tồn tại hoặc đã là bạn bè" });

    // Tạo yêu cầu kết bạn mới
    const newContact = await ContactModel.create({
      requester: requesterId,
      recipient: recipientId,
      status: "pending",
    });

    // Lấy thông tin người gửi yêu cầu để gửi qua socket
    const requester = await UserModel.findById(
      requesterId,
      "name profilePicture"
    );

    // Phát socket event cho recipient
    const io = req.app.get("io");
    if (io) {
      console.log(`Emitting contactRequestReceived to ${recipientId}`);
      // Chuyển đổi ObjectId sang string để đảm bảo đúng định dạng phòng socket
      const recipientIdString = recipientId.toString();

      io.to(recipientIdString).emit("contactRequestReceived", {
        from: requester.name || requesterId,
        fromId: requesterId,
        contactId: newContact._id,
        timestamp: Date.now(),
        requesterInfo: {
          _id: requester._id,
          name: requester.name,
          profilePicture: requester.profilePicture,
        },
      });
      console.log(`Socket event emitted to ${recipientIdString}`);
    } else {
      console.warn("Socket.io instance not available in request");
    }

    res.status(201).json({
      message: "Gửi yêu cầu kết bạn thành công",
      contact: newContact,
    });
  } catch (error) {
    console.error("Error in sendContactRequest:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Sửa hàm getContacts để trả về thông tin đầy đủ
const getContacts = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, limit = 20, skip = 0 } = req.query;

    // Xây dựng query
    let query = {};

    if (status === "pending" && req.query.direction === "received") {
      // Lấy các yêu cầu kết bạn mà user nhận được
      query = {
        recipient: userId,
        status: "pending",
      };
    } else if (status === "pending" && req.query.direction === "sent") {
      // Lấy các yêu cầu kết bạn mà user đã gửi
      query = {
        requester: userId,
        status: "pending",
      };
    } else if (status) {
      // Lấy theo trạng thái cụ thể
      query = {
        $or: [{ requester: userId }, { recipient: userId }],
        status: status,
      };
    } else {
      // Lấy tất cả
      query = {
        $or: [{ requester: userId }, { recipient: userId }],
      };
    }

    console.log("Contact query:", JSON.stringify(query));

    // Populate thông tin người dùng
    const contacts = await ContactModel.find(query)
      .populate("requester", "name profilePicture email phoneNumber")
      .populate("recipient", "name profilePicture email phoneNumber")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    console.log(`Found ${contacts.length} contacts for user ${userId}`);

    res.json(contacts);
  } catch (error) {
    console.error("Error in getContacts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Sửa lại các hàm xử lý yêu cầu kết bạn khác
const acceptContactRequest = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { contactId } = req.body;

    const contact = await ContactModel.findById(contactId)
      .populate("requester", "name profilePicture")
      .populate("recipient", "name profilePicture");

    if (!contact) {
      return res.status(404).json({ message: "Không tìm thấy yêu cầu" });
    }

    if (contact.recipient._id.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền chấp nhận yêu cầu này" });
    }

    contact.status = "accepted";
    await contact.save();

    // Tạo cuộc trò chuyện mới nếu chưa có
    const requesterId = contact.requester._id.toString();
    const recipientId = contact.recipient._id.toString();

    let conversation = await Conversation.findOne({
      type: "single",
      participants: { $all: [requesterId, recipientId], $size: 2 },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        type: "single",
        participants: [requesterId, recipientId],
      });
    }

    // Gửi thông báo qua socket
    const io = req.app.get("io");
    if (io) {
      io.to(requesterId).emit("contactStatusUpdated", {
        contactId: contact._id,
        status: "accepted",
        from: contact.recipient.name,
        fromId: userId,
        timestamp: Date.now(),
      });
    }

    res.json({
      message: "Chấp nhận kết bạn thành công",
      conversationId: conversation._id,
      contact: contact,
    });
  } catch (error) {
    console.error("Error in acceptContactRequest:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 3. Từ chối yêu cầu kết bạn
const rejectContactRequest = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { contactId, reason } = req.body;

    const contact = await ContactModel.findById(contactId).populate(
      "requester",
      "name"
    );

    if (!contact || contact.recipient.toString() !== userId)
      return res.status(404).json({ message: "Không tìm thấy yêu cầu" });

    contact.status = "declined";
    contact.reason = reason || "";
    await contact.save();

    // Gửi thông báo qua socket
    const io = req.app.get("io");
    if (io) {
      io.to(contact.requester._id.toString()).emit("contactStatusUpdated", {
        contactId: contact._id,
        status: "declined",
        from: userId,
        timestamp: Date.now(),
      });
    }

    res.json({ message: "Từ chối kết bạn thành công" });
  } catch (error) {
    console.error("Error in rejectContactRequest:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Các hàm khác giữ nguyên
const cancelContactRequest = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { contactId } = req.body;
    const contact = await ContactModel.findById(contactId);
    if (!contact || contact.requester.toString() !== userId)
      return res.status(404).json({ message: "Không tìm thấy yêu cầu" });
    await contact.deleteOne();
    res.json({ message: "Hủy yêu cầu kết bạn thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const blockUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { userId: blockId } = req.body;
    await UserModel.findByIdAndUpdate(userId, {
      $addToSet: { blockedUsers: blockId },
    });
    res.json({ message: "Chặn người dùng thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const unblockUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { userId: unblockId } = req.body;
    await UserModel.findByIdAndUpdate(userId, {
      $pull: { blockedUsers: unblockId },
    });
    res.json({ message: "Bỏ chặn người dùng thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const removeContact = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { contactId } = req.body;
    const contact = await ContactModel.findById(contactId);
    if (
      !contact ||
      (contact.requester.toString() !== userId &&
        contact.recipient.toString() !== userId)
    )
      return res.status(404).json({ message: "Không tìm thấy liên hệ" });
    await contact.deleteOne();
    res.json({ message: "Xóa liên hệ thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  sendContactRequest,
  acceptContactRequest,
  rejectContactRequest,
  cancelContactRequest,
  blockUser,
  unblockUser,
  getContacts,
  removeContact,
};
