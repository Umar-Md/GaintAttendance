import express from "express";
import { managerOnly, verifyToken } from "../middleware/authMiddleware.js";
import {
  activateEmployee,
  applyLeave,
  approveLeave,
  deactivateEmployee,
  getHolidays,
  getManagerProfile,
  getMonthlyAttendance,
  getMyAttendance,
  getMyEmployees,
  getMyLeaves,
  getTeamAttendance,
  getTeamLeaves,
  getTodayAttendance,
  rejectLeave,
  updateProfile,
  getMyProjects,
  getSprintsByProject,
} from "../controllers/managerController.js";

const managerRoute = express.Router();

managerRoute.get("/profile", verifyToken, managerOnly, getManagerProfile);

managerRoute.get("/employees", verifyToken, managerOnly, getMyEmployees);
managerRoute.get(
  "/team-attendance",
  verifyToken,
  managerOnly,
  getTeamAttendance,
);
managerRoute.patch(
  "/employees/:id/deactivate",
  verifyToken,
  managerOnly,
  deactivateEmployee,
);

managerRoute.patch(
  "/employees/:id/activate",
  verifyToken,
  managerOnly,
  activateEmployee,
);

managerRoute.get(
  "/attendance/today",
  verifyToken,
  managerOnly,
  getTodayAttendance,
);
managerRoute.get(
  "/attendance/monthly",
  verifyToken,
  managerOnly,
  getMonthlyAttendance,
);

managerRoute.get("/team-leaves", verifyToken, managerOnly, getTeamLeaves);
managerRoute.patch(
  "/leaves/:id/approve",
  verifyToken,
  managerOnly,
  approveLeave,
);
managerRoute.patch("/leaves/:id/reject", verifyToken, managerOnly, rejectLeave);

managerRoute.get("/holidays", verifyToken, managerOnly, getHolidays);
managerRoute.get("/getMyAttendance", verifyToken, managerOnly, getMyAttendance);
managerRoute.post("/applyLeave", verifyToken, managerOnly, applyLeave);
managerRoute.get("/getMyLeaves", verifyToken, managerOnly, getMyLeaves);
managerRoute.put("/update-profile", verifyToken, managerOnly, updateProfile);
managerRoute.get("/projects", verifyToken, managerOnly, getMyProjects);

// Get sprints of a specific project
managerRoute.get(
  "/projects/:projectId/sprints",
  verifyToken,
  managerOnly,
  getSprintsByProject,
);

export default managerRoute;