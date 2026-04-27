import express from "express";
import { Server } from "socket.io";
import http from "http";
import mongoose from "mongoose";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // In production, replace with your frontend URL
    methods: ["GET", "POST"],
  },
});

// ===== MongoDB Setup =====
const MONGO_URI = "mongodb://localhost:27017/chatdb"; 
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const messageSchema = new mongoose.Schema({
  senderName: String,
  role: String,
  text: String,
  time: String,
  room: String, // Added room field to separate department chats
  createdAt: { type: Date, default: Date.now },
});

const Message = mongoose.model("Message", messageSchema);

// ===== Socket.io Logic =====
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join a specific room based on Department or Team
  socket.on("join_team", async ({ userName, role, department }) => {
    // Determine room: SuperAdmins might join a 'global' room, 
    // while others join based on their 'department'
    const roomName = role === "SuperAdmin" ? "management_chat" : (department || "general_chat");
    
    socket.join(roomName);
    console.log(`${userName} (${role}) joined room: ${roomName}`);

    // Fetch last 50 messages ONLY for this specific room
    try {
      const lastMessages = await Message.find({ room: roomName })
        .sort({ createdAt: 1 })
        .limit(50);
      socket.emit("previous_messages", lastMessages);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  });

  // Receive and Broadcast message within the room
  socket.on("send_team_message", async (data) => {
    try {
      // Determine the room name (same logic as join_team)
      const roomName = data.role === "SuperAdmin" ? "management_chat" : (data.department || "general_chat");
      
      // Save message with the room info
      const msgData = {
        senderName: data.senderName,
        role: data.role,
        text: data.text,
        time: data.time,
        room: roomName // Save which room this belongs to
      };

      const newMsg = new Message(msgData);
      await newMsg.save();

      // Emit ONLY to the specific room
      io.to(roomName).emit("receive_team_message", newMsg);
    } catch (err) {
      console.error("Error saving/sending message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ===== Start Server =====
const PORT = process.env.PORT || 7000;
server.listen(PORT, () => {
  console.log(`🚀 Chat server running on port ${PORT}`);
});