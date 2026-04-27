import React, { useEffect, useState } from "react";
import axios from "axios";
import { hrURI } from "../../../mainApi";
import CreateProjectModal from "./HrCreateModal";
import { Plus, User, FolderKanban } from "lucide-react";

const HrCreateProject = () => {
  const [projects, setProjects] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [showModal, setShowModal] = useState(false);

  const loadProjects = async () => {
    try {
      const res = await axios.get(`${hrURI}/projects`, {
        withCredentials: true,
      });

      const list = res.data.projects || [];
      setProjects(list);

      // 🔹 Load progress for each project
      list.forEach((p) => loadProgress(p._id));
    } catch (err) {
      console.error("Failed to load projects", err);
    }
  };

  const loadProgress = async (projectId) => {
    try {
      const res = await axios.get(`${hrURI}/projects/${projectId}/progress`, {
        withCredentials: true,
      });

      setProgressMap((prev) => ({
        ...prev,
        [projectId]: res.data.data.percentage,
      }));
    } catch (err) {
      console.error("Progress fetch error", err);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <div className="p-4 sm:p-8 bg-slate-50 min-h-screen font-sans">
      {/* 🔹 HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center gap-3">
            <FolderKanban className="text-indigo-600 w-7 h-7 sm:w-8 sm:h-8" />
            Projects
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage and track company-wide initiatives</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 active:scale-95 text-sm sm:text-base"
        >
          <Plus className="w-5 h-5" />
          Create Project
        </button>
      </div>

      {/* 🔹 PROJECT LIST GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {projects.map((project) => {
          const progress = progressMap[project._id] ?? 0;

          return (
            <div 
              key={project._id} 
              className="group bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h2 className="font-bold text-lg sm:text-xl text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {project.name}
                  </h2>
                  <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-2 py-1 rounded shrink-0">
                    {project.key}
                  </span>
                </div>
                
                <p className="text-sm text-slate-500 line-clamp-2 mb-6 min-h-10">
                  {project.description || "No description provided for this project."}
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-slate-600">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="font-medium text-sm">Manager:</span>
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md text-[13px] sm:text-[14px] font-semibold truncate">
                      {project.managerId?.userName || "Unassigned"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                {/* 🔹 PROGRESS SECTION */}
                <div className="pt-4 border-t border-slate-50">
                  <div className="flex justify-between items-end text-sm mb-2">
                    <span className="text-slate-400 font-bold">Completion</span>
                    <span className={`font-black ${progress === 100 ? "text-green-600" : "text-indigo-600"}`}>
                      {progress}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2 sm:h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${
                        progress === 100 ? "bg-green-500" : "bg-indigo-600"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${progress === 100 ? "bg-green-500" : "bg-amber-400 animate-pulse"}`} />
                    <span className="text-[12px] font-bold text-slate-400">
                      {project.status || (progress === 100 ? 'Completed' : 'Active')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {projects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <FolderKanban className="w-16 h-16 opacity-20 mb-4" />
          <p className="text-lg font-medium italic">No projects found.</p>
        </div>
      )}

      {showModal && (
        <CreateProjectModal
          close={() => setShowModal(false)}
          reload={loadProjects}
        />
      )}
    </div>
  );
};

export default HrCreateProject;