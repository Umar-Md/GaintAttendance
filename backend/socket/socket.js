let ioInstance = null;

export const userSocketMap = {};

export const initSocket = (io) => {
  ioInstance = io;

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      userSocketMap[userId] = socket.id;
      console.log("User connected:", userId);
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("call:offer", ({ to, from, offer, callType, groupCallId, participants }) => {
      const receiverSocketId = userSocketMap[to];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("call:offer", {
          from,
          offer,
          callType,
          groupCallId,
          participants,
        });
      } else {
        socket.emit("call:unavailable", { to });
      }
    });

    socket.on("call:answer", ({ to, answer }) => {
      const receiverSocketId = userSocketMap[to];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("call:answer", {
          from: userId,
          answer,
        });
      }
    });

    socket.on("call:ice-candidate", ({ to, candidate }) => {
      const receiverSocketId = userSocketMap[to];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("call:ice-candidate", {
          from: userId,
          candidate,
        });
      }
    });

    socket.on("call:reject", ({ to }) => {
      const receiverSocketId = userSocketMap[to];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("call:reject", { from: userId });
      }
    });

    socket.on("call:end", ({ to }) => {
      const receiverSocketId = userSocketMap[to];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("call:end", { from: userId });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", userId);
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });
};

export const getIO = () => ioInstance;
