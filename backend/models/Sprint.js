import mongoose from "mongoose";

const sprintSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "projects",
      required: true,
    },

    name: { type: String, required: true },

    startDate: Date,
    endDate: Date,

    status: {
      type: String,
      enum: ["Planned", "Active", "Completed"],
      default: "Planned",
    },
  },
  { timestamps: true },
);

export default mongoose.model("sprints", sprintSchema);