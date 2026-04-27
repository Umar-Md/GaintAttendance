import Task from "../models/Task.js";
import Activity from "../models/Activity.js";

/* ===========================
   GET MY TASKS
=========================== */
export const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.userId })
      .populate("projectId", "name key")
      .populate("sprintId", "name")
      .sort({ updatedAt: -1 });

    res.json({ data: tasks });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
};

/* ===========================
   UPDATE TASK STATUS
=========================== */
export const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    const statusProgressMap = {
      BACKLOG: 0,
      TODO: 10,
      IN_PROGRESS: 50,
      REVIEW: 80,
      DONE: 100,
    };

    const task = await Task.findOneAndUpdate(
      { _id: taskId, assignedTo: req.userId },
      {
        status,
        progress: statusProgressMap[status],
      },
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

    res.json({ task });
  } catch (err) {
    res.status(500).json({ message: "Status update failed" });
  }
};

/* ===========================
   SUBMIT WORK (DESC + FILES)
=========================== */
export const submitTaskWork = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { description, attachments, progress } = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: taskId, assignedTo: req.userId },
      {
        description,
        progress,
        $push: { attachments: { $each: attachments || [] } },
      },
      { new: true },
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await Activity.create({
      userId: req.userId,
      taskId: task._id,
      action: "TASK_UPDATED",
    });

    res.json({ task });
  } catch (err) {
    res.status(500).json({ message: "Submit work failed" });
  }
};