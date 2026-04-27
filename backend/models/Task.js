import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema(
  {
    url: String,
    name: String,
    type: String, // image / pdf / zip / code
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const taskSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "projects",
      required: true,
    },

    sprintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "sprints",
    },

    title: { type: String, required: true },
    description: String,

    type: {
      type: String,
      enum: ["TASK", "BUG", "STORY"],
      default: "TASK",
    },

    status: {
      type: String,
      enum: ["BACKLOG", "TODO", "IN_PROGRESS", "REVIEW", "DONE"],
      default: "BACKLOG",
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "MEDIUM",
    },

    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    attachments: [attachmentSchema],

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    estimateHours: Number,
  },
  { timestamps: true },
);

export default mongoose.model("tasks", taskSchema);