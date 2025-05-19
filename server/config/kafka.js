const { Kafka } = require("kafkajs");
const mongoose = require("mongoose");
const ContactModel = require("../models/contactModels");
const SingleMessageModel = require("../models/singleModel");
const GroupMessageModel = require("../models/groupMessageModel");
const { getIO } = require("../index"); // hoặc cách lấy io instance phù hợp

// Lấy thông tin broker từ biến môi trường
const brokers = process.env.KAFKA_BROKERS.split(",");

// Khởi tạo Kafka client
const kafka = new Kafka({
  clientId: "chat-app",
  brokers,
});

// Định nghĩa các topic
const topics = {
  messages: "messages",
  notifications: "notifications",
  contacts: "contacts",
  groups: "groups",
};

// Khởi tạo producer
const producer = kafka.producer();
producer
  .connect()
  .then(() => {
    console.log("Kafka producer connected");
  })
  .catch((err) => {
    console.error("Kafka producer connection error:", err);
    process.exit(1);
  });

// Khởi tạo consumer (có thể chạy ở worker riêng)
const consumer = kafka.consumer({ groupId: "chat-app-consumer" });

// Logic xử lý message từ Kafka
async function runConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: topics.contacts, fromBeginning: false });
  await consumer.subscribe({ topic: topics.messages, fromBeginning: false });
  await consumer.subscribe({
    topic: topics.notifications,
    fromBeginning: false,
  });
  await consumer.subscribe({ topic: topics.groups, fromBeginning: false });

  consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const value = message.value.toString();
        const event = JSON.parse(value);
        // Xử lý các topic
        if (topic === topics.contacts) {
          // event: { action, requesterId, recipientId, contactId, status, reason }
          if (!event.contactId) return;
          const contact = await ContactModel.findById(event.contactId);
          if (!contact) return;
          if (event.action === "accept") {
            contact.status = "accepted";
          } else if (event.action === "reject") {
            contact.status = "declined";
            contact.reason = event.reason || "";
          } else if (event.action === "block") {
            contact.status = "blocked";
          } else if (event.action === "unblock") {
            contact.status = "pending";
          } else if (event.action === "remove") {
            await contact.deleteOne();
            return;
          }
          await contact.save();
          // Gửi thông báo
          await producer.send({
            topic: topics.notifications,
            messages: [
              { value: JSON.stringify({ type: "contact", ...event }) },
            ],
          });
        } else if (topic === topics.messages) {
          let msg;
          // Xóa các trường thời gian từ event trước khi lưu
          const eventToSave = { ...event };
          delete eventToSave.timestamp;
          delete eventToSave.sentAt;
          delete eventToSave.createdAt;
          if (event.type === "single") {
            msg = await SingleMessageModel.create(eventToSave);
          } else if (event.type === "group") {
            msg = await GroupMessageModel.create(eventToSave);
          }
          // Emit socket cho các client trong phòng
          const io = getIO && getIO();
          if (io && event.conversationId) {
            // Lấy lại message vừa lưu, populate sender, media nếu cần
            const fullMsg = await SingleMessageModel.findById(msg._id)
              .populate("sender", "name profilePicture")
              .populate("media");
            io.to(event.conversationId.toString()).emit("newMessage", fullMsg);
          }
          // Gửi thông báo
          await producer.send({
            topic: topics.notifications,
            messages: [
              { value: JSON.stringify({ type: "message", ...event }) },
            ],
          });
        } else if (topic === topics.groups) {
          // Xử lý sự kiện nhóm nếu cần
          // ...
        } else if (topic === topics.notifications) {
          // Xử lý gửi push notification nếu cần
          // ...
        }
      } catch (err) {
        console.error("Kafka consumer error:", err);
      }
    },
  });
}

module.exports = {
  kafka,
  producer,
  consumer,
  topics,
  runConsumer,
};
