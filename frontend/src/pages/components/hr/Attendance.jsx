import React, { useState } from "react";
import { Download, Calendar, Clock, UserCheck, ArrowRight, ChevronDown } from "lucide-react";

const Attendance = ({ attendance, selectedDate, setSelectedDate }) => {
  const [isExporting, setIsExporting] = useState(false);

  // --- NEW EXPORT LOGIC ---
  const downloadCSV = (data, filename) => {
    if (data.length === 0) return alert("No data to export");
    
    const headers = ["Name", "Date", "Status", "CheckIn", "CheckOut"];
    const csvRows = [
      headers.join(","), // Header row
      ...data.map(row => [
        `"${row.name}"`,
        row.date,
        row.status,
        row.checkIn || "-",
        row.checkOut || "-"
      ].join(","))
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `${filename}.csv`);
    a.click();
  };

  const handleExport = (type) => {
    const now = new Date();
    let filteredData = [...attendance];

    if (type === "weekly") {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredData = attendance.filter(item => new Date(item.date) >= oneWeekAgo);
    } else if (type === "monthly") {
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      filteredData = attendance.filter(item => new Date(item.date) >= oneMonthAgo);
    }

    downloadCSV(filteredData, `Attendance_Report_${type}_${selectedDate}`);
  };

  // -------------------------------------------------------------------------
  // UI LOGIC (RETAINED)
  // -------------------------------------------------------------------------
  const formatTime = (time) => {
    if (!time) return "-";
    return time;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 flex items-center gap-3">
            Attendance Log
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </h2>
          <p className="text-[12px] font-black text-slate-400 mt-1">
            Real-time manager presence tracking
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-48 group">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none shadow-sm"
            />
          </div>

          {/* Export Dropdown Group */}
          <div className="relative group">
            <button 
              className="px-6 py-3 bg-black text-white rounded-2xl hover:bg-slate-800 transition-all flex items-center gap-2 font-bold text-[12px] shadow-xl shadow-slate-200"
            >
              <Download className="w-4 h-4" />
              Export Report
              <ChevronDown className="w-3 h-3 ml-1" />
            </button>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
              <button 
                onClick={() => handleExport("daily")}
                className="w-full text-left px-4 py-3 text-[12px] font-bold text-slate-600 hover:bg-slate-50 border-b border-slate-50 flex items-center gap-2"
              >
                Current View (Daily)
              </button>
              <button 
                onClick={() => handleExport("weekly")}
                className="w-full text-left px-4 py-3 text-[12px] font-bold text-slate-600 hover:bg-slate-50 border-b border-slate-50 flex items-center gap-2"
              >
                Weekly Report
              </button>
              <button 
                onClick={() => handleExport("monthly")}
                className="w-full text-left px-4 py-3 text-[12px] font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2"
              >
                Monthly Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table Container (Keep your existing table code here) */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="py-6 px-8 text-[14px] font-black text-slate-400">Manager Details</th>
                <th className="py-6 px-8 text-[14px] font-black text-slate-400">Date</th>
                <th className="py-6 px-8 text-[14px] font-black text-slate-400">Presence Status</th>
                <th className="py-6 px-8 text-[14px] font-black text-slate-400">
                   <div className="flex items-center gap-2"><Clock className="w-3 h-3" /> Check In</div>
                </th>
                <th className="py-6 px-8 text-[14px] font-black text-slate-400 text-right">
                  <div className="flex items-center gap-2 justify-end">Check Out <ArrowRight className="w-3 h-3" /></div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {attendance.map((record) => (
                <tr key={record.id} className="group odd:bg-white even:bg-slate-100 hover:bg-blue-50/40 transition-all duration-300">
                  <td className="py-5 px-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-black text-xm group-hover:bg-blue-600 group-hover:text-white transition-all">
                        {record.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-m font-black text-slate-700">{record.name}</p>
                        <p className="text-[14px] font-bold text-slate-400">Department Admin</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-8 font-mono italic text-slate-500">{record.date}</td>
                  <td className="py-5 px-8">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-black border transition-colors ${
                        record.status === "Present" ? "bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-500 group-hover:text-white" : "bg-rose-50 text-rose-600 border-rose-100 group-hover:bg-rose-500 group-hover:text-white"
                    }`}>
                      <UserCheck className="w-3 h-3" /> {record.status}
                    </span>
                  </td>
                  <td className="py-5 px-8 text-xm font-bold text-slate-600 font-mono">
                    {formatTime(record.checkIn)}
                  </td>
                  <td className="py-5 px-8 text-right font-mono text-slate-500">
                    {formatTime(record.checkOut)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attendance;