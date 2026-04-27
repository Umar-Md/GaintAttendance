import React, { useState } from "react";
import axios from "axios";
import SubmitWorkModal from "./SubmitWorkModal";
import ProgressBar from "./ProgressBar";
import { employeeTaskURI } from "../../../mainApi";

const statusColors = {
  TODO: "bg-amber-50 text-amber-700 border-amber-100",
  IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-100",
  REVIEW: "bg-purple-50 text-purple-700 border-purple-100",
  DONE: "bg-emerald-50 text-emerald-700 border-emerald-100",
};

const EmployeeTaskCard = ({ task, reload }) => {
  const [showModal, setShowModal] = useState(false);

  const updateStatus = async (status) => {
    try {
      await axios.put(
        `${employeeTaskURI}/task/${task._id}/status`,
        { status },
        { withCredentials: true },
      );
      reload();
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  /**
   * Helper: Converts strings to Title/Camel Case for UI
   * Example: "IN_PROGRESS" -> "In Progress"
   */
  const toCamelCase = (str) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .split(/[\s_]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md hover:border-indigo-200 transition-all duration-200 flex flex-col h-full tracking-normal transform-gpu">
      {/* Header */}
      <div className="flex justify-between items-start gap-4 mb-3">
        <h3 className="font-semibold text-slate-800 leading-tight flex-1 text-lg tracking-normal">
          {toCamelCase(task.title)}
        </h3>
        <span
          className={`text-xs px-2.5 py-1 rounded-lg border whitespace-nowrap tracking-normal ${statusColors[task.status]}`}
        >
          {toCamelCase(task.status)}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-500 line-clamp-2 mb-4 tracking-normal">
        {task.description ? toCamelCase(task.description) : "No Description Provided"}
      </p>

      {/* Project Info */}
      <div className="flex items-center gap-2 mb-4 bg-slate-50 p-2 rounded-lg border border-slate-100">
        <div className="h-1.5 w-1.5 rounded-full bg-indigo-400"></div>
        <p className="text-xs text-slate-500 tracking-normal">
          {toCamelCase("project")}:{" "}
          <span className="font-medium text-slate-700">
            {task.projectId?.name ? toCamelCase(task.projectId.name) : "Unassigned"}
          </span>
        </p>
      </div>

      <hr className="border-slate-100 mb-4" />

      {/* Progress Section */}
      <div className="space-y-2 mb-5">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-slate-600 tracking-normal">
            {toCamelCase("progress")}
          </span>
          <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md tracking-normal">
            {task.progress}%
          </span>
        </div>
        <ProgressBar value={task.progress} />
        <p className="text-[11px] text-slate-400 font-normal tracking-normal">
          {toCamelCase("current stage")}: {toCamelCase(task.status)}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mt-auto">
        <p className="text-[11px] font-medium text-slate-400 mb-2 tracking-normal">
          {toCamelCase("move to")}
        </p>
        <div className="flex flex-wrap gap-2 mb-5">
          {["TODO", "IN_PROGRESS", "REVIEW", "DONE"].map(
            (status) =>
              task.status !== status && (
                <button
                  key={status}
                  onClick={() => updateStatus(status)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 font-medium text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-colors tracking-normal"
                >
                  {toCamelCase(status)}
                </button>
              ),
          )}
        </div>

        {/* Attachments */}
        {task.attachments?.length > 0 && (
          <div className="mb-5 bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200">
            <p className="text-[11px] font-medium text-slate-500 mb-2 flex items-center gap-1 tracking-normal">
              <span>📎</span> {toCamelCase("attachments")} ({task.attachments.length})
            </p>
            <ul className="space-y-1.5">
              {task.attachments.map((file, i) => (
                <li key={i} className="flex items-center">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-indigo-600 font-normal hover:text-indigo-800 transition-colors truncate tracking-normal"
                  >
                    {toCamelCase(file.name)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Submit Work Button - Stabilized */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowModal(true);
          }}
          className="w-full text-sm font-medium py-2.5 rounded-xl bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all duration-200 active:scale-[0.98] will-change-transform shadow-sm tracking-normal"
        >
          {toCamelCase("submit or update work")}
        </button>
      </div>

      {showModal && (
        <SubmitWorkModal
          task={task}
          close={() => setShowModal(false)}
          reload={reload}
        />
      )}
    </div>
  );
};

export default EmployeeTaskCard;