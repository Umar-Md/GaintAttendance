import React, { useEffect, useState } from "react";
import axios from "axios";
import { managerTaskURI, managerURI } from "../../mainApi";
import { X, Type, AlignLeft, UserPlus, Send } from "lucide-react";

const CreateTaskModal = ({ close, reload, projectId, sprintId }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  /* 🔹 Logic Preserved Exactly */
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const res = await axios.get(`${managerURI}/employees`, {
          withCredentials: true,
        });
        setEmployees(res.data.data || []);
      } catch (err) {
        console.error("Failed to load employees", err);
      }
    };
    loadEmployees();
  }, []);

  const createTask = async () => {
    if (!title || !assignedTo || !projectId || !sprintId) {
      return alert("Missing required fields");
    }

    setLoading(true);
    try {
      await axios.post(
        `${managerTaskURI}/task`,
        {
          title,
          description,
          assignedTo,
          projectId,
          sprintId,
        },
        { withCredentials: true },
      );

      reload();
      close();
    } catch (err) {
      console.error(err);
      alert("Task creation failed");
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

      {/* Modal */}
      <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-green-200 flex justify-between items-center bg-blue-100">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Create Task</h2>
              <p className="text-xs text-slate-500 mt-0.5">Assign a new objective to your team</p>
            </div>
            <button 
              onClick={close}
              className="p-2 rounded-full hover:bg-slate-200 text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <div className="p-6 space-y-5">
            
            {/* Task Title */}
            <div className="space-y-1.5">
              <label className="text-[14px] font-bold text-slate-500   flex items-center gap-2">
                <Type className="w-3 h-3" /> Task Title
              </label>
              <input
                className="w-full border border-slate-200 bg-slate-50/50 p-3 rounded-xl text-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-400"
                placeholder="e.g. Implement Login API"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[14px] font-bold text-slate-500   flex items-center gap-2">
                <AlignLeft className="w-3 h-3" /> Description
              </label>
              <textarea
                className="w-full border border-slate-200 bg-slate-50/50 p-3 rounded-xl text-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-400 resize-none"
                placeholder="Detailed breakdown of the task..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Assignment */}
            <div className="space-y-1.5">
              <label className="text-[14px] font-bold text-slate-500   flex items-center gap-2">
                <UserPlus className="w-3 h-3" /> Assign Employee
              </label>
              <div className="relative">
                <select
                  className="w-full border border-slate-200 bg-slate-50/50 p-3 rounded-xl text-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none transition-all appearance-none cursor-pointer text-slate-700"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                >
                  <option value="">Select team member...</option>
                  {employees.map((e) => (
                    <option key={e._id} value={e._id}>
                      {e.userName}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-5 bg-blue-200 border-t border-green-200 flex justify-end gap-3">
            <button 
              onClick={close}
              className="px-5 py-2.5 text-sm font-bold bg-red-600 text-white hover:bg-red-700 rounded-xl transition-all"
            >
              Cancel
            </button>

            <button
              onClick={createTask}
              disabled={loading}
              className="px-8 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-green-100 hover:bg-green-700 active:scale-95 disabled:opacity-50 disabled:shadow-none transition-all flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Create Task
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateTaskModal;