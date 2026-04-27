import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    key: { type: String, required: true, unique: true }, // CMS, HRM, etc
    description: String,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    teamMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],

    status: {
      type: String,
      enum: ["Active", "Completed", "On Hold"],
      default: "Active",
    },
  },
  { timestamps: true },
);

export default mongoose.model("projects", projectSchema);