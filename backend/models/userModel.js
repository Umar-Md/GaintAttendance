import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["SuperAdmin","Employee", "Manager", "Hr"],
      default: "Employee",
    },status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    phoneNumber: {
      type: String,
    },
    department: {
      type: String,
    },
    isOnLeave: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    leaveCount: {
      type: Number,
      default: 0,
    },
    lastLoginAt: Date,
    superAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },

    hrId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    bio: {
      type: String,
      default: "",
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },

    imageUrl: String,
  },
  { timestamps: true }
);

const User = mongoose.model("users", userSchema);
export default User;