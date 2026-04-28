// import ChatMessageModel from "../models/chatMessageModel.js";
// import User from "../models/userModel.js";
// import { userSocketMap, getIO } from "../socket/socket.js";


// // USERS SIDEBAR
// export const getUsersForSidebar = async (req, res) => {
//   try {
//     const myId = req.userId;
//     const users = await User.find({ _id: { $ne: myId } }).select("-password");
//     const unSeenMessages = {};

//     for (let user of users) {
//       const count = await ChatMessageModel.countDocuments({
//         sender: user._id,
//         receiver: myId,
//         seen: false,
//       });
//       if (count > 0) unSeenMessages[user._id] = count;
//     }
//     res.json({ success: true, users, unSeenMessages });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // GET CHAT HISTORY
// export const getMessages = async (req, res) => {
//   try {
//     const myId = req.userId;
//     const otherId = req.params.id;

//     const messages = await ChatMessageModel.find({
//       $or: [
//         { sender: myId, receiver: otherId },
//         { sender: otherId, receiver: myId },
//       ],
//     }).sort({ createdAt: 1 });

//     await ChatMessageModel.updateMany(
//       { sender: otherId, receiver: myId, seen: false },
//       { seen: true }
//     );

//     res.json({ success: true, messages });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // SEND MESSAGE
// export const sendMessage = async (req, res) => {
//   try {
//     const senderId = req.userId;
//     const receiverId = req.params.id;
//     const { text, fileUrl, fileType } = req.body;

//     const newMessage = await ChatMessageModel.create({
//       sender: senderId,
//       receiver: receiverId,
//       text,
//       fileUrl,
//       fileType,
//     });

//     const io = getIO();
//     const receiverSocketId = userSocketMap[receiverId];
//     if (receiverSocketId) {
//       io.to(receiverSocketId).emit("newMessage", newMessage);
//     }

//     res.json({ success: true, newMessage });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // DELETE MESSAGE
// export const deleteMessage = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const myId = req.userId;

//     const message = await ChatMessageModel.findById(id);
//     if (!message) return res.status(404).json({ success: false, message: "Message not found" });
    
//     // Security: Only the sender can delete their message
//     if (message.sender.toString() !== myId) {
//       return res.status(401).json({ success: false, message: "Unauthorized" });
//     }

//     await ChatMessageModel.findByIdAndDelete(id);

//     const io = getIO();
//     const receiverSocketId = userSocketMap[message.receiver];
//     if (receiverSocketId) {
//       io.to(receiverSocketId).emit("messageDeleted", id);
//     }

//     res.json({ success: true, message: "Message deleted" });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // UPDATE (EDIT) MESSAGE
// export const updateMessage = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { text } = req.body;
//     const myId = req.userId;

//     const updatedMessage = await ChatMessageModel.findOneAndUpdate(
//       { _id: id, sender: myId }, 
//       { text, isEdited: true },
//       { new: true }
//     );

//     if (!updatedMessage) {
//       return res.status(404).json({ success: false, message: "Message not found or unauthorized" });
//     }

//     const io = getIO();
//     const receiverSocketId = userSocketMap[updatedMessage.receiver];
//     if (receiverSocketId) {
//       io.to(receiverSocketId).emit("messageUpdated", updatedMessage);
//     }
    
//     res.json({ success: true, updatedMessage });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };


  import ChatMessageModel from "../models/chatMessageModel.js";
  import User from "../models/userModel.js";
  import { userSocketMap, getIO } from "../socket/socket.js";

  /* =========================
    USERS SIDEBAR
  ========================= */
  export const getUsersForSidebar = async (req, res) => {
    try {
      const myId = req.userId;

      const users = await User.find({ _id: { $ne: myId } }).select("-password");
      const unSeenMessages = {};

      for (const user of users) {
        const count = await ChatMessageModel.countDocuments({
          sender: user._id,
          receiver: myId,
          seen: false,
        });

        if (count > 0) {
          unSeenMessages[user._id] = count;
        }
      }

      res.json({ success: true, users, unSeenMessages });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  /* =========================
    GET CHAT HISTORY
  ========================= */
  export const getMessages = async (req, res) => {
    try {
      const myId = req.userId;
      const otherId = req.params.id;

      const messages = await ChatMessageModel.find({
        $or: [
          { sender: myId, receiver: otherId },
          { sender: otherId, receiver: myId },
        ],
      }).sort({ createdAt: 1 });

      // Mark received messages as seen
      await ChatMessageModel.updateMany(
        { sender: otherId, receiver: myId, seen: false },
        { seen: true }
      );

      res.json({ success: true, messages });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  /* =========================
    SEND MESSAGE (WITH REQUEST LOGIC)
  ========================= */
  export const sendMessage = async (req, res) => {
    try {
      const senderId = req.userId;
      const receiverId = req.params.id;
      const { text, fileUrl, fileType } = req.body;

      // Check if chat already accepted
      const existingConnection = await ChatMessageModel.findOne({
        $or: [
          { sender: senderId, receiver: receiverId, status: "accepted" },
          { sender: receiverId, receiver: senderId, status: "accepted" },
        ],
      });

      const status = existingConnection ? "accepted" : "pending";

      const newMessage = await ChatMessageModel.create({
        sender: senderId,
        receiver: receiverId,
        text,
        fileUrl,
        fileType,
        status,
      });

      const io = getIO();
      const receiverSocketId = userSocketMap[receiverId];

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
      }

      res.json({ success: true, newMessage });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  /* =========================
    ACCEPT MESSAGE REQUEST
  ========================= */
  export const acceptRequest = async (req, res) => {
    try {
      const myId = req.userId;
      const senderId = req.params.id;

      await ChatMessageModel.updateMany(
        {
          $or: [
            { sender: myId, receiver: senderId },
            { sender: senderId, receiver: myId },
          ],
        },
        { status: "accepted" }
      );

      res.json({ success: true, message: "Chat request accepted" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  /* =========================
    DELETE MESSAGE
  ========================= */
  export const deleteMessage = async (req, res) => {
    try {
      const { id } = req.params;
      const myId = req.userId;

      const message = await ChatMessageModel.findById(id);
      if (!message) {
        return res.status(404).json({ success: false, message: "Message not found" });
      }

      // --- THE FIX ---
      // Check if you are the sender OR the receiver
      const isSender = message.sender.toString() === myId;
      const isReceiver = message.receiver.toString() === myId;

      if (!isSender && !isReceiver) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      await ChatMessageModel.findByIdAndDelete(id);

      // --- SOCKET LOGIC ---
      const io = getIO();
      // We need to notify the OTHER person in the conversation
      const otherPersonId = isSender ? message.receiver : message.sender;
      const otherSocketId = userSocketMap[otherPersonId];

      if (otherSocketId) {
        io.to(otherSocketId).emit("messageDeleted", id);
      }

      res.json({ success: true, message: "Message deleted" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };
  /* =========================
    UPDATE (EDIT) MESSAGE
  ========================= */
  export const updateMessage = async (req, res) => {
    try {
      const { id } = req.params;
      const { text } = req.body;
      const myId = req.userId;

      const updatedMessage = await ChatMessageModel.findOneAndUpdate(
        { _id: id, sender: myId },
        { text, isEdited: true },
        { new: true }
      );

      if (!updatedMessage) {
        return res
          .status(404)
          .json({ success: false, message: "Message not found or unauthorized" });
      }

      const io = getIO();
      const receiverSocketId = userSocketMap[updatedMessage.receiver];

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("messageUpdated", updatedMessage);
      }

      res.json({ success: true, updatedMessage });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  export const rejectMessage = async (req, res) => {
  try {
    const { id } = req.params; // The ID of the pending message
    const myId = req.userId;

    const message = await ChatMessageModel.findById(id);
    if (!message) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    // Security check: Only the receiver can reject a request
    if (message.receiver.toString() !== myId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Change status to 'rejected'. This hides the banner but keeps the message.
    message.status = "rejected";
    await message.save();

    // Notify the sender via socket so their UI can reflect that the request was seen/rejected
    const io = getIO();
    const senderSocketId = userSocketMap[message.sender];
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageUpdated", message);
    }

    res.json({ success: true, message: "Request rejected", updatedMessage: message });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};