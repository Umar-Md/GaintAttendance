import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import { Clock, CheckCircle, XCircle, Camera, Calendar, Play, Square, AlertCircle, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { managerURI, userURI, CLOUD_NAME, preset } from "../../../mainApi";

const ManagerAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showCamera, setShowCamera] = useState(false);
  const [attendanceType, setAttendanceType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shutter, setShutter] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const webcamRef = useRef(null);

  const fetchAttendance = async () => {
    try {
      const res = await axios.get(`${managerURI}/getMyAttendance`, { withCredentials: true });
      setAttendance(res.data.data || []);
    } catch (err) { console.error("Failed to fetch attendance", err); }
  };

  useEffect(() => { fetchAttendance(); }, []);

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
      const cloudRes = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, formData);
      const endpoint = attendanceType === "START" ? "/start" : "/end";
      const res = await axios.post(`${userURI}${endpoint}`, { imageUrl: cloudRes.data.secure_url }, { withCredentials: true });

      setMessage({ type: "success", text: res.data.message });
      setShowCamera(false);
      fetchAttendance();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Attendance failed" });
    } finally { setLoading(false); }
  };

  const filteredAttendance = attendance.filter((a) => a.date.startsWith(selectedMonth));

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2 sm:p-0 animate-in fade-in duration-700">
      
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800">Attendance Log</h2>
          <p className="text-slate-500 text-sm font-medium">Verify your presence with facial recognition</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm w-full sm:w-auto transition-focus-within:border-indigo-300">
          <Calendar size={16} className="text-slate-400" />
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-sm font-black text-slate-600 outline-none bg-transparent w-full"
          />
        </div>
      </div>

      {/* Main Action Section */}
      <div className="w-full">
        {showCamera ? (
          <div className="bg-white p-4 sm:p-8 rounded-4xl shadow-xl border border-slate-100 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${attendanceType === 'START' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                <h3 className="font-black text-slate-700   text-[10px]">
                  Facial Scan: {attendanceType === "START" ? "Check-in" : "Check-out"}
                </h3>
              </div>
              <button onClick={() => setShowCamera(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                <XCircle size={24} />
              </button>
            </div>

            <div className="relative bg-slate-900 rounded-3xl overflow-hidden aspect-4/3 sm:aspect-video max-w-2xl mx-auto mb-8 shadow-2xl">
              <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="w-full h-full object-cover scale-x-[-1]" />
              <div className={`absolute inset-0 bg-white transition-opacity duration-150 ${shutter ? "opacity-100" : "opacity-0"}`} />
              <div className="absolute inset-0 border-15 sm:border-30 border-indigo-500/10 pointer-events-none rounded-3xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-64 sm:h-64 border-2 border-dashed border-white/30 rounded-full pointer-events-none" />
            </div>

            <button
              onClick={captureAndSend}
              disabled={loading}
              className="w-full max-w-2xl mx-auto flex items-center justify-center gap-3 bg-indigo-600 text-white py-4 rounded-2xl font-black   text-xs hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-indigo-200"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Camera size={18} />}
              Verify Identity
            </button>
          </div>
        ) : (
          <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col lg:flex-row items-center justify-between gap-8 transition-all">
            <div className="text-center lg:text-left">
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 mb-2">Punch Interface</h3>
              {message.text ? (
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold ${message.type === 'error' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                  {message.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
                  {message.text}
                </div>
              ) : (
                <p className="text-slate-400 text-sm font-medium italic">Face detection required for logging hours</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <button
                onClick={() => { setAttendanceType("START"); setShowCamera(true); }}
                className="group flex-1 lg:flex-none flex items-center justify-center gap-4 px-10 py-5 bg-emerald-500 text-white rounded-2xl font-black text-xm   shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 hover:-translate-y-1 transition-all active:translate-y-0"
              >
                <Play size={16} fill="currentColor" className="group-hover:scale-110 transition-transform"/> Clock In
              </button>
              <button
                onClick={() => { setAttendanceType("END"); setShowCamera(true); }}
                className="group flex-1 lg:flex-none flex items-center justify-center gap-4 px-10 py-5 bg-[#E5534A] text-white rounded-2xl font-black text-xm   shadow-xl shadow-slate-800/20 hover:bg-red-600 hover:-translate-y-1 transition-all active:translate-y-0"
              >
                <Square size={14} fill="currentColor" className="group-hover:scale-110 transition-transform" /> Clock Out
              </button>
            </div>
          </div>
        )}
      </div>

      {/* History Section */}
      <div className="w-full">
        {/* DESKTOP TABLE */}
        <div className="hidden md:block bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-left">
                {["Date", "Status", "Log Times", "Total Hours"].map((h) => (
                  <th key={h} className="px-8 py-6 text-[16px] font-black   text-slate-900 border-b border-slate-300">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAttendance.map((a) => (
                <tr key={a._id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-8 py-5">
                    <p className="font-black text-slate-700 text-m">{a.date}</p>
                    <p className="text-[12px] font-bold text-slate-400  ">
                      {new Date(a.date).toLocaleDateString("en-US", { weekday: "long" })}
                    </p>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1.5 rounded-xl text-[12px] font-black  ${a.status === 'Present' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-[12px] font-black text-slate-300 ">In</span>
                        <span className="text-xm font-bold text-slate-600">{a.startTime ? new Date(a.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}</span>
                      </div>
                      <div className="w-4 h-px bg-slate-200" />
                      <div className="flex flex-col">
                        <span className="text-[12px] font-black text-slate-300 ">Out</span>
                        <span className="text-xm font-bold text-slate-600">{a.endTime ? new Date(a.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl text-slate-700 font-black text-xs">
                      <Clock size={12} className="text-indigo-500" /> {a.totalHours || "0"}h
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE STACKED CARDS */}
        <div className="md:hidden space-y-4">
          {filteredAttendance.length > 0 ? filteredAttendance.map((a) => (
            <div key={a._id} className="bg-white p-5 rounded-4xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                <div>
                  <p className="font-black text-slate-800 text-sm">{a.date}</p>
                  <p className="text-[10px] font-bold text-slate-400 ">{new Date(a.date).toLocaleDateString("en-US", { weekday: "long" })}</p>
                </div>
                <span className={`px-3 py-1 rounded-lg text-[9px] font-black  ${a.status === 'Present' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {a.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-2xl flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><ArrowUpRight size={14} /></div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 ">Check In</p>
                    <p className="text-xs font-bold text-slate-700">{a.startTime ? new Date(a.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}</p>
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><ArrowDownRight size={14} /></div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 ">Check Out</p>
                    <p className="text-xs font-bold text-slate-700">{a.endTime ? new Date(a.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <p className="text-[10px] font-black text-slate-400  ">Shift Duration</p>
                <div className="flex items-center gap-1.5 text-indigo-600 font-black text-sm">
                   <Clock size={14} /> {a.totalHours || "0"} Hours
                </div>
              </div>
            </div>
          )) : (
            <div className="bg-white p-12 rounded-4xl border border-dashed border-slate-200 text-center">
              <p className="text-slate-400 font-bold text-sm italic">No records found for this period.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerAttendance;