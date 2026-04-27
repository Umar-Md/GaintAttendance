import React, { useState, useEffect } from "react";
import {
  Users,
  CheckCircle,
  CalendarDays,
  ArrowUpRight,
  Activity,
} from "lucide-react";
// import Chatbot from "../Chatbot";
import Chatbot from "../../Chatbot";

const Dashboard = ({ managers = [], attendance = [], leaves = [] }) => {
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [user, setUser] = useState(null);

  // --- 1. Fetch User Data ---
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  // --- LOGIC ---
  const activeManagersCount = managers?.filter((m) => m.status === "active").length || 0;
  const pendingLeavesCount = leaves?.filter((l) => l.status === "pending").length || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* --- STAT CARDS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Total Managers - BLUE PALETTE */}
        <div className="relative overflow-hidden bg-blue-100 p-8 rounded-[2.5rem] border border-blue-100 shadow-sm hover:shadow-[0_20px_40px_-10px_rgba(59,130,246,0.4)] hover:-translate-y-1 transition-all duration-300 group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users size={80} className="text-blue-600" />
          </div>
          <div className="flex flex-col relative z-10">
            <div className="p-3 bg-blue-100 w-fit rounded-2xl mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-blue-700 font-semibold text-2xl">
              Total Managers
            </p>
            <div className="flex items-end gap-2 mt-2">
              <p className="text-4xl font-black text-blue-900">
                {managers.length}
              </p>
              <span className="text-blue-500 text-xs font-bold flex items-center bg-white/80 px-2 py-0.5 rounded-full shadow-sm">
                <ArrowUpRight size={12} className="mr-1" /> Verified
              </span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-200/50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0" />
        </div>

        {/* Active Managers - EMERALD PALETTE */}
        <div className="relative overflow-hidden bg-emerald-200 p-8 rounded-[2.5rem] border border-emerald-100 shadow-sm hover:shadow-[0_20px_40px_-10px_rgba(16,185,129,0.4)] hover:-translate-y-1 transition-all duration-300 group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CheckCircle size={80} className="text-emerald-600" />
          </div>
          <div className="flex flex-col relative z-10">
            <div className="p-3 bg-emerald-100 w-fit rounded-2xl mb-4">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-emerald-700 font-semibold text-2xl">
              Active Managers
            </p>
            <div className="flex items-end gap-2 mt-2">
              <p className="text-4xl font-black text-emerald-900">
                {activeManagersCount}
              </p>
              <span className="text-emerald-500 text-xs font-bold flex items-center bg-white/80 px-2 py-0.5 rounded-full shadow-sm">
                <Activity size={12} className="mr-1" /> Live Now
              </span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-200/50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0" />
        </div>

        {/* Pending Leaves - AMBER PALETTE */}
        <div className="relative overflow-hidden bg-amber-100 p-8 rounded-[2.5rem] border border-amber-100 shadow-sm hover:shadow-[0_20px_40px_-10px_rgba(245,158,11,0.4)] hover:-translate-y-1 transition-all duration-300 group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CalendarDays size={80} className="text-amber-600" />
          </div>
          <div className="flex flex-col relative z-10">
            <div className="p-3 bg-amber-100 w-fit rounded-2xl mb-4">
              <CalendarDays className="w-6 h-6 text-amber-600" />
            </div>
            <p className="text-amber-700 font-semibold text-2xl">
              Pending Leaves
            </p>
            <div className="flex items-end gap-2 mt-2">
              <p className="text-4xl font-black text-amber-900">
                {pendingLeavesCount}
              </p>
              <span className="text-amber-600 text-xs font-bold bg-white/80 px-2 py-0.5 rounded-full shadow-sm">
                Needs Review
              </span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-200/50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0" />
        </div>
      </div>

      {/* --- RECENT ATTENDANCE TABLE --- */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <h3 className="text-xl font-bold text-slate-800">
            Recent Attendance Activity
          </h3>

          <button
            onClick={() => setShowAllHistory(!showAllHistory)}
            className="text-blue-600 text-sm font-bold hover:underline transition-all"
          >
            {showAllHistory ? "Hide History" : "View History"}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="text-slate-900 text-sm tracking-wider bg-slate-50">
                <th className="text-left py-5 px-8 font-bold whitespace-nowrap">Manager Name</th>
                <th className="text-left py-5 px-4 font-bold whitespace-nowrap">Log Date</th>
                <th className="text-center py-5 px-8 font-bold whitespace-nowrap">Current Status</th>
                <th className="text-left py-5 px-8 font-bold whitespace-nowrap">Check-In</th>
                <th className="text-left py-5 px-8 font-bold whitespace-nowrap">Check-Out</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {(showAllHistory ? attendance : attendance.slice(0, 5)).map((record, index) => (
                <tr
                  key={record.id || record._id || index}
                  className={`transition-colors hover:bg-blue-50/30 ${
                    index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                  }`}
                >
                  <td className="py-5 px-8">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-black uppercase">
                        {record.name?.charAt(0) || "U"}
                      </div>
                      <span className="font-bold text-slate-700">
                        {record.name || "Unknown User"}
                      </span>
                    </div>
                  </td>

                  <td className="py-5 px-4 text-slate-500 text-sm font-medium">
                    {record.date || "N/A"}
                  </td>

                  <td className="py-5 px-8">
                    <span
                      className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase block w-fit mx-auto ${
                        record.status === "Present"
                          ? "bg-emerald-100 text-emerald-700"
                          : record.status === "Incomplete"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {record.status}
                    </span>
                  </td>

                  <td className="py-5 px-8">
                    <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                      {record.checkIn || "--:--"}
                    </span>
                  </td>

                  <td className="py-5 px-8">
                    <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                      {record.checkOut || "--:--"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {attendance.length === 0 && (
            <div className="p-20 text-center text-slate-400 italic">
              No attendance records found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;