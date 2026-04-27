import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  getMessages,
  getUsersForSidebar,
  sendMessage,
  updateMessage,
  deleteMessage,
  acceptRequest,
  rejectMessage,
} from "../controllers/messageController.js";

const messageRouter = express.Router();

messageRouter.get("/users", verifyToken, getUsersForSidebar);
messageRouter.get("/:id", verifyToken, getMessages);
// messageRouter.put("/mark/:id", verifyToken, markMessageAsSeen);
messageRouter.post("/send/:id", verifyToken, sendMessage);
messageRouter.put("/update/:id", verifyToken, updateMessage);   // Match axios.put(`${messageURI}/update/${id}`)
messageRouter.delete("/delete/:id", verifyToken, deleteMessage); // Match axios.delete(`${messageURI}/delete/${id}`)
messageRouter.put("/accept/:id", verifyToken, acceptRequest);
messageRouter.put("/reject/:id", verifyToken, rejectMessage);
export default messageRouter;   