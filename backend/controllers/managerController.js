import Attendance from "../models/attendanceModel.js";
import Holiday from "../models/holidayModel.js";
import Leave from "../models/leaveModel.js";
import User from "../models/userModel.js";
import sendEmail from "../utils/sendEmail.js";
import Project from "../models/Project.js";
import Sprint from "../models/Sprint.js";

const getManagerProfile = async (req, res) => {
  try {
    const manager = await User.findById(req.userId).select("-password");

    if (!manager || manager.role !== "Manager") {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({ data: manager });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const getMyEmployees = async (req, res) => {
  try {
    const employees = await User.find({
      role: "Employee",
      managerId: req.userId,
    }).select("-password");

    res.json({ data: employees });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const deactivateEmployee = async (req, res) => {
  const { id } = req.params;

  const employee = await User.findOne({
    _id: id,
    managerId: req.userId,
    role: "Employee",
  });

  if (!employee) return res.status(404).json({ message: "Employee not found" });

  employee.isActive = false;
  await employee.save();

  return res.json({ message: "Employee deactivated" });
};

const activateEmployee = async (req, res) => {
  const { id } = req.params;

  const employee = await User.findOne({
    _id: id,
    managerId: req.userId,
    role: "Employee",
  });

  if (!employee) return res.status(404).json({ message: "Employee not found" });

  employee.isActive = true;
  await employee.save();

  return res.json({ message: "Employee activated" });
};

const getTodayAttendance = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    // 1️⃣ Get manager employees
    const employees = await User.find({
      role: "Employee",
      managerId: req.userId,
      isActive: true,
    }).select("_id");

    const employeeIds = employees.map((e) => e._id);

    // 2️⃣ Attendance for them
    const attendance = await Attendance.find({
      userId: { $in: employeeIds },
      date: today,
    }).populate("userId", "userName email department");

    res.status(200).json({ data: attendance });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const getTeamAttendance = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    // 1. Get manager's employees
    const employees = await User.find({
      role: "Employee",
      managerId: req.userId,
      isActive: true,
    }).select("_id");

    const employeeIds = employees.map((emp) => emp._id);

    // 2. Fetch attendance for those employees
    const attendance = await Attendance.find({
      userId: { $in: employeeIds },
      date,
    }).populate("userId", "userName department imageUrl");

    res.status(200).json({ data: attendance });
  } catch (err) {
    console.error("Team attendance error", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getMonthlyAttendance = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: "Month and year required" });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Manager employees
    const employees = await User.find({
      role: "Employee",
      managerId: req.userId,
      isActive: true,
    }).select("_id");

    const employeeIds = employees.map((e) => e._id);

    const attendance = await Attendance.find({
      userId: { $in: employeeIds },
      date: {
        $gte: startDate.toISOString().split("T")[0],
        $lte: endDate.toISOString().split("T")[0],
      },
    }).populate("userId", "userName department");

    res.status(200).json({ data: attendance });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const getTeamLeaves = async (req, res) => {
  try {
    const employees = await User.find({
      managerId: req.userId,
      role: "Employee",
    }).select("_id");

    if (!employees.length) {
      return res.status(200).json({ data: [] });
    }

    const employeeIds = employees.map((emp) => emp._id);

    const leaves = await Leave.find({
      user: { $in: employeeIds },
    })
      .populate("user", "userName email department imageUrl")
      .sort({ createdAt: -1 });

    res.status(200).json({ data: leaves });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const approveLeave = async (req, res) => {
  try {
    const { remarks } = req.body;

    if (!remarks || !remarks.trim()) {
      return res.status(400).json({
        message: "Approval reason is required",
      });
    }

    const leave = await Leave.findById(req.params.id).populate("user");

    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    const manager = await User.findById(req.userId);

    if (!manager || manager.role !== "Manager") {
      return res.status(403).json({ message: "Access denied" });
    }

    leave.status = "APPROVED";
    leave.approvedBy = manager._id;
    leave.remarks = remarks;

    await leave.save();

    await User.findByIdAndUpdate(leave.user._id, {
      isOnLeave: true,
      $inc: { leaveCount: -1 },
    });

    await sendEmail({
      from: {
        name: manager.userName,
        email: manager.email,
      },
      to: leave.user.email,
      subject: "Leave Approved ✅",
      html: `
        <p>Hello <b>${leave.user.userName}</b>,</p>

        <p>Your <b>${leave.leaveType}</b> leave has been 
        <b style="color:green;">approved</b>.</p>

        <p>
          <b>From:</b> ${leave.fromDate.toDateString()} <br/>
          <b>To:</b> ${leave.toDate.toDateString()}
        </p>

        <p><b>Manager Remarks:</b> <span style="color: green; font-weight: bold;">${remarks}</span></p>

        <br/>
        <p>Regards,<br/>
        ${manager.userName} (Manager)</p>
      `,
    });

    res.json({ message: "Leave approved and email sent to employee" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const rejectLeave = async (req, res) => {
  try {
    const { remarks } = req.body;

    if (!remarks || !remarks.trim()) {
      return res.status(400).json({
        message: "Rejection reason is required",
      });
    }

    const leave = await Leave.findById(req.params.id).populate("user");

    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    const manager = await User.findById(req.userId);

    if (!manager || manager.role !== "Manager") {
      return res.status(403).json({ message: "Access denied" });
    }

    leave.status = "REJECTED";
    leave.approvedBy = manager._id;
    leave.remarks = remarks;

    await leave.save();

    await sendEmail({
      from: {
        name: manager.userName,
        email: manager.email,
      },
      to: leave.user.email,
      subject: "Leave Rejected ❌",
      html: `
        <p>Hello <b>${leave.user.userName}</b>,</p>

        <p>Your <b>${leave.leaveType}</b> leave request has been 
        <b style="color:red;">rejected</b>.</p>

        <p><b>Manager Remarks:</b> <span style="color: red; font-weight: bold;">${remarks}</span></p>

        <br/>
        <p>Regards,<br/>
        ${manager.userName} (Manager)</p>
      `,
    });

    res.json({ message: "Leave rejected and email sent to employee" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getHolidays = async (req, res) => {
  const { year } = req.query;

  const holidays = await Holiday.find({ year });

  res.json({ data: holidays });
};

const getMyAttendance = async (req, res) => {
  const attendance = await Attendance.find({
    userId: req.userId,
  }).sort({ date: -1 });

  res.json({ data: attendance });
};

const getMyProjects = async (req, res) => {
  const projects = await Project.find({ managerId: req.userId }).sort({
    createdAt: -1,
  });
  res.json({ data: projects });
};

const getSprintsByProject = async (req, res) => {
  const sprints = await Sprint.find({
    projectId: req.params.projectId,
  }).sort({ createdAt: -1 });

  res.json({ data: sprints });
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
    // 2. Get Employee and their Manager details
    const employee = await User.findById(req.userId);
    // Assuming your User model has 'managerId' to identify who they report to
    const manager = await User.findById(employee.managerId);

    const leave = await Leave.create({
      user: req.userId,
      reason,
      fromDate,
      toDate,
      leaveType,
    });
    if (manager && manager.email) {
      await sendEmail({
        from: {
          name: "Leave System",
          email: process.env.EMAIL_USER, // Or employee.email
        },
        to: manager.email,
        subject: `New Leave Request: ${employee.userName}`,
        html: `
                <p>Hello <b>${manager.userName}</b>,</p>
                <p>You have a new leave request from <b>${employee.userName}</b>.</p>
                <p>
                    <b>Type:</b> ${leaveType} <br/>
                    <b>Dates:</b> ${new Date(fromDate).toDateString()} to ${new Date(toDate).toDateString()} <br/>
                    <b>Reason:</b> ${reason}
                </p>
                <p>Please log in to the portal to approve or reject this request.</p>
            `,
      });
    }
    res.status(201).json({
      message: "Leave applied successfully",
      data: leave,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const getMyLeaves = async (req, res) => {
  const leaves = await Leave.find({ user: req.userId }).sort({
    createdAt: -1,
  });

  res.json({ data: leaves });
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
  getManagerProfile,
  getMyEmployees,
  deactivateEmployee,
  getTodayAttendance,
  getMonthlyAttendance,
  getTeamLeaves,
  approveLeave,
  rejectLeave,
  getHolidays,
  getTeamAttendance,
  activateEmployee,
  getMyAttendance,
  applyLeave,
  getMyLeaves,
  updateProfile,
  getMyProjects,
  getSprintsByProject,
};
