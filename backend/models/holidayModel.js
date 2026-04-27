import mongoose from "mongoose";

const holidaySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      unique: true,
    },
    year: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["PUBLIC", "COMPANY", "OPTIONAL"],
      default: "PUBLIC",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  { timestamps: true }
);

const Holiday = mongoose.model("Holiday", holidaySchema);
export default Holiday;