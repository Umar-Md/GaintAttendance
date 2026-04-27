import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  Clock,
  Calendar,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import axios from "axios";
import { employeeURI, userURI } from "../../../mainApi";
import Chatbot from "../../Chatbot";

const EmployeeDashboard = ({
  attendance = [],
  leaves = [],
  holidays = [],
  fetchDashboardData,
}) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  const formatToTime = (timeStr) => {
    if (!timeStr || timeStr === "--:--") return "--:--";
    if (timeStr.includes("T")) {
      return new Date(timeStr).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    }
    return timeStr;
  };

  const todayAttendance = attendance.find(
    (a) => a.date === new Date().toISOString().split("T")[0]
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Working Days", value: attendance.filter((a) => a.status === "Present").length, icon: TrendingUp, accent: "bg-red-500", iconBg: "bg-red-100", iconColor: "text-red-600" },
          { label: "Leaves Taken", value: leaves.filter((l) => l.status === "APPROVED").length, icon: Calendar, accent: "bg-blue-600", iconBg: "bg-blue-100", iconColor: "text-blue-600" },
          { label: "Pending Leaves", value: leaves.filter((l) => l.status === "PENDING").length, icon: Clock, accent: "bg-yellow-400", iconBg: "bg-yellow-100", iconColor: "text-yellow-600" },
          { label: "Upcoming Holidays", value: holidays.filter((h) => new Date(h.date) > new Date()).length, icon: CheckCircle, accent: "bg-green-500", iconBg: "bg-green-100", iconColor: "text-green-600" }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-1.5 h-full ${stat.accent}`}></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-900 text-[14px] font-bold">{stat.label}</p>
                <p className="text-3xl font-black text-slate-800 mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 ${stat.iconBg} rounded-3xl group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Today's Log Status (Buttons Removed) */}
          <div className="bg-white p-8 rounded-4xl shadow-sm border border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-black text-slate-800 mb-2">Daily Attendance</h3>
                <div className="flex gap-4 mt-2">
                  <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">In Time</p>
                    <p className="font-bold text-slate-700">{formatToTime(todayAttendance?.startTime)}</p>
                  </div>
                  <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Out Time</p>
                    <p className="font-bold text-slate-700">{formatToTime(todayAttendance?.endTime)}</p>
                  </div>
                </div>
              </div>
              
              {/* Status Indicator replaces action buttons */}
              <div className="flex gap-3">
                <div className={`flex items-center gap-2 px-6 py-3 font-black rounded-2xl border ${
                  todayAttendance?.startTime && todayAttendance?.endTime 
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                  : todayAttendance?.startTime 
                  ? "bg-amber-50 text-amber-600 border-amber-100 animate-pulse"
                  : "bg-slate-50 text-slate-400 border-slate-100"
                }`}>
                  <CheckCircle className="w-5 h-5" /> 
                  {todayAttendance?.startTime && todayAttendance?.endTime 
                    ? "Shift Completed" 
                    : todayAttendance?.startTime 
                    ? "Currently In Shift"
                    : "Shift Not Started"}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Attendance Table */}
          <div className="bg-white rounded-4xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800">Recent Attendance</h3>
              <button className="text-blue-600 font-bold hover:underline">Full Log</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="text-left px-8 py-4 text-[14px] font-black text-slate-700">Date</th>
                    <th className="text-left px-8 py-4 text-[14px] font-black text-slate-700">Status</th>
                    <th className="text-left px-8 py-4 text-[14px] font-black text-slate-700">Time (In/Out)</th>
                    <th className="text-left px-8 py-4 text-[14px] font-black text-slate-700">Net Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {attendance.slice(0, 5).map((record) => (
                    <tr key={record._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-4 font-bold text-slate-700">{record.date}</td>
                      <td className="px-8 py-4">
                        <span className={`px-3 py-1 rounded-lg text-[14px] font-black ${
                            record.status === "Present" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                          }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-[14px] text-slate-500 font-medium">
                        {formatToTime(record.startTime)} <ArrowRight className="inline w-3 h-3 mx-1 opacity-30" /> {formatToTime(record.endTime)}
                      </td>
                      <td className="px-8 py-4 font-black text-slate-800">{record.totalHours || "0"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Holidays */}
        <div className="bg-white p-8 rounded-4xl shadow-sm border border-slate-100 h-fit">
          <h3 className="text-lg font-black text-slate-800 mb-6">Upcoming Holidays</h3>
          <div className="space-y-4">
            {holidays.filter((h) => new Date(h.date) > new Date()).slice(0, 4).map((holiday) => (
              <div key={holiday._id} className="flex gap-4 items-center group">
                <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl font-black text-center min-w-14 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <p className="text-[10px]">{new Date(holiday.date).toLocaleDateString("en-US", { month: "short" })}</p>
                  <p className="text-lg mt-1">{new Date(holiday.date).toLocaleDateString("en-US", { day: "numeric" })}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-800">{holiday.name}</p>
                  <p className="text-xs text-slate-400 font-medium">Official Holiday</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;