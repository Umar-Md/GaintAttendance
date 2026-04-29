import express from "express";
import {
  activateManager,
  addPublicHoliday,
  approveLeave,
  deleteManager,
  getAllHolidays,
  getEmployees,
  getHrDetails,
  getManagers,
  getManagersAttendanceForHR,
  getTeamLeaves,
  rejectLeave,
  updateProfile,
  viewAttendance,
  createProject,
  getAllProjectsForHR,
  getProjectProgress,
  permanentlyDeleteManager,
} from "../controllers/hrController.js";
import { onlyHr, verifyToken } from "../middleware/authMiddleware.js";

const hrRoute = express.Router();

hrRoute.get("/getprofile", verifyToken, onlyHr, getHrDetails);
hrRoute.get("/getManagers", verifyToken, onlyHr, getManagers);
hrRoute.get("/getEmployees", verifyToken, onlyHr, getEmployees);
hrRoute.patch("/activateManager/:id", verifyToken, onlyHr, activateManager);
hrRoute.patch("/deleteManager/:id", verifyToken, onlyHr, deleteManager);
hrRoute.delete("/manager/:id", verifyToken, onlyHr, permanentlyDeleteManager);
hrRoute.post("/addHoliday", verifyToken, onlyHr, addPublicHoliday);
hrRoute.get("/attendance", verifyToken, onlyHr, viewAttendance);
hrRoute.get("/holidays", verifyToken, onlyHr, getAllHolidays);
hrRoute.get(
  "/manager-attendance",
  verifyToken,
  onlyHr,
  getManagersAttendanceForHR,
);

hrRoute.get("/getTeamLeaves", verifyToken, onlyHr, getTeamLeaves);
hrRoute.patch("/leaves/:id/approve", verifyToken, onlyHr, approveLeave);
hrRoute.patch("/leaves/:id/reject", verifyToken, onlyHr, rejectLeave);
hrRoute.put("/update-profile", verifyToken, onlyHr, updateProfile);
// hrRoute.get("/holidays", verifyToken, onlyHr, getAllHolidays);
hrRoute.post("/project", verifyToken, onlyHr, createProject);
hrRoute.get("/projects", verifyToken, onlyHr, getAllProjectsForHR);
hrRoute.get(
  "/projects/:projectId/progress",
  verifyToken,
  onlyHr,
  getProjectProgress,
);

export default hrRoute; 
