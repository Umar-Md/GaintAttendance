import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { managerTaskURI, managerURI } from "../../../mainApi";
import { ChevronLeft, Plus, Rocket, CalendarDays, ChevronRight, ChevronDown } from "lucide-react";

import TaskColumn from "../TaskColumn";
import CreateTaskModal from "../CreateTaskModal";
import CreateSprintModal from "./CreateSprintModal";
import ProgressBar from "./ProgressBar";

const ProjectTaskBoard = ({ project, back }) => {
  const [tasks, setTasks] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [activeSprintId, setActiveSprintId] = useState("");
  const [sprintProgress, setSprintProgress] = useState(0);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showSprintModal, setShowSprintModal] = useState(false);

  // Reusable Calculation Logic
  const calculateProgress = useCallback((allTasks) => {
    if (!allTasks || allTasks.length === 0) return 0;

    const totalPossibleWeight = allTasks.length * 100;
    const currentWeight = allTasks.reduce((acc, task) => {
      if (task.status === "DONE") return acc + 100;
      if (task.status === "IN_PROGRESS") return acc + 50;
      return acc;
    }, 0);

    return Math.round((currentWeight / totalPossibleWeight) * 100);
  }, []);

  const loadSprints = async () => {
    try {
      const res = await axios.get(`${managerURI}/projects/${project._id}/sprints`, { withCredentials: true });
      const sprintList = res.data.data || [];
      setSprints(sprintList);
      if (!activeSprintId && sprintList.length) {
        setActiveSprintId(sprintList[0]._id);
      }
    } catch (err) {
      console.error("Error loading sprints:", err);
    }
  };

  const loadTasks = async () => {
    if (!activeSprintId) return;
    try {
      const res = await axios.get(`${managerTaskURI}/sprint/${activeSprintId}`, { withCredentials: true });
      const fetchedTasks = res.data.data || [];
      setTasks(fetchedTasks);
      
      // Update local sprint health
      setSprintProgress(calculateProgress(fetchedTasks));
    } catch (err) {
      console.error("Error loading tasks:", err);
    }
  };

  useEffect(() => { loadSprints(); }, [project]);
  useEffect(() => { loadTasks(); }, [activeSprintId]);

  const todo = tasks.filter((t) => t.status === "TODO");
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS");
  const done = tasks.filter((t) => t.status === "DONE");

  return (
    <div className="max-w-350 mx-auto p-4 md:p-8 animate-in fade-in duration-500 font-sans">
      <style>{`
        @keyframes arrow-flow-h {
          0% { transform: translateX(-5px); opacity: 0.2; }
          50% { transform: translateX(5px); opacity: 1; color: #6366f1; }
          100% { transform: translateX(-5px); opacity: 0.2; }
        }
        @keyframes arrow-flow-v {
          0% { transform: translateY(-5px); opacity: 0.2; }
          50% { transform: translateY(5px); opacity: 1; color: #6366f1; }
          100% { transform: translateY(-5px); opacity: 0.2; }
        }
        .animate-flow-h { animation: arrow-flow-h 2s infinite ease-in-out; }
        .animate-flow-v { animation: arrow-flow-v 2s infinite ease-in-out; }
      `}</style>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div className="space-y-2">
          <button onClick={back} className="group flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Projects
          </button>
          <h2 className="text-2xl md:text-4xl font-black text-slate-800">{project.name}</h2>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm w-full lg:w-80">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-[11px] sm:text-[12px] font-black text-slate-400 flex items-center gap-1">
              <Rocket className="w-3 h-3 text-indigo-500" /> Sprint Health
            </h4>
            <span className="text-sm font-black text-indigo-600">{sprintProgress}%</span>
          </div>
          <ProgressBar value={sprintProgress} />
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-slate-100/80 backdrop-blur-sm border border-slate-200 p-3 sm:p-4 rounded-2xl sm:rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 mb-8 sm:mb-10">
        <div className="relative w-full md:w-72 group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10 pointer-events-none">
            <CalendarDays className="w-4 h-4 text-indigo-500" />
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <select
            className="w-full pl-14 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-50 appearance-none shadow-sm cursor-pointer transition-all hover:border-indigo-300"
            value={activeSprintId}
            onChange={(e) => setActiveSprintId(e.target.value)}
          >
            {sprints.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors pointer-events-none" />
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={() => setShowSprintModal(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95">
            <Plus className="w-4 h-4 text-emerald-500" /> Sprint
          </button>
          <button onClick={() => setShowTaskModal(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95">
            <Plus className="w-4 h-4" /> Task
          </button>
        </div>
      </div>

      {/* Board Layout */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-start gap-2 lg:gap-4">
        <div className="w-full lg:flex-1">
          <TaskColumn statusKey="TODO" tasks={todo} reload={loadTasks} />
        </div>

        <div className="flex items-center justify-center py-4 lg:py-0 lg:h-20 text-slate-300">
          <ChevronRight className="w-6 h-6 hidden lg:block animate-flow-h" />
          <ChevronDown className="w-6 h-6 lg:hidden animate-flow-v" />
        </div>

        <div className="w-full lg:flex-1">
          <TaskColumn statusKey="IN_PROGRESS" tasks={inProgress} reload={loadTasks} />
        </div>

        <div className="flex items-center justify-center py-4 lg:py-0 lg:h-20 text-slate-300">
          <ChevronRight className="w-6 h-6 hidden lg:block animate-flow-h" />
          <ChevronDown className="w-6 h-6 lg:hidden animate-flow-v" />
        </div>

        <div className="w-full lg:flex-1">
          <TaskColumn statusKey="DONE" tasks={done} reload={loadTasks} />
        </div>
      </div>

      {showTaskModal && <CreateTaskModal close={() => setShowTaskModal(false)} reload={loadTasks} projectId={project._id} sprintId={activeSprintId} />}
      {showSprintModal && <CreateSprintModal close={() => setShowSprintModal(false)} projectId={project._id} onSprintCreated={loadSprints} />}
    </div>
  );
};

export default ProjectTaskBoard;