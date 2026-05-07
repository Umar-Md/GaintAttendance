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
        unSeenMessages[user._id.toString()] = count;
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
  SEND MESSAGE
========================= */
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.userId;
    const receiverId = req.params.id;
    const { text, fileUrl, fileType, fileName } = req.body;

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
      fileName,
      status,
    });

    const io = getIO();
    const receiverSocketId = userSocketMap[receiverId.toString()];

    if (io && receiverSocketId) {
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

    const io = getIO();
    const senderSocketId = userSocketMap[senderId.toString()];

    if (io && senderSocketId) {
      io.to(senderSocketId).emit("messageRequestAccepted", {
        acceptedBy: myId,
      });
    }

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
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    const isSender = message.sender.toString() === myId.toString();
    const isReceiver = message.receiver.toString() === myId.toString();

    if (!isSender && !isReceiver) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await ChatMessageModel.findByIdAndDelete(id);

    const io = getIO();
    const otherPersonId = isSender ? message.receiver : message.sender;
    const otherSocketId = userSocketMap[otherPersonId.toString()];

    if (io && otherSocketId) {
      io.to(otherSocketId).emit("messageDeleted", id);
    }

    res.json({ success: true, message: "Message deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =========================
  UPDATE MESSAGE
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
      return res.status(404).json({
        success: false,
        message: "Message not found or unauthorized",
      });
    }

    const io = getIO();
    const receiverSocketId =
      userSocketMap[updatedMessage.receiver.toString()];

    if (io && receiverSocketId) {
      io.to(receiverSocketId).emit("messageUpdated", updatedMessage);
    }

    res.json({ success: true, updatedMessage });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =========================
  REJECT MESSAGE REQUEST
========================= */
export const rejectMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const myId = req.userId;

    const message = await ChatMessageModel.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (message.receiver.toString() !== myId.toString()) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    message.status = "rejected";
    await message.save();

    const io = getIO();
    const senderSocketId = userSocketMap[message.sender.toString()];

    if (io && senderSocketId) {
      io.to(senderSocketId).emit("messageUpdated", message);
    }

    res.json({
      success: true,
      message: "Request rejected",
      updatedMessage: message,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};