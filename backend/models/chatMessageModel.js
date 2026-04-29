// import mongoose from "mongoose";

// const chatMessageSchema = new mongoose.Schema(
//   {
//     sender: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "users",
//       required: true,
//     },
//     receiver: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "users",
//       required: true,
//     },

//     text: { type: String },

//     fileUrl: { type: String }, // 👈 Cloudinary URL
//     fileType: {
//       // 👈 image | video | document
//       type: String,
//       enum: ["image", "video", "document"],
//     },
    

//     seen: { type: Boolean, default: false },
//     isEdited: { type: Boolean, default: false },
//   },
//   { timestamps: true },
// );

// export default mongoose.model("ChatMessage", chatMessageSchema);

import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    text: { type: String },
    fileUrl: { type: String },
    fileName: { type: String },
    fileType: {
      type: String,
      enum: ["image", "video", "document"],
    },
    // NEW: Track if the message is a request
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected","seen"],
      default: "pending",
    },
    seen: { type: Boolean, default: false },
    isEdited: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model("ChatMessage", chatMessageSchema);
