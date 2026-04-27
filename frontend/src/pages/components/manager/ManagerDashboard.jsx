import React from "react";
import { Users, CheckCircle, CalendarDays } from "lucide-react";
import Chatbot from "../../Chatbot";

const ManagerDashboard = ({ user, attendance = [], leaves = [], team = [] }) => {
  const formatTime = (time) =>
    time
      ? new Date(time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

  // --- LOGIC: Filter active team members ---
  const activeTeamCount = team.filter((member) => member.status === "active").length;

  return (
    <div className="space-y-8">
      {user && <Chatbot user={user} />}
      
      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Team - Blue Palette */}
        <div className="relative overflow-hidden bg-blue-50 p-6 rounded-2xl border border-blue-100 shadow-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_20px_40px_-10px_rgba(59,130,246,0.4)] cursor-default group">
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-blue-700 text-[14px] font-bold">Total Team</p>
              <p className="text-3xl font-black text-blue-900 mt-1">{team.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Active Today - Emerald Palette */}
        <div className="relative overflow-hidden bg-emerald-50 p-6 rounded-2xl border border-emerald-100 shadow-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_20px_40px_-10px_rgba(16,185,129,0.4)] cursor-default group">
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-emerald-700 text-[14px] font-bold">Active Today</p>
              <p className="text-3xl font-black text-emerald-900 mt-1">
                {activeTeamCount}
              </p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-xl">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Pending Leaves Section Commented Out 
        <div className="relative overflow-hidden bg-amber-50 p-6 rounded-2xl border border-amber-100 shadow-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_20px_40px_-10px_rgba(245,158,11,0.4)] cursor-default group">
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-amber-700 text-[14px] font-bold">Pending Leaves</p>
              <p className="text-3xl font-black text-amber-900 mt-1">
                {leaves.filter((l) => l.status === "pending").length}
              </p>
            </div>
            <div className="p-3 bg-amber-100 rounded-xl">
              <CalendarDays className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
        */}
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-lg font-black text-slate-800">Today's Team Attendance</h3>
          <span className="text-[12px] font-bold bg-white border border-slate-200 px-3 py-1 rounded-full text-slate-600 shadow-sm">
            Real-time Logs
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="text-left py-4 px-6 text-[14px] font-bold text-slate-900">Name</th>
                <th className="text-left py-4 px-6 text-[14px] font-bold text-slate-900">Status</th>
                <th className="text-left py-4 px-6 text-[14px] font-bold text-slate-900">Check In</th>
                <th className="text-left py-4 px-6 text-[14px] font-bold text-slate-900">Check Out</th>
                <th className="text-left py-4 px-6 text-[14px] font-bold text-slate-900">Department</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {attendance.length > 0 ? (
                attendance.slice(0, 5).map((record, index) => (
                  <tr key={record.id || record._id} className={`hover:bg-blue-50/40 transition-colors group cursor-default ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                    <td className="py-4 px-6 font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{record.name}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-lg text-[10px] font-black ${
                          record.status === "present"
                            ? "bg-emerald-100 text-emerald-700"
                            : record.status === "absent"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600 font-medium">{formatTime(record.checkIn)}</td>
                    <td className="py-4 px-6 text-sm text-slate-600 font-medium">{formatTime(record.checkOut)}</td>
                    <td className="py-4 px-6 text-sm text-slate-500 font-semibold">
                      {record.department || "General"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-slate-700 text-sm italic">
                    No logs recorded for today yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;