
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";

/**
 * 🔹 Get SuperAdmin profile
 */
const getSuperAdminDetails = async (req, res) => {
  try {
    const superAdmin = await User.findById(req.userId).select("-password");

    if (!superAdmin || superAdmin.role !== "SuperAdmin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.status(200).json({
      message: "SuperAdmin details fetched",
      data: superAdmin,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 🔹 Create HR (ONLY SuperAdmin)
 */
const createHR = async (req, res) => {
  try {
    const { userName, email, password, phoneNumber, department } = req.body;

    if (!userName || !email || !password) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "HR already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const hr = await User.create({
      userName,
      email,
      password: hashedPassword,
      phoneNumber,
      department,
      role: "Hr",
      superAdminId: req.userId,
    });

    const { password: _, ...safeHr } = hr._doc;

    res.status(201).json({
      message: "HR created successfully",
      data: safeHr,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 🔹 Get all HRs (ONLY SuperAdmin)
 */
const getAllHRs = async (req, res) => {
  try {
    const hrs = await User.find({ role: "Hr" }).select("-password");

    res.status(200).json({
      count: hrs.length,
      data: hrs,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 🔹 Deactivate HR
 */
const deactivateHR = async (req, res) => {
  try {
    const hr = await User.findById(req.params.id);

    if (!hr || hr.role !== "Hr") {
      return res.status(404).json({ message: "HR not found" });
    }

    hr.isActive = false;
    await hr.save();

    res.status(200).json({
      message: "HR deactivated successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 🔹 Update SuperAdmin Profile
 */
const updateSuperAdminProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { userName, phoneNumber, department, bio } = req.body;

    const user = await User.findById(userId);

    if (!user || user.role !== "SuperAdmin") {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // 🔒 Allow only safe fields
    user.userName = userName ?? user.userName;
    user.phoneNumber = phoneNumber ?? user.phoneNumber;
    user.department = department ?? user.department;
    user.bio = bio ?? user.bio;

    await user.save();

    const { password, ...safeUser } = user._doc;

    return res.status(200).json({
      message: "SuperAdmin profile updated successfully",
      data: safeUser,
    });
  } catch (error) {
    console.error("SuperAdmin profile update error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * 🔹 Activate HR
 */
const activateHR = async (req, res) => {
  try {
    const hr = await User.findById(req.params.id);

    if (!hr || hr.role !== "Hr") {
      return res.status(404).json({ message: "HR not found" });
    }

    hr.isActive = true;
    await hr.save();

    res.status(200).json({
      message: "HR activated successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 🔹 System Overview (Optional but useful)
 */
const getSystemStats = async (req, res) => {
  try {
    const hrs = await User.find({ role: "Hr" })
      .select("userName email department isActive lastLoginAt")
      .sort({ createdAt: -1 });

    const managers = await User.find({ role: "Manager" })
      .select("userName email department isActive hrId lastLoginAt")
      .populate("hrId", "userName email");

    const employees = await User.find({ role: "Employee" })
      .select("userName email department isActive managerId lastLoginAt")
      .populate("managerId", "userName email");

    res.status(200).json({
      summary: {
        totalHRs: hrs.length,
        totalManagers: managers.length,
        totalEmployees: employees.length,
      },
      data: {
        hrs,
        managers,
        employees,
      },
    });
  } catch (error) {
    console.error("Detailed stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export {
  getSuperAdminDetails,
  createHR,
  getAllHRs,
  deactivateHR,
  activateHR,
  getSystemStats,
  updateSuperAdminProfile,
};
