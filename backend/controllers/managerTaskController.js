// import Task from "../models/Task.js";
// import Activity from "../models/Activity.js";

import Activity from "../models/Activity.js";
import Project from "../models/Project.js";
import Sprint from "../models/Sprint.js";
import Task from "../models/Task.js";

/**
 * @desc Create a new task
 * @route POST /manager/task
 * @access Manager only
 */
export const createTask = async (req, res) => {
  const { projectId, sprintId, title, description, assignedTo, priority } =
    req.body;

  try {
    const task = await Task.create({
      projectId,
      sprintId,
      title,
      description,
      assignedTo,
      priority,
      status: "TODO", // ✅ MATCHES ENUM in Task model
      createdBy: req.userId,
    });

    await Activity.create({
      userId: req.userId,
      taskId: task._id,
      action: "TASK_CREATED",
    });

    res.json({ message: "Task created", task });
  } catch (err) {
    console.error(err);
    res
      .status(400)
      .json({ message: "Task creation failed", error: err.message });
  }
};

/**
 * @desc Update task status
 * @route PATCH /manager/task/:id/status
 * @access Manager only
 */
export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // validate status manually (extra safety)
    const allowedStatus = ["BACKLOG", "TODO", "IN_PROGRESS", "REVIEW", "DONE"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await Activity.create({
      userId: req.userId,
      taskId: task._id,
      action: `STATUS_CHANGED_TO_${status}`,
    });

    res.json({
      message: "Task status updated successfully",
      task,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getTasksByProject = async (req, res) => {
  const tasks = await Task.find({
    projectId: req.params.projectId,
  }).populate("assignedTo", "userName email");

  res.json({ data: tasks });
};

export const getTasksBySprint = async (req, res) => {
  const tasks = await Task.find({
    sprintId: req.params.sprintId,
  }).populate("assignedTo", "userName email");

  res.json({ data: tasks });
};

export const createSprint = async (req, res) => {
  const { projectId } = req.params;
  const { name, startDate, endDate } = req.body;

  if (!startDate || !endDate) {
    return res.status(400).json({ message: "Start and end date are required" });
  }

  try {
    const sprint = await Sprint.create({
      projectId,
      name: name || `Sprint ${new Date().toLocaleDateString()}`,
      startDate,
      endDate,
      status: "Planned",
    });

    res.status(201).json({ message: "Sprint created", sprint });
  } catch (err) {
    console.error("Sprint creation error:", err);
    res.status(500).json({ message: "Failed to create sprint" });
  }
};

// controllers/ManagerTaskController.js

export const getSprintProgress = async (req, res) => {
  const { sprintId } = req.params;

  const totalTasks = await Task.countDocuments({ sprintId });
  const doneTasks = await Task.countDocuments({
    sprintId,
    status: "DONE",
  });

  const percentage =
    totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  res.json({
    data: {
      sprintId,
      totalTasks,
      doneTasks,
      percentage,
    },
  });
};

export const getProjectProgress = async (req, res) => {
  const { projectId } = req.params;

  const sprints = await Sprint.find({ projectId });

  if (!sprints.length) {
    return res.json({
      data: { percentage: 0, totalSprints: 0, completedSprints: 0 },
    });
  }

  let completed = 0;

  for (const sprint of sprints) {
    const totalTasks = await Task.countDocuments({
      sprintId: sprint._id,
    });
    const doneTasks = await Task.countDocuments({
      sprintId: sprint._id,
      status: "DONE",
    });

    if (totalTasks > 0 && totalTasks === doneTasks) {
      completed++;
    }
  }

  const percentage = Math.round((completed / sprints.length) * 100);

  res.json({
    data: {
      totalSprints: sprints.length,
      completedSprints: completed,
      percentage,
    },
  });
};