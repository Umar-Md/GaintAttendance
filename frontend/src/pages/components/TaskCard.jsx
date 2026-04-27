import React from "react";
import axios from "axios";
import { managerTaskURI } from "../../mainApi";
import { User, ArrowRightLeft } from "lucide-react";

const TaskCard = ({ task, reload }) => {
  const updateStatus = async (status) => {
    try {
      await axios.patch(
        `${managerTaskURI}/task/${task._id}/status`,
        { status },
        { withCredentials: true },
      );
      reload();
    } catch (err) {
      console.error("Status update failed", err);
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 group">
      {/* Title */}
      <h4 className="font-bold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors">
        {task.title}
      </h4>
      
      {/* Description */}
      <p className="text-sm text-slate-500 mt-2 line-clamp-2 italic">
        {task.description || "No description provided"}
      </p>

      {/* Assignee Tag */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50">
        <div className="bg-slate-100 p-1.5 rounded-full">
          <User className="w-3 h-3 text-slate-500" />
        </div>
        <span className="text-xs font-semibold text-slate-600">
          {task.assignedTo?.userName || "Unassigned"}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="mt-5">
        <div className="flex items-center gap-2 mb-2">
          <ArrowRightLeft className="w-3 h-3 text-slate-400" />
          <span className="text-[12px] font-bold text-slate-400">Move to</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {["TODO", "IN_PROGRESS", "DONE"].map(
            (s) =>
              s !== task.status && (
                <button
                  key={s}
                  onClick={() => updateStatus(s)}
                  className="text-[11px] px-3 py-1.5 font-bold rounded-lg border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all active:scale-95"
                >
                  {s.replace("_", " ")}
                </button>
              ),
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;