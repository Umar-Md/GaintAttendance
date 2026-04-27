import React, { useState, useEffect } from "react";
import {
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Calendar as CalendarIcon,
  ChevronDown,
} from "lucide-react";
import axios from "axios";
import { managerURI, userURI } from "../../../mainApi";

const TeamAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${managerURI}/team-attendance`, {
        params: { date: selectedDate },
        withCredentials: true,
      });
      setAttendance(res.data.data || []);
    } catch (error) {
      console.error("Error fetching attendance", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  // ---------------- EXPORT LOGIC ----------------
  const downloadReport = async (type) => {
    try {
      // type will be 'daily', 'weekly', or 'monthly'
      const res = await axios.get(`${managerURI}/export-attendance`, {
        params: { date: selectedDate, range: type },
        withCredentials: true,
        responseType: "blob", // Important for file downloads
      });

      // Create a link to download the file
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Attendance_Report_${type}_${selectedDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      setShowExportOptions(false);
    } catch (error) {
      console.error(`Error exporting ${type} report`, error);
      alert("Failed to export report. Ensure the backend endpoint exists.");
    }
  };

  const handleMarkAttendance = async (id, status) => {
    try {
      await axios.post(
        `${userURI}/mark-attendance`,
        { employeeId: id, date: selectedDate, status },
        { withCredentials: true }
      );
      fetchAttendance();
    } catch (error) {
      console.error("Error marking attendance", error);
    }
  };

  const formatTime = (time) =>
    time
      ? new Date(time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800">
            Team Attendance
          </h2>
          <p className="text-xs md:text-sm text-slate-500 flex items-center gap-2 mt-1">
            <CalendarIcon size={14} className="text-emerald-500" />
            {new Date(selectedDate).toDateString()}
          </p>
        </div>

        <div className="flex gap-3 w-full md:w-auto relative">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="flex-1 md:flex-none px-4 py-2 rounded-xl border text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
          />
          
          {/* EXPORT DROPDOWN */}
          <div className="relative">
            <button 
              onClick={() => setShowExportOptions(!showExportOptions)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
            >
              <Download size={16} />
              Export
              <ChevronDown size={14} />
            </button>

            {showExportOptions && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-2xl shadow-xl z-50 overflow-hidden animate-in zoom-in-95 duration-200">
                <button 
                  onClick={() => downloadReport('daily')}
                  className="w-full px-4 py-3 text-left text-sm font-bold hover:bg-slate-50 text-slate-700 border-b"
                >
                  Daily Report
                </button>
                <button 
                  onClick={() => downloadReport('weekly')}
                  className="w-full px-4 py-3 text-left text-sm font-bold hover:bg-slate-50 text-slate-700 border-b"
                >
                  Weekly Summary
                </button>
                <button 
                  onClick={() => downloadReport('monthly')}
                  className="w-full px-4 py-3 text-left text-sm font-bold hover:bg-slate-50 text-slate-700"
                >
                  Monthly Report
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CONTENT (UNCHANGED LOGIC) */}
      {loading ? (
        <div className="h-60 flex items-center justify-center bg-white rounded-3xl border">
          <div className="w-10 h-10 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border overflow-hidden">
          {/* DESKTOP TABLE */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs text-slate-400">Employee</th>
                  <th className="px-6 py-4 text-left text-xs text-slate-400">Status</th>
                  <th className="px-6 py-4 text-left text-xs text-slate-400">Check In</th>
                  <th className="px-6 py-4 text-left text-xs text-slate-400">Check Out</th>
                  <th className="px-6 py-4 text-center text-xs text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {attendance.map((record) => (
                  <tr key={record._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={record?.userId?.imageUrl || "https://ui-avatars.com/api/?name=" + record.employeeId?.userName}
                          className="w-10 h-10 rounded-xl object-cover border"
                        />
                        <div>
                          <p className="font-bold text-sm text-slate-700">
                            {record.employeeId?.userName}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">
                            {record.employeeId?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                            record.status === 'present' ? 'bg-emerald-50 text-emerald-600' : 
                            record.status === 'absent' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-400'
                        }`}>
                            {record.status || "Unmarked"}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">
                      {formatTime(record.startTime)}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">
                      {formatTime(record.endTime)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleMarkAttendance(record.employeeId?._id, "present")}
                          className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
                          title="Mark Present"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button
                          onClick={() => handleMarkAttendance(record.employeeId?._id, "absent")}
                          className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                          title="Mark Absent"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS (UNCHANGED LOGIC) */}
          <div className="md:hidden space-y-4 p-4">
            {attendance.map((record) => (
              <div key={record._id} className="border rounded-2xl p-4 space-y-3 bg-slate-50/30">
                <div className="flex items-center gap-3">
                  <img
                    src={record?.userId?.imageUrl || "https://ui-avatars.com/api/?name=" + record.employeeId?.userName}
                    className="w-10 h-10 rounded-xl border"
                  />
                  <div>
                    <p className="font-bold text-sm">{record.employeeId?.userName}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{record.employeeId?.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 py-2 border-y border-dashed">
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    Status: <span className="text-slate-700 block text-xs">{record.status || "Unmarked"}</span>
                  </div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    Check In: <span className="text-slate-700 block text-xs">{formatTime(record.startTime)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleMarkAttendance(record.employeeId?._id, "present")}
                    className="flex-1 py-2 bg-emerald-500 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-100"
                  >
                    Present
                  </button>
                  <button
                    onClick={() => handleMarkAttendance(record.employeeId?._id, "absent")}
                    className="flex-1 py-2 bg-rose-500 text-white rounded-xl text-xs font-black shadow-lg shadow-rose-100"
                  >
                    Absent
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamAttendance;