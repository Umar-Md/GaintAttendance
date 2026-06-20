import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import axios from "axios";

import {
  CheckCircle,
  XCircle,
  TrendingUp,
  Camera,
  CalendarDays,
  Clock,
  LogIn,
  LogOut,
  Loader2,
} from "lucide-react";

import {
  employeeURI,
  userURI,
  CLOUD_NAME,
  preset,
} from "../../../mainApi";

const EmployeeAttendance = ({
  attendanceURI = `${employeeURI}/attendance`,
}) => {
  const [attendance, setAttendance] = useState([]);

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const webcamRef = useRef(null);

  const [showCamera, setShowCamera] = useState(false);

  const [attendanceType, setAttendanceType] =
    useState(null);

  const [loading, setLoading] = useState(false);

  const [shutter, setShutter] = useState(false);

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });
  const [now, setNow] = useState(Date.now());

  /* FETCH ATTENDANCE */
  const fetchAttendance = async () => {
    try {
      const res = await axios.get(attendanceURI, {
        withCredentials: true,
      });

      setAttendance(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch attendance", err);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [attendanceURI]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  /* CAPTURE AND SEND */
  const captureAndSend = async () => {
    setShutter(true);

    setTimeout(() => setShutter(false), 150);

    setLoading(true);

    setMessage({
      type: "",
      text: "",
    });

    const imageSrc =
      webcamRef.current?.getScreenshot();

    if (!imageSrc) {
      setMessage({
        type: "error",
        text: "Camera capture failed",
      });

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

      const endpoint =
        attendanceType === "START"
          ? "/start"
          : "/end";

      const res = await axios.post(
        `${userURI}${endpoint}`,
        {
          imageUrl:
            cloudinaryRes.data.secure_url,
        },
        {
          withCredentials: true,
        }
      );

      if (res.data.status === "INCOMPLETE") {
        setMessage({
          type: "warning",
          text: res.data.message,
        });
      } else {
        setMessage({
          type: "success",
          text:
            res.data.message ||
            "Attendance recorded successfully",
        });
      }

      setShowCamera(false);

      fetchAttendance();
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          "Attendance submission failed",
      });
    } finally {
      setLoading(false);
    }
  };

  /* FILTER DATA */
  const filteredAttendance = attendance.filter(
    (a) => a.date.startsWith(selectedMonth)
  );

  const todayAttendance = attendance.find(
    (a) => a.date === new Date().toISOString().split("T")[0]
  );

  const formatDuration = (milliseconds) => {
    if (!milliseconds || milliseconds < 0) return "00:00:00";

    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
      .map((value) => String(value).padStart(2, "0"))
      .join(":");
  };

  const elapsedTime = (() => {
    if (!todayAttendance?.startTime) return "00:00:00";

    const start = new Date(todayAttendance.startTime).getTime();
    const end = todayAttendance.endTime
      ? new Date(todayAttendance.endTime).getTime()
      : now;

    return formatDuration(end - start);
  })();

  /* STATS */
  const stats = {
    present: filteredAttendance.filter(
      (a) => a.status === "Present"
    ).length,

    absent: filteredAttendance.filter(
      (a) => a.status === "Absent"
    ).length,

    hours: filteredAttendance.reduce(
      (sum, a) => sum + (a.totalHours || 0),
      0
    ),
  };

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-5 lg:p-8 space-y-6 sm:space-y-8">

      {/* CAMERA MODAL */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          
          <div className="bg-white w-full max-w-md sm:max-w-xl rounded-4xl sm:rounded-[2.5rem] p-4 sm:p-6 shadow-2xl">

            {/* HEADER */}
            <div className="flex items-start justify-between gap-4 mb-5">
              
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-xl text-purple-600 shrink-0">
                  <Camera size={18} />
                </div>

                <h2 className="text-lg sm:text-2xl font-black text-slate-800 leading-tight">
                  {attendanceType === "START"
                    ? "Work-Day Check In"
                    : "Shift Completion Check Out"}
                </h2>
              </div>

              <button
                onClick={() =>
                  setShowCamera(false)
                }
                className="text-slate-400 hover:text-slate-700 text-xl"
              >
                ✕
              </button>
            </div>

            {/* CAMERA */}
            <div className="relative w-full aspect-square rounded-4xl overflow-hidden bg-black mb-5">
              
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover scale-x-[-1]"
              />

              {/* SHUTTER */}
              <div
                className={`absolute inset-0 bg-white transition-opacity duration-150 ${
                  shutter
                    ? "opacity-100"
                    : "opacity-0"
                }`}
              />

              {/* CAMERA INFO */}
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold">
                Live Feed •{" "}
                {new Date().toLocaleTimeString()}
              </div>
            </div>

            {/* BUTTON */}
            <button
              onClick={captureAndSend}
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-black transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin mx-auto" />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Verify & Process
                  <LogIn size={18} />
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* TOP SECTION */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* LEFT */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
            Clock In/Out
          </h1>

          <p className="text-slate-500 mt-2 text-sm sm:text-base">
            Biometric face-capture attendance system.
          </p>
          <div className="mt-4 inline-flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
            <Clock className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-[11px] font-black uppercase tracking-wide text-blue-400">
                Time Worked Today
              </p>
              <p className="font-mono text-2xl font-black text-blue-700">
                {elapsedTime}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-4xl p-4 sm:p-5 flex flex-col md:flex-row gap-4 shadow-sm">
          
          <button
            onClick={() => {
              setAttendanceType("START");
              setShowCamera(true);
            }}
            className="flex-1 flex items-center justify-center gap-3 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 py-5 rounded-3xl font-black transition-all"
          >
            <LogIn size={20} />
            Start Attendance
          </button>

          <button
            onClick={() => {
              setAttendanceType("END");
              setShowCamera(true);
            }}
            className="flex-1 flex items-center justify-center gap-3 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 py-5 rounded-3xl font-black transition-all"
          >
            End Attendance
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* MESSAGE */}
      {message.text && (
        <div
          className={`p-4 rounded-2xl text-center font-bold text-sm sm:text-base ${
            message.type === "success"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-rose-100 text-rose-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        
        {[
          {
            label: "Days Present",
            value: stats.present,
            icon: CheckCircle,
            color:
              "bg-emerald-50 text-emerald-600",
          },

          {
            label: "Absences",
            value: stats.absent,
            icon: XCircle,
            color:
              "bg-rose-50 text-rose-600",
          },

          {
            label: "Total Hours",
            value: `${stats.hours.toFixed(
              1
            )}h`,
            icon: TrendingUp,
            color:
              "bg-blue-50 text-blue-600",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              
              <div>
                <p className="text-sm font-bold text-slate-500">
                  {stat.label}
                </p>

                <h2 className="text-3xl font-black text-slate-800 mt-1">
                  {stat.value}
                </h2>
              </div>

              <div
                className={`p-4 rounded-2xl ${stat.color}`}
              >
                <stat.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-4xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* TABLE HEADER */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-600">
              <CalendarDays size={20} />
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Monthly Log
            </h2>
          </div>

          <input
            type="month"
            value={selectedMonth}
            onChange={(e) =>
              setSelectedMonth(e.target.value)
            }
            className="border-2 border-slate-200 rounded-2xl px-4 py-2.5 outline-none focus:border-blue-500 font-semibold text-slate-700 w-full md:w-auto"
          />
        </div>

        {/* MOBILE CARDS */}
        <div className="block lg:hidden p-4 space-y-4">
          
          {filteredAttendance.length > 0 ? (
            filteredAttendance.map((a) => (
              <div
                key={a._id}
                className="border border-slate-200 rounded-2xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  
                  <div>
                    <h3 className="font-black text-slate-800">
                      {a.date}
                    </h3>

                    <p className="text-sm text-slate-500">
                      {new Date(
                        a.date
                      ).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                        }
                      )}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-bold ${
                      a.status === "Present"
                        ? "bg-emerald-100 text-emerald-700"
                        : a.status === "Absent"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {a.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  
                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Check In
                    </span>

                    <span className="font-bold">
                      {a.startTime || "—"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Check Out
                    </span>

                    <span className="font-bold">
                      {a.endTime || "—"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Hours
                    </span>

                    <span className="font-bold">
                      {a.totalHours || 0}h
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 text-center opacity-40">
              <CalendarDays
                size={50}
                className="mx-auto mb-4"
              />

              <p className="font-black text-xl">
                No Logs Recorded
              </p>
            </div>
          )}
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden lg:block overflow-x-auto">
          
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50">
                {[
                  "Timeline",
                  "Shift Status",
                  "Check In",
                  "Check Out",
                  "Logged Time",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-8 py-5 text-sm font-black text-slate-700"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredAttendance.map((a) => (
                <tr
                  key={a._id}
                  className="border-t border-slate-100"
                >
                  <td className="px-8 py-5">
                    <div>
                      <h3 className="font-black text-slate-800">
                        {a.date}
                      </h3>

                      <p className="text-sm text-slate-500">
                        {new Date(
                          a.date
                        ).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                          }
                        )}
                      </p>
                    </div>
                  </td>

                  <td className="px-8 py-5">
                    <span
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold ${
                        a.status === "Present"
                          ? "bg-emerald-100 text-emerald-700"
                          : a.status === "Absent"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>

                  <td className="px-8 py-5 font-semibold">
                    {a.startTime || "—"}
                  </td>

                  <td className="px-8 py-5 font-semibold">
                    {a.endTime || "—"}
                  </td>

                  <td className="px-8 py-5 font-bold">
                    {a.totalHours || 0}h
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredAttendance.length === 0 && (
            <div className="py-20 text-center opacity-40">
              <CalendarDays
                size={50}
                className="mx-auto mb-4"
              />

              <p className="font-black text-xl">
                No Logs Recorded
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendance;
