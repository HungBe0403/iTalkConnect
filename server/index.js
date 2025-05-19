require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { initializeSocket } = require("./config/socket");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const contactRoutes = require("./routes/contactRoutes");
const groupRoutes = require("./routes/groupRoutes");
const chatRoutes = require("./routes/chatRoutes");
const mediaRoutes = require("./routes/mediaRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const { runConsumer } = require("./config/kafka");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// Thêm middleware để log tất cả các request
app.use((req, res, next) => {
  console.log(`[Server] ${req.method} ${req.url}`);
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  next();
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/group", groupRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/notification", notificationRoutes);

// Thêm route để test server
app.get("/api/test", (req, res) => {
  res.json({ message: "Server is running" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Khởi tạo socket.io
const io = initializeSocket(server);
app.set("io", io);

// Thêm dòng này để export io cho các file khác dùng
module.exports.getIO = () => io;

runConsumer();

const PORT = process.env.PORT || 3005;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
