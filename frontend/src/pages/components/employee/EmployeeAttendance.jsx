import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import { Clock, CheckCircle, XCircle, TrendingUp, Camera, CalendarDays, LogIn, LogOut, Loader2 } from "lucide-react";
import { employeeURI, userURI, CLOUD_NAME, preset } from "../../../mainApi";

const EmployeeAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const webcamRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [attendanceType, setAttendanceType] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [shutter, setShutter] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchAttendance = async () => {
    try {
      const res = await axios.get(`${employeeURI}/attendance`, { withCredentials: true });
      setAttendance(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch attendance", err);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const captureAndSend = async () => {
    setShutter(true);
    setTimeout(() => setShutter(false), 150);
    setLoading(true);
    setMessage({ type: "", text: "" });

    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
      setMessage({ type: "error", text: "Camera capture failed" });
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", imageSrc);
      formData.append("upload_preset", preset);

      const cloudinaryRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        formData
      );

      const endpoint = attendanceType === "START" ? "/start" : "/end";
      const res = await axios.post(
        `${userURI}${endpoint}`,
        { imageUrl: cloudinaryRes.data.secure_url },
        { withCredentials: true }
      );

      if (res.data.status === "INCOMPLETE") {
        setMessage({ type: "warning", text: res.data.message });
      } else {
        setMessage({ type: "success", text: res.data.message || "Attendance recorded successfully" });
      }

      setShowCamera(false);
      fetchAttendance();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Attendance submission failed" });
    } finally {
      setLoading(false);
    }
  };

  const filteredAttendance = attendance.filter((a) => a.date.startsWith(selectedMonth));

  const stats = {
    present: filteredAttendance.filter((a) => a.status === "Present").length,
    absent: filteredAttendance.filter((a) => a.status === "Absent").length,
    late: filteredAttendance.filter((a) => a.status === "Late").length,
    hours: filteredAttendance.reduce((sum, a) => sum + (a.totalHours || 0), 0),
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      
      {/* ================= CAMERA OVERLAY MODAL ================= */}
      {showCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl w-full max-w-2xl border border-white/20 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
                  <Camera size={20} />
                </div>
                <h2 className="text-xl font-black text-slate-800 ">
                  {attendanceType === "START" ? "Work-Day Check In" : "Shift Completion Check Out"}
                </h2>
              </div>
              <button onClick={() => setShowCamera(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <div className="relative rounded-4xl overflow-hidden bg-slate-900 aspect-video mb-8 ring-4 ring-slate-50 shadow-inner">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover scale-x-[-1]"
              />
              {/* Shutter Animation */}
              <div className={`absolute inset-0 bg-white transition-opacity duration-150 ${shutter ? "opacity-100" : "opacity-0"}`} />
              
              {/* UI Overlay on Camera */}
              <div className="absolute inset-0 border-20 border-white/5 pointer-events-none"></div>
              <div className="absolute top-4 left-4 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-[10px] text-white font-bold  ">
                Live Feed • {new Date().toLocaleTimeString()}
              </div>
            </div>

            <button
              onClick={captureAndSend}
              disabled={loading}
              className="w-full group relative overflow-hidden bg-slate-900 text-white py-5 rounded-2xl font-black   transition-all hover:bg-black active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Verify & Process <LogIn size={18} />
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ================= ACTION SECTION ================= */}
      <div className="grid lg:grid-cols-3 gap-8 items-center">
        <div className="lg:col-span-1">
          <h1 className="text-4xl font-black text-slate-900 ">Clock In/Out</h1>
          <p className="text-slate-500 font-medium mt-2">Biometric face-capture attendance system.</p>
        </div>

        <div className="lg:col-span-2 bg-white p-4 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
          <button
            onClick={() => { setAttendanceType("START"); setShowCamera(true); }}
            className="flex-1 group flex items-center justify-center gap-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white py-6 rounded-3xl transition-all duration-300 font-black   text-m"
          >
            <LogIn className="group-hover:-translate-x-1 transition-transform" /> Start Attendance
          </button>

          <button
            onClick={() => { setAttendanceType("END"); setShowCamera(true); }}
            className="flex-1 group flex items-center justify-center gap-3 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white py-6 rounded-3xl transition-all duration-300 font-black   text-m"
          >
             End Attendance <LogOut className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-2xl text-center font-bold text-m animate-bounce ${
          message.type === "success" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
        }`}>
          {message.text}
        </div>
      )}

      {/* ================= STATS GRID ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Days Present", value: stats.present, icon: CheckCircle, color: "emerald" },
          { label: "Absences", value: stats.absent, icon: XCircle, color: "rose" },
          { label: "Late Entries", value: stats.late, icon: Clock, color: "amber" },
          { label: "Total Hours", value: `${stats.hours.toFixed(1)}h`, icon: TrendingUp, color: "blue" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative overflow-hidden">
             <div className="flex justify-between items-center relative z-10">
                <div>
                  <p className="text-[14px] font-black  text-black mb-1">{stat.label}</p>
                  <p className={`text-3xl font-black text-slate-800`}>{stat.value}</p>
                </div>
                <div className={`p-4 bg-${stat.color}-50 text-${stat.color}-600 rounded-4xl`}>
                  <stat.icon size={24} />
                </div>
             </div>
             <div className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500 bg-${stat.color}-500`} />
          </div>
        ))}
      </div>

      {/* ================= TABLE REPORT ================= */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
              <CalendarDays size={20} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 ">Monthly Log</h2>
          </div>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border-2 border-slate-100 px-6 py-2.5 rounded-2xl font-bold text-slate-600 outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                {["Timeline", "Shift Status", "Check In", "Check Out", "Logged Time"].map((h) => (
                  <th key={h} className="px-8 py-5 text-[14px] font-black text-slate-900">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAttendance.map((a) => (
                <tr key={a._id} className="hover:bg-slate-50/20 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-700">{a.date}</span>
                      <span className="text-[14px] font-bold text-slate-600 ">
                        {new Date(a.date).toLocaleDateString("en-US", { weekday: "long" })}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black   ${
                        a.status === "Present" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : 
                        a.status === "Absent" ? "bg-rose-50 text-rose-600 border border-rose-100" : 
                        "bg-amber-50 text-amber-600 border border-amber-100"
                    }`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 font-bold text-slate-600 text-sm">{a.startTime || "—"}</td>
                  <td className="px-8 py-5 font-bold text-slate-600 text-sm">{a.endTime || "—"}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                       <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full" style={{ width: `${Math.min((a.totalHours/9)*100, 100)}%` }} />
                       </div>
                       <span className="text-sm font-black text-slate-700">{a.totalHours || 0}h</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredAttendance.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center opacity-20">
               <CalendarDays size={48} className="mb-4" />
               <p className="font-black   text-xl">No Logs Recorded</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendance;