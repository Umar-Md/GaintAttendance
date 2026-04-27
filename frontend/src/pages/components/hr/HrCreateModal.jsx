import React, { useEffect, useState } from "react";
import axios from "axios";
import { hrURI } from "../../../mainApi";
import { X, Briefcase, Key, AlignLeft, UserCircle2 } from "lucide-react";

const CreateProjectModal = ({ close, reload }) => {
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [managerId, setManagerId] = useState("");
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);

  /* 🔹 Load Managers - Logic Preserved Exactly */
  useEffect(() => {
    const loadManagers = async () => {
      try {
        const res = await axios.get(`${hrURI}/getManagers`, {
          withCredentials: true,
        });
        setManagers(res.data.data || []);
      } catch (err) {
        console.error("Failed to load managers", err);
      }
    };
    loadManagers();
  }, []);

  const createProject = async () => {
    if (!name || !key || !managerId) {
      return alert("Name, Key & Manager are required");
    }

    setLoading(true);
    try {
      await axios.post(
        `${hrURI}/project`,
        { name, key, description, managerId },
        { withCredentials: true },
      );

      reload();
      close();
    } catch (err) {
      alert("Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-60 transition-opacity duration-300"
        onClick={close}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 flex items-center justify-center z-70 p-4 sm:p-6">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
          
          {/* Header */}
          <div className="px-5 py-4 sm:px-6 sm:py-5 border-b bg-blue-100 border-blue-200 flex justify-between items-center shrink-0">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800">Create Project</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Initialize a new project workspace</p>
            </div>
            <button 
              onClick={close}
              className="p-2 rounded-full hover:bg-blue-200 text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content - Scrollable for small screens */}
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
            
            {/* Project Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-500 flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5" /> Project Name
              </label>
              <input
                className="w-full border border-slate-200 bg-slate-50/50 p-3 rounded-xl text-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-400"
                placeholder="e.g. Enterprise CRM"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Project Key */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-500 flex items-center gap-2">
                <Key className="w-3.5 h-3.5" /> Project Key
              </label>
              <input
                className="w-full border border-slate-200 bg-slate-50/50 p-3 rounded-xl text-sm font-mono focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-400"
                placeholder="e.g. CRM"
                value={key}
                onChange={(e) => setKey(e.target.value.toUpperCase())}
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-500 flex items-center gap-2">
                <AlignLeft className="w-3.5 h-3.5" /> Description
              </label>
              <textarea
                className="w-full border border-slate-200 bg-slate-50/50 p-3 rounded-xl text-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-400 resize-none"
                placeholder="Briefly explain the project goals..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Manager Assignment */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-500 flex items-center gap-2">
                <UserCircle2 className="w-3.5 h-3.5" /> Assign Manager
              </label>
              <div className="relative">
                <select
                  className="w-full border border-slate-200 bg-slate-50/50 p-3 rounded-xl text-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none transition-all appearance-none cursor-pointer text-slate-700"
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                >
                  <option value="" className="text-slate-400">Select a project lead...</option>
                  {managers.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.userName} — {m.email}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-5 py-4 sm:px-6 sm:py-5 bg-blue-100 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0">
            <button 
              onClick={close} 
              className="w-full sm:w-auto px-5 py-2.5 text-sm font-bold bg-red-600 text-white hover:bg-red-700 rounded-xl transition-all active:scale-95"
            >
              Cancel
            </button>

            <button
              onClick={createProject}
              disabled={loading}
              className="w-full sm:w-auto px-8 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-green-200 hover:bg-green-700 active:scale-95 disabled:opacity-50 disabled:shadow-none disabled:active:scale-100 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateProjectModal;  