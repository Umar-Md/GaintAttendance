import Attendance from "../models/attendanceModel.js";
import Holiday from "../models/holidayModel.js";
import Leave from "../models/leaveModel.js";
import User from "../models/userModel.js";

const getEmployeeProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user || user.role !== "Employee") {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({ data: user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
// NEW: Fetch all employees in the same department as teammates
const getTeammates = async (req, res) => {
  try {
    // 1. Find the current user to get their department
    const currentUser = await User.findById(req.userId);
    
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Find other employees (excluding the current user)
    // Optional: add .where('department').equals(currentUser.department) 
    // if you only want people in the same department.
    const teammates = await User.find({
      _id: { $ne: req.userId }, // $ne means "Not Equal"
      role: "Employee"
    }).select("-password");

    res.json({ data: teammates });
  } catch (err) {
    console.error("Get teammates error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
const applyLeave = async (req, res) => {
  try {
    const { reason, fromDate, toDate, leaveType } = req.body;

    if (!reason || !fromDate || !toDate) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const holiday = await Holiday.findOne({
      date: { $gte: new Date(fromDate), $lte: new Date(toDate) },
    });

    if (holiday) {
      return res
        .status(400)
        .json({ message: "Public holidays are ignored automatically" });
    }

    const leave = await Leave.create({
      user: req.userId,
      reason,
      fromDate,
      toDate,
      leaveType,
    });

    res.status(201).json({
      message: "Leave applied successfully",
      data: leave,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const cancelLeave = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const userId = req.userId; // set by verifyToken middleware

    // 1. Find the leave
    const leave = await Leave.findOne({
      _id: leaveId,
      user: userId,
    });

    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    // 2. Allow cancel only if pending
    if (leave.status !== "PENDING") {
      return res
        .status(400)
        .json({ message: "Only pending leaves can be cancelled" });
    }

    // 3. Delete the leave
    await Leave.findByIdAndDelete(leaveId);

    return res.status(200).json({ message: "Leave cancelled successfully" });
  } catch (error) {
    console.error("Cancel leave error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getMyLeaves = async (req, res) => {
  const leaves = await Leave.find({ user: req.userId }).sort({
    createdAt: -1,
  });

  res.json({ data: leaves });
};

const getMyAttendance = async (req, res) => {
  const attendance = await Attendance.find({
    userId: req.userId,
  }).sort({ date: -1 });

  res.json({ data: attendance });
};

const getHolidays = async (req, res) => {
  const { year } = req.query;

  const holidays = await Holiday.find({ year });

  res.json({ data: holidays });
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.userId; // set by auth middleware
    const { userName, phoneNumber, department, bio } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔒 Prevent role/email updates from frontend
    user.userName = userName ?? user.userName;
    user.phoneNumber = phoneNumber ?? user.phoneNumber;
    user.department = department ?? user.department;
    user.bio = bio ?? user.bio;

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
export {
  getEmployeeProfile,
  getHolidays,
  getMyAttendance,
  getMyLeaves,
  applyLeave,
  cancelLeave,
  updateProfile,
  getTeammates, 
};
