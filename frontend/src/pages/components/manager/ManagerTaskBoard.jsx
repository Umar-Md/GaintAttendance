import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { managerTaskURI, managerURI } from "../../../mainApi";
import ProjectTaskBoard from "./ProjectTaskBoard";
import ProgressBar from "./ProgressBar";
import { FolderKanban, ArrowRight, LayoutDashboard, Loader2, AlertCircle } from "lucide-react";

const ManagerTaskBoard = () => {
  const [projects, setProjects] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${managerURI}/projects`, { withCredentials: true });
      const projectList = res.data.data || [];
      setProjects(projectList);

      const results = await Promise.all(
        projectList.map(async (p) => {
          try {
            const taskRes = await axios.get(`${managerTaskURI}/project/${p._id}`, { withCredentials: true });
            const allTasks = taskRes.data.data || [];

            if (allTasks.length === 0) return { id: p._id, percentage: 0 };

            const currentWeight = allTasks.reduce((acc, task) => {
              if (task.status === "DONE") return acc + 100;
              if (task.status === "IN_PROGRESS") return acc + 50;
              return acc;
            }, 0);

            return { 
              id: p._id, 
              percentage: Math.round((currentWeight / (allTasks.length * 100)) * 100) 
            };
          } catch (err) {
            console.error(`Error calculating progress for ${p.name}:`, err);
            return { id: p._id, percentage: 0 };
          }
        })
      );

      const newProgressMap = results.reduce((acc, curr) => {
        acc[curr.id] = curr.percentage;
        return acc;
      }, {});

      setProgressMap(newProgressMap);
    } catch (err) {
      console.error("Load projects main error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  if (selectedProject) {
    return (
      <ProjectTaskBoard
        project={selectedProject}
        back={() => {
          setSelectedProject(null);
          loadProjects(); 
        }}
      />
    );
  }

  return (
    <div className="p-4 sm:p-8 bg-slate-50/50 min-h-screen font-sans">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center gap-3">
            <LayoutDashboard className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-600" />
            My Projects
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Overall project progress based on all associated sprints.
          </p>
        </div>
        <div className="flex items-center">
          {loading && (
            <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Updating...</span>
            </div>
          )}
        </div>
      </div>

      {/* PROJECT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {projects.length === 0 && !loading && (
          <div className="col-span-full py-16 sm:py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 px-4">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No projects assigned yet.</p>
          </div>
        )}

        {projects.map((project) => {
          const progress = progressMap[project._id] || 0;
          
          return (
            <div 
              key={project._id} 
              className="group bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                  <FolderKanban className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded">
                  {project.key || "PROJ"}
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 mb-2 truncate">
                {project.name}
              </h3>
              <p className="text-sm text-slate-500 line-clamp-2 mb-6 grow">
                {project.description || "No description provided."}
              </p>

              <div className="space-y-3 pt-4 border-t border-slate-50">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-slate-400">Overall Progress</span>
                  <span className="text-sm font-black text-indigo-600">
                    {progress}%
                  </span>
                </div>
                <ProgressBar value={progress} />
              </div>

              <button
                onClick={() => setSelectedProject(project)}
                className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-50 text-slate-700 font-bold text-sm hover:bg-indigo-600 hover:text-white transition-all duration-200 active:scale-95"
              >
                View Board <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ManagerTaskBoard;  