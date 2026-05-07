let ioInstance = null;

export const userSocketMap = {};

export const initSocket = (io) => {
  ioInstance = io;

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId && userId !== "undefined" && userId !== "null") {
      userSocketMap[userId] = socket.id;
      socket.join(userId);
      console.log("User connected:", userId);
    } else {
      console.log("Socket connected without userId:", socket.id);
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("join_chat", ({ userId: chatUserId, department, type }) => {
      if (chatUserId) socket.join(chatUserId);
      if (department) socket.join(`department:${department}`);
      if (type) socket.join(`chat:${type}`);

      console.log("JOIN CHAT:", {
        socketId: socket.id,
        userId: chatUserId,
        department,
        type,
      });
    });

    socket.on("send_message", (data) => {
      const messageData = {
        ...data,
        id: data.id || Date.now().toString(),
        time: data.time || new Date().toLocaleTimeString(),
      };

      console.log("SEND MESSAGE:", messageData);

      if (data.receiverId && userSocketMap[data.receiverId]) {
        io.to(userSocketMap[data.receiverId]).emit("receive_message", messageData);
      }

      if (data.department) {
        io.to(`department:${data.department}`).emit("receive_message", messageData);
      }

      socket.emit("receive_message", messageData);
    });

    socket.on("call:offer", ({ to, from, offer, callType, groupCallId, participants }) => {
      console.log("CALL OFFER TO:", to);
      console.log("CALL FROM:", from?._id);
      console.log("AVAILABLE USERS:", userSocketMap);

      const receiverSocketId = userSocketMap[to];

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("call:offer", {
          from,
          offer,
          callType,
          groupCallId,
          participants,
        });

        console.log("CALL OFFER SENT TO SOCKET:", receiverSocketId);
      } else {
        console.log("CALL USER UNAVAILABLE:", to);
        socket.emit("call:unavailable", { to });
      }
    });

    socket.on("call:answer", ({ to, answer }) => {
      console.log("CALL ANSWER TO:", to);
      console.log("AVAILABLE USERS:", userSocketMap);

      const receiverSocketId = userSocketMap[to];

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("call:answer", {
          from: userId,
          answer,
        });

        console.log("CALL ANSWER SENT TO SOCKET:", receiverSocketId);
      }
    });

    socket.on("call:ice-candidate", ({ to, candidate }) => {
      console.log("ICE CANDIDATE TO:", to);

      const receiverSocketId = userSocketMap[to];

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("call:ice-candidate", {
          from: userId,
          candidate,
        });
      } else {
        console.log("ICE RECEIVER NOT FOUND:", to);
      }
    });

    socket.on("call:reject", ({ to }) => {
      console.log("CALL REJECT TO:", to);

      const receiverSocketId = userSocketMap[to];

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("call:reject", { from: userId });
      }
    });

    socket.on("call:end", ({ to }) => {
      console.log("CALL END TO:", to);

      const receiverSocketId = userSocketMap[to];

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("call:end", { from: userId });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", userId);

      if (userId && userSocketMap[userId] === socket.id) {
        delete userSocketMap[userId];
      }

      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });
};

export const getIO = () => ioInstance;  