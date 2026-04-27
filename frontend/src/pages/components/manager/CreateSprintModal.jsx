import React, { useState } from "react";
import axios from "axios";
import { managerTaskURI } from "../../../mainApi";
import { X, Calendar, Rocket, CalendarRange } from "lucide-react";

const CreateSprintModal = ({ close, projectId, onSprintCreated }) => {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ ADD: today date to block past dates
  const today = new Date().toISOString().split("T")[0];

  // Logic preserved exactly
  const createSprint = async () => {
    if (!name || !startDate || !endDate) {
      return alert("All fields are required");
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${managerTaskURI}/projects/${projectId}/sprint`,
        { name, startDate, endDate },
        { withCredentials: true },
      );

      onSprintCreated(res.data.sprint);
      close();
    } catch (err) {
      console.error("Sprint creation failed", err);
      alert("Sprint creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-60 transition-opacity" 
        onClick={close} 
      />

      {/* Modal */}
      <div className="fixed inset-0 z-70 flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
          
          {/* Header */}
          <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
            <div className="flex items-center gap-2 text-slate-800">
              <Rocket className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-bold">New Sprint</h3>
            </div>
            <button 
              onClick={close}
              className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
            {/* Sprint Name */}
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1.5">
                Sprint Name
              </label>
              <input
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl p-3 text-sm focus:ring-4 focus:ring-green-50 focus:border-green-600 outline-none transition-all placeholder:text-slate-400"
                placeholder="e.g. Q1 Beta Launch"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-1.5 text-sm font-bold text-slate-500 mb-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Start Date
                </label>
                <input
                  type="date"
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-xl p-3 text-sm focus:ring-4 focus:ring-green-50 focus:border-green-600 outline-none transition-all text-slate-700"
                  value={startDate}
                  min={today}               // ✅ PAST DATES BLOCKED
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-sm font-bold text-slate-500 mb-1.5">
                  <CalendarRange className="w-3.5 h-3.5" /> End Date
                </label>
                <input
                  type="date"
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-xl p-3 text-sm focus:ring-4 focus:ring-green-50 focus:border-green-600 outline-none transition-all text-slate-700"
                  value={endDate}
                  min={startDate || today}  // ✅ CANNOT SELECT BEFORE START DATE
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 sm:px-6 sm:py-5 bg-slate-50 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0">
            <button
              onClick={close}
              className="w-full sm:w-auto px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-all"
            >
              Cancel
            </button>

            <button
              onClick={createSprint}
              disabled={loading}
              className="w-full sm:w-auto px-8 py-2.5 text-sm font-bold rounded-xl bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-100 active:scale-95 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Launch Sprint</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateSprintModal;
