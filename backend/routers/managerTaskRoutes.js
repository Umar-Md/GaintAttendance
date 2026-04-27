import express from "express";
// import { createTask, updateTaskStatus } from "../controllers/taskController.js";
import { verifyToken, managerOnly } from "../middleware/authMiddleware.js";
import {
  createSprint,
  createTask,
  getProjectProgress,
  getSprintProgress,
  getTasksByProject,
  getTasksBySprint,
  updateTaskStatus,
} from "../controllers/managerTaskController.js";

const managerTaskrouter = express.Router();

/**
 * Manager creates task
 */
managerTaskrouter.post("/task", verifyToken, managerOnly, createTask);
managerTaskrouter.get("/tasks", verifyToken, managerOnly, getTasksByProject);
managerTaskrouter.get("/project/:projectId", verifyToken, managerOnly, getTasksByProject);
managerTaskrouter.get(
  "/sprint/:sprintId",
  verifyToken,
  managerOnly,
  getTasksBySprint,
);

managerTaskrouter.post(
  "/projects/:projectId/sprint",
  verifyToken,
  managerOnly,
  createSprint,
);

managerTaskrouter.patch(
  "/task/:id/status",
  verifyToken,
  managerOnly,
  updateTaskStatus,
);

managerTaskrouter.get(
  "/sprint/:sprintId/progress",
  verifyToken,
  managerOnly,
  getSprintProgress,
);

managerTaskrouter.get(
  "/project/:projectId/progress",
  verifyToken,
  managerOnly,
  getProjectProgress,
);

export default managerTaskrouter;