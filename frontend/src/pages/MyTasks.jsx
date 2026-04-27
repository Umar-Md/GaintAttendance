import React, { useEffect, useState } from "react";
import { employeeTaskURI } from "../mainApi";
import EmployeeTaskCard from "../pages/components/employee/EmployeeTaskCard";
import axios from "axios";
import { ClipboardList, Sparkles, CheckCircle, Clock } from "lucide-react";

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMyTasks = async () => {
    try {
      const res = await axios.get(`${employeeTaskURI}/my-tasks`, {
        withCredentials: true,
      });
      setTasks(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyTasks();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
        <div className="relative">
          <div className="h-12 w-12 border-4 border-indigo-100 rounded-full" />
          <div className="absolute top-0 h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-slate-400 font-medium animate-pulse">Gathering your tasks...</p>
      </div>
    );
  }

  // Quick stats calculations
  const completedTasks = tasks.filter(t => t.status === "DONE").length;
  const pendingTasks = tasks.length - completedTasks;

  return (
    <div className="p-8 bg-slate-50/30 min-h-screen">
      {/* 🔹 HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-200">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">My Tasks</h2>
          </div>
          <p className="text-slate-500 font-medium">Manage your personal workflow and daily objectives.</p>
        </div>

        {/* 🔹 QUICK STATS PILLS */}
        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-2xl shadow-sm">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-bold text-slate-600">{pendingTasks} Pending</span>
          </div>
          <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-2xl shadow-sm">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-bold text-slate-600">{completedTasks} Done</span>
          </div>
        </div>
      </div>

      {/* 🔹 CONTENT SECTION */}
      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-sm transition-all hover:border-indigo-200">
          <div className="bg-slate-50 p-6 rounded-full mb-4">
            <Sparkles className="w-10 h-10 text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-700">Clear Workspace</h3>
          <p className="text-slate-400 mt-1">You’ve crushed all your tasks! Take a moment to breathe.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {tasks.map((task) => (
            <div key={task._id} className="hover:scale-[1.02] transition-transform duration-300">
              <EmployeeTaskCard task={task} reload={loadMyTasks} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTasks;