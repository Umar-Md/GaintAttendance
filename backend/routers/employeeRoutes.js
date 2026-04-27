import express from "express";
import { employeeOnly, verifyToken } from "../middleware/authMiddleware.js";
import {
  applyLeave,
  cancelLeave,
  getEmployeeProfile,
  getMyAttendance,
  getMyLeaves,
  updateProfile,
  getTeammates,
} from "../controllers/EmployeeController.js";
import { getHolidays } from "../controllers/managerController.js";

const employeeRouter = express.Router();

employeeRouter.get("/profile", verifyToken, employeeOnly, getEmployeeProfile);

employeeRouter.post("/leaveapply", verifyToken, employeeOnly, applyLeave);

employeeRouter.get("/leaves", verifyToken, employeeOnly, getMyLeaves);

employeeRouter.get("/attendance", verifyToken, employeeOnly, getMyAttendance);

employeeRouter.get("/holidays", verifyToken, employeeOnly, getHolidays);

employeeRouter.put("/update-profile", verifyToken, employeeOnly, updateProfile);

employeeRouter.get("/teammates", verifyToken, employeeOnly, getTeammates);
employeeRouter.delete(
  "/cancel-leave/:leaveId",
  verifyToken,
  employeeOnly,
  cancelLeave,
);
export default employeeRouter;
