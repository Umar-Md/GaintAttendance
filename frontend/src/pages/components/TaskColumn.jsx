import React from "react";
import TaskCard from "./TaskCard";
import { Circle, Clock, CheckCircle2 } from "lucide-react";

const LABELS = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

// Map icons and colors to the status keys for a professional look
const STATUS_STYLES = {
  TODO: {
    icon: <Circle className="w-4 h-4 text-slate-400" />,
    border: "border-t-slate-400",
    bg: "bg-slate-100/50",
  },
  IN_PROGRESS: {
    icon: <Clock className="w-4 h-4 text-amber-500" />,
    border: "border-t-amber-500",
    bg: "bg-amber-50/30",
  },
  DONE: {
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
    border: "border-t-emerald-500",
    bg: "bg-emerald-50/30",
  },
};

const TaskColumn = ({ statusKey, tasks, reload }) => {
  const style = STATUS_STYLES[statusKey];

  return (
    <div className={`flex flex-col rounded-xl border-t-4 ${style.border} ${style.bg} min-h-125 transition-all`}>
      {/* Column Header */}
      <div className="p-4 flex items-center rounded-4xl justify-between sticky top-0 z-10 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          {style.icon}
          <h3 className="font-black text-slate-700 text-m">
            {LABELS[statusKey]}
          </h3>
        </div>
        
        {/* Task Counter Badge */}
        <span className="bg-white border border-slate-200 text-slate-500 text-[12px] font-bold px-2 py-0.5 rounded-full shadow-sm">
          {tasks.length}
        </span>
      </div>

      {/* Task List Container */}
      <div className="px-3 pb-4 flex flex-col gap-3 h-full overflow-y-auto max-h-[70vh] scrollbar-hide">
        {tasks.length ? (
          tasks.map((t) => (
            <div key={t._id} className="animate-in slide-in-from-bottom-2 duration-300">
              <TaskCard task={t} reload={reload} />
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 opacity-40">
            <div className="w-10 h-10 rounded-full border-2 border-dashed border-slate-900 mb-2" />
            <p className="text-[14px] font-bold text-slate-900">
              Empty
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskColumn;