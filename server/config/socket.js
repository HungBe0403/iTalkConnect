const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

/**
 * Khởi tạo và cấu hình Socket.IO cho ứng dụng chat
 * @param {http.Server} server - HTTP server
 * @returns {Server} io - Đối tượng Socket.IO
 */
function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000", "http://127.0.0.1:3000"], // Thêm các origin cho phép
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"], // Hỗ trợ cả 2 loại kết nối
  });

  // Middleware xác thực JWT cho mỗi kết nối socket
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      console.log("Socket auth failed: No token provided");
      return next(new Error("Authentication error: No token provided"));
    }
    
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET not configured in environment");
      return next(new Error("Authentication error: JWT_SECRET not configured"));
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      console.error("JWT Verification Error:", err.message);
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  // Xử lý sự kiện kết nối
  io.on("connection", (socket) => {
    // Tham gia phòng cá nhân để nhận thông báo riêng
    const userIdString = socket.userId.toString();
    socket.join(userIdString);
    console.log(
      `User ${userIdString} connected at ${new Date().toISOString()} with socket ID ${socket.id}`
    );
    console.log(`Socket ${socket.id} joined room: ${userIdString}`);

    // Log danh sách các phòng của socket
    socket.on("getRooms", () => {
      const rooms = Array.from(socket.rooms);
      console.log(`Socket ${socket.id} rooms:`, rooms);
    });
    
    // Kích hoạt getRooms ngay khi kết nối để debug
    setTimeout(() => {
      const rooms = Array.from(socket.rooms);
      console.log(`Socket ${socket.id} rooms:`, rooms);
    }, 1000);

    // Tham gia phòng trò chuyện
    socket.on("joinConversation", (conversationId) => {
      socket.join(conversationId);
      console.log(
        `User ${socket.userId} joined conversation ${conversationId}`
      );
    });

    // Gửi tin nhắn
    socket.on("sendMessage", (data) => {
      const { conversationId, content, mediaIds, replyTo } = data || {};
      if (!conversationId || !content) {
        console.warn("Invalid sendMessage data:", data);
        return;
      }
      io.to(conversationId).emit("newMessage", {
        conversationId,
        content,
        mediaIds,
        replyTo,
        senderId: socket.userId,
        timestamp: Date.now(),
      });
    });

    // Đánh dấu đã đọc tin nhắn
    socket.on("readMessage", (data) => {
      const { conversationId, messageId } = data || {};
      if (!conversationId || !messageId) {
        console.warn("Invalid readMessage data:", data);
        return;
      }
      io.to(conversationId).emit("messageRead", {
        conversationId,
        messageId,
        userId: socket.userId,
        timestamp: Date.now(),
      });
    });

    // Thêm reaction vào tin nhắn
    socket.on("addReaction", (data) => {
      const { conversationId, messageId, reaction } = data || {};
      if (!conversationId || !messageId || !reaction) {
        console.warn("Invalid addReaction data:", data);
        return;
      }
      io.to(conversationId).emit("reactionAdded", {
        conversationId,
        messageId,
        reaction,
        userId: socket.userId,
        timestamp: Date.now(),
      });
    });

    // Thu hồi tin nhắn
    socket.on("recallMessage", (data) => {
      const { conversationId, messageId } = data || {};
      if (!conversationId || !messageId) {
        console.warn("Invalid recallMessage data:", data);
        return;
      }
      io.to(conversationId).emit("messageRecalled", {
        conversationId,
        messageId,
        userId: socket.userId,
        timestamp: Date.now(),
      });
    });

    // Gửi thông báo yêu cầu kết bạn
    socket.on("newContactRequest", (data) => {
      const { recipientId } = data || {};
      if (!recipientId) {
        console.warn("Invalid newContactRequest data:", data);
        return;
      }
      
      const recipientIdString = recipientId.toString();
      console.log(`Emitting contactRequestReceived from socket to ${recipientIdString}`);
      
      io.to(recipientIdString).emit("contactRequestReceived", {
        from: socket.userId,
        timestamp: Date.now(),
      });
    });

    // Cập nhật trạng thái kết bạn (chấp nhận, từ chối, chặn, v.v.)
    socket.on("contactStatusChanged", (data) => {
      const { recipientId, requesterId, contactId, action, status } =
        data || {};
      if (!recipientId || !requesterId || !contactId || !action || !status) {
        console.warn("Invalid contactStatusChanged data:", data);
        return;
      }
      const targetId =
        action === "block" || action === "unblock" ? recipientId : requesterId;
      
      const targetIdString = targetId.toString();
      io.to(targetIdString).emit("contactStatusUpdated", {
        contactId,
        action,
        status,
        from: socket.userId,
        timestamp: Date.now(),
      });
    });

    // Ngắt kết nối
    socket.on("disconnect", (reason) => {
      console.log(
        `User ${
          socket.userId
        } disconnected at ${new Date().toISOString()} due to: ${reason}`
      );
    });
  });

  return io;
}

module.exports = { initializeSocket };
