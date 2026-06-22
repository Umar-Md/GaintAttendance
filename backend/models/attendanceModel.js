import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    date: {
      type: String, 
      required: true,
    },

    startTime: Date,
    endTime: Date,

    totalHours: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Present", "Half Day", "Absent", "Holiday", "Incomplete"],
      default: "Incomplete",
    },

    startPhoto: String,
    endPhoto: String,
    startFaceScore: Number,
    endFaceScore: Number,
    faceVerificationProvider: {
      type: String,
      default: "face-api.js",
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;
