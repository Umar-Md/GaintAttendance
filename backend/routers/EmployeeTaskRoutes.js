
import express from "express";
import { verifyToken, employeeOnly } from "../middleware/authMiddleware.js";
import {
  getMyTasks,
  updateTaskStatus,
  submitTaskWork,
} from "../controllers/EmployeeTaskController.js";

const employeeTaskRouter = express.Router();

/* ===========================
   EMPLOYEE TASK ROUTES
=========================== */

// 🔹 View my tasks
employeeTaskRouter.get("/my-tasks", verifyToken, employeeOnly, getMyTasks);

// 🔹 Update task status
employeeTaskRouter.put(
  "/task/:taskId/status",
  verifyToken,
  employeeOnly,
  updateTaskStatus,
);

// 🔹 Submit work / update description
employeeTaskRouter.put(
  "/task/:taskId/work",
  verifyToken,
  employeeOnly,
  submitTaskWork,
);

export default employeeTaskRouter;