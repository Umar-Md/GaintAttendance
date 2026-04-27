import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tasks",
      required: true,
    },
    action: {
      type: String,
      enum: [
        "STATUS_CHANGED_TO_BACKLOG",
        "STATUS_CHANGED_TO_TODO",
        "STATUS_CHANGED_TO_IN_PROGRESS",
        "STATUS_CHANGED_TO_REVIEW",
        "STATUS_CHANGED_TO_DONE",
        "TASK_CREATED",
        "TASK_UPDATED", // ✅ ADD THIS
      ],
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("activities", activitySchema);