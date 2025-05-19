const { producer, topics } = require("../config/kafka");
const Conversation = require("../models/conversationModel");
const SingleMessage = require("../models/singleModel");
const GroupMessage = require("../models/groupMessageModel");
const Media = require("../models/mediaModels");
const mongoose = require("mongoose");

// Gửi tin nhắn (1-1 hoặc nhóm)
exports.sendMessage = async (req, res) => {
  const { conversationId, content, mediaIds, replyTo } = req.body;
  const userId = req.user.userId;

  // Kiểm tra quyền
  const conversation = await Conversation.findById(conversationId);
  if (!conversation || !conversation.participants.includes(userId)) {
    return res.status(403).json({ error: "Not authorized" });
  }

  const message = {
    type: conversation.type === "group" ? "group" : "single",
    conversationId,
    sender: userId,
    content,
    media: mediaIds || [],
    replyTo,
    // timestamp: Date.now(),
  };

  // Gửi tới Kafka
  await producer.send({
    topic: topics.messages,
    messages: [{ value: JSON.stringify(message) }],
  });

  if (req.app.get("io")) {
    req.app.get("io").to(conversationId.toString()).emit("newMessage", message);
  }

  res.json({ success: true, message });
};

// Đánh dấu tin nhắn đã đọc
exports.readMessage = async (req, res) => {
  const { conversationId, messageId } = req.body;
  const userId = req.user.userId;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation || !conversation.participants.includes(userId)) {
    return res.status(403).json({ error: "Not authorized" });
  }

  const message = await (conversation.type === "group"
    ? GroupMessage
    : SingleMessage
  ).findById(messageId);
  if (!message) return res.status(404).json({ error: "Message not found" });

  message.readBy = message.readBy || [];
  if (!message.readBy.includes(userId)) message.readBy.push(userId);
  await message.save();

  if (req.io)
    req.io.to(conversationId).emit("messageRead", {
      conversationId,
      messageId,
      userId,
      timestamp: Date.now(),
    });

  res.json({ success: true });
};

// Thêm reaction vào tin nhắn (đồng bộ với trường reactionBy)
exports.addReaction = async (req, res) => {
  const { conversationId, messageId, reaction } = req.body;
  const userId = req.user.userId;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation || !conversation.participants.includes(userId)) {
    return res.status(403).json({ error: "Not authorized" });
  }

  const message = await (conversation.type === "group"
    ? GroupMessage
    : SingleMessage
  ).findById(messageId);
  if (!message) return res.status(404).json({ error: "Message not found" });

  // Xóa reaction cũ của user nếu có
  message.reactionBy = (message.reactionBy || []).filter(
    (r) => r.userId.toString() !== userId
  );
  // Thêm reaction mới
  message.reactionBy.push({ userId, type: reaction, timestamp: Date.now() });
  await message.save();

  // Emit realtime cho tất cả client trong phòng
  if (req.app.get("io")) {
    req.app.get("io").to(conversationId.toString()).emit("reactionAdded", {
      conversationId,
      messageId,
      reaction,
      userId,
      timestamp: Date.now(),
    });
  }

  res.json({ success: true });
};

// Thu hồi tin nhắn
exports.recallMessage = async (req, res) => {
  const { conversationId, messageId, forAll } = req.body;
  const userId = req.user.userId;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation || !conversation.participants.includes(userId)) {
    return res.status(403).json({ error: "Not authorized" });
  }

  const message = await (conversation.type === "group"
    ? GroupMessage
    : SingleMessage
  ).findById(messageId);

  if (!message || message.sender.toString() !== userId) {
    return res.status(403).json({ error: "Not authorized to recall" });
  }

  if (forAll) {
    // Thu hồi với mọi người
    message.isDeleted = true;
    await message.save();
    if (req.app.get("io")) {
      req.app.get("io").to(conversationId.toString()).emit("messageRecalled", {
        conversationId,
        messageId,
        userId,
        forAll: true,
        timestamp: Date.now(),
      });
    }
    res.json({ success: true, forAll: true, messageId });
  } else {
    // Thu hồi chỉ mình tôi
    // Không thay đổi DB, chỉ trả về messageId cho client tự ẩn
    res.json({ success: true, forAll: false, messageId });
  }
};

// Lấy lịch sử tin nhắn (có phân trang)
exports.getMessages = async (req, res) => {
  const { conversationId, limit = 20, skip = 0 } = req.query;
  const userId = req.user.userId;
  if (!mongoose.Types.ObjectId.isValid(conversationId))
    return res.status(400).json({ error: "Invalid conversationId" });
  const conversation = await Conversation.findById(conversationId);
  if (!conversation || !conversation.participants.includes(userId)) {
    return res.status(403).json({ error: "Not authorized" });
  }
  const Model = conversation.type === "group" ? GroupMessage : SingleMessage;
  const messages = await Model.find({ conversationId })
    .sort({ createdAt: 1 })
    .skip(Number(skip))
    .limit(Number(limit))
    .populate({
      path: "media",
      select: "url type format size name duration width height",
    });
  res.json({ success: true, messages });
};

// Lấy danh sách conversation của user
exports.getConversations = async (req, res) => {
  const userId = req.user.userId;
  const conversations = await Conversation.find({ participants: userId }).sort({
    updatedAt: -1,
  });
  res.json({ success: true, conversations });
};

// Tìm kiếm tin nhắn theo từ khóa
exports.searchMessages = async (req, res) => {
  const { conversationId, q, limit = 20, skip = 0 } = req.query;
  const userId = req.user.userId;
  if (!mongoose.Types.ObjectId.isValid(conversationId))
    return res.status(400).json({ error: "Invalid conversationId" });
  const conversation = await Conversation.findById(conversationId);
  if (!conversation || !conversation.participants.includes(userId)) {
    return res.status(403).json({ error: "Not authorized" });
  }
  const Model = conversation.type === "group" ? GroupMessage : SingleMessage;
  const messages = await Model.find({
    conversationId,
    content: { $regex: q, $options: "i" },
  })
    .sort({ createdAt: -1 })
    .skip(Number(skip))
    .limit(Number(limit));
  res.json({ success: true, messages });
};

// Lấy media của conversation
exports.getMedia = async (req, res) => {
  const { conversationId, limit = 20, skip = 0 } = req.query;
  const userId = req.user.userId;
  if (!mongoose.Types.ObjectId.isValid(conversationId))
    return res.status(400).json({ error: "Invalid conversationId" });
  const conversation = await Conversation.findById(conversationId);
  if (!conversation || !conversation.participants.includes(userId)) {
    return res.status(403).json({ error: "Not authorized" });
  }
  const Model = conversation.type === "group" ? GroupMessage : SingleMessage;
  const messages = await Model.find({
    conversationId,
    media: { $exists: true, $ne: [] },
  })
    .sort({ createdAt: -1 })
    .skip(Number(skip))
    .limit(Number(limit));
  // Lấy mediaId từ messages
  const mediaIds = messages.flatMap((m) => m.media);
  const medias = await Media.find({ _id: { $in: mediaIds } });
  res.json({ success: true, medias });
};

// Lấy chi tiết conversation
exports.getConversationDetail = async (req, res) => {
  const { conversationId } = req.query;
  const userId = req.user.userId;
  if (!mongoose.Types.ObjectId.isValid(conversationId))
    return res.status(400).json({ error: "Invalid conversationId" });
  const conversation = await Conversation.findById(conversationId);
  if (!conversation || !conversation.participants.includes(userId)) {
    return res.status(403).json({ error: "Not authorized" });
  }
  res.json({ success: true, conversation });
};
