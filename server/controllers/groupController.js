const { producer, topics } = require("../config/kafka");
const Conversation = require("../models/conversationModel");
const User = require("../models/userModels");

// Tạo nhóm mới
exports.createGroup = async (req, res) => {
  try {
    const { name, members, groupAvatar } = req.body;
    const creatorId = req.user.userId;
    if (!name || !Array.isArray(members) || members.length === 0) {
      return res
        .status(400)
        .json({ error: "Tên nhóm và thành viên là bắt buộc" });
    }
    // Thêm creator vào danh sách thành viên nếu chưa có
    if (!members.includes(creatorId)) members.push(creatorId);
    const group = await Conversation.create({
      name,
      participants: members,
      type: "group",
      groupAvatar: groupAvatar || "",
      creator: creatorId,
    });
    // Gửi sự kiện tới Kafka
    await producer.send({
      topic: topics.groups,
      messages: [
        {
          value: JSON.stringify({
            action: "create",
            groupId: group._id,
            name,
            members,
            creatorId,
            groupAvatar,
          }),
        },
      ],
    });
    res.json({ success: true, group });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Thêm thành viên vào nhóm
exports.addMember = async (req, res) => {
  try {
    const { groupId, userId } = req.body;
    const group = await Conversation.findById(groupId);
    if (!group || group.type !== "group")
      return res.status(404).json({ error: "Group not found" });
    if (!group.participants.includes(req.user.userId))
      return res.status(403).json({ error: "Not authorized" });
    if (group.participants.includes(userId))
      return res.status(400).json({ error: "User already in group" });
    group.participants.push(userId);
    await group.save();
    await producer.send({
      topic: topics.groups,
      messages: [
        { value: JSON.stringify({ action: "addMember", groupId, userId }) },
      ],
    });
    res.json({ success: true, group });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Xóa thành viên khỏi nhóm
exports.removeMember = async (req, res) => {
  try {
    const { groupId, userId } = req.body;
    const group = await Conversation.findById(groupId);
    if (!group || group.type !== "group")
      return res.status(404).json({ error: "Group not found" });
    if (!group.participants.includes(req.user.userId))
      return res.status(403).json({ error: "Not authorized" });
    if (!group.participants.includes(userId))
      return res.status(400).json({ error: "User not in group" });
    group.participants = group.participants.filter(
      (id) => id.toString() !== userId
    );
    await group.save();
    await producer.send({
      topic: topics.groups,
      messages: [
        { value: JSON.stringify({ action: "removeMember", groupId, userId }) },
      ],
    });
    res.json({ success: true, group });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Cập nhật thông tin nhóm
exports.updateGroup = async (req, res) => {
  try {
    const { groupId, name, groupAvatar } = req.body;
    const group = await Conversation.findById(groupId);
    if (!group || group.type !== "group")
      return res.status(404).json({ error: "Group not found" });
    if (!group.participants.includes(req.user.userId))
      return res.status(403).json({ error: "Not authorized" });
    if (name) group.name = name;
    if (groupAvatar) group.groupAvatar = groupAvatar;
    await group.save();
    await producer.send({
      topic: topics.groups,
      messages: [
        {
          value: JSON.stringify({
            action: "update",
            groupId,
            name,
            groupAvatar,
          }),
        },
      ],
    });
    res.json({ success: true, group });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
