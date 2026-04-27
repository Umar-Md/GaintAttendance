import React, { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  XCircle,
  CheckCircle,
  Plus,
  LayoutGrid,
  Info,
  ArrowRight,
  ChevronRight,
  Hash,
} from "lucide-react";
import axios from "axios";
import { managerURI } from "../../../mainApi";

const ManagerLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    reason: "",
    fromDate: "",
    toDate: "",
    leaveType: "CASUAL",
  });

  // --- LOGIC ADDED: Get today's date in YYYY-MM-DD format ---
  const today = new Date().toISOString().split("T")[0];

  const fetchMyLeaves = async () => {
    try {
      const res = await axios.get(`${managerURI}/getMyLeaves`, {
        withCredentials: true,
      });
      setLeaves(res.data.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const handleApplyLeave = async (e) => {
    e.preventDefault();

    // --- LOGIC ADDED: Validation check ---
    if (leaveForm.fromDate < today) {
      alert(
        "Error: You cannot apply for leave on a date that has already passed.",
      );
      return;
    }

    if (leaveForm.toDate < leaveForm.fromDate) {
      alert("Error: 'To' date cannot be earlier than 'From' date.");
      return;
    }

    try {
      await axios.post(`${managerURI}/applyLeave`, leaveForm, {
        withCredentials: true,
      });
      alert("Leave request sent to HR");
      setShowForm(false);
      setLeaveForm({
        reason: "",
        fromDate: "",
        toDate: "",
        leaveType: "CASUAL",
      });
      fetchMyLeaves();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to apply leave");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "REJECTED":
        return "bg-rose-100 text-rose-700 border-rose-200";
      default:
        return "bg-amber-100 text-amber-700 border-amber-200";
    }
  };

  const leaveStats = {
    total: leaves?.length || 0,
    approved: leaves?.filter((l) => l.status === "APPROVED").length || 0,
    pending: leaves?.filter((l) => l.status === "PENDING").length || 0,
    rejected: leaves?.filter((l) => l.status === "REJECTED").length || 0,
  };

  return (
    <div className="p-4 md:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-700 max-w-400 mx-auto">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            My Leaves
          </h2>
          <p className="text-slate-500 text-xm sm:text-sm font-medium">
            Manage and track your leave applications
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95 font-bold text-sm"
        >
          <Plus className="w-5 h-5" />
          Apply New Leave
        </button>
      </div>

      {/* STATS GRID */}
      {/* STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total"
          value={leaveStats.total}
          icon={<LayoutGrid className="text-blue-600" />}
          iconBg="bg-blue-50"
          bgRgba="rgba(0, 141, 244, 0.12)"
          hoverShadow="hover:shadow-blue-500/30"
        />
        <StatCard
          title="Approved"
          value={leaveStats.approved}
          icon={<CheckCircle className="text-emerald-600" />}
          iconBg="bg-emerald-50"
          bgRgba="rgba(82, 175, 96, 0.12)"
          hoverShadow="hover:shadow-emerald-500/30"
        />
        <StatCard
          title="Pending"
          value={leaveStats.pending}
          icon={<Clock className="text-amber-600" />}
          iconBg="bg-amber-50"
          bgRgba="rgba(247, 186, 60, 0.15)"
          hoverShadow="hover:shadow-amber-500/30"
        />
        <StatCard
          title="Rejected"
          value={leaveStats.rejected}
          icon={<XCircle className="text-rose-600" />}
          iconBg="bg-rose-50"
          bgRgba="rgba(229, 83, 74, 0.12)"
          hoverShadow="hover:shadow-rose-500/30"
        />
      </div>

      {/* MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-end sm:items-center z-100 p-0 sm:p-4">
          <div className="bg-white rounded-t-[2.5rem] sm:rounded-4xl p-6 sm:p-8 w-full max-w-lg shadow-2xl animate-in slide-in-from-bottom sm:zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl sm:text-2xl font-black text-slate-800">
                New Application
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
              >
                ✕
              </button>
            </div>
            <form
              onSubmit={handleApplyLeave}
              className="space-y-4 sm:space-y-5"
            >
              <div className="space-y-1.5">
                <label className="text-[12px] font-black text-slate-400 ml-1">
                  Leave Category
                </label>
                <select
                  className="w-full bg-slate-50 border-none ring-1 ring-slate-200 p-4 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={leaveForm.leaveType}
                  onChange={(e) =>
                    setLeaveForm({ ...leaveForm, leaveType: e.target.value })
                  }
                >
                  <option value="CASUAL">Casual Leave</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="EARNED">Earned Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-black text-slate-400 ml-1">
                    From
                  </label>
                  <input
                    type="date"
                    required
                    min={today} // --- BLOCKS PAST DATES ---
                    className="w-full bg-slate-50 border-none ring-1 ring-slate-200 p-4 rounded-xl font-bold text-slate-700"
                    value={leaveForm.fromDate}
                    onChange={(e) =>
                      setLeaveForm({ ...leaveForm, fromDate: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-black text-slate-400 ml-1">
                    To
                  </label>
                  <input
                    type="date"
                    required
                    min={leaveForm.fromDate || today} // --- BLOCKS DATES BEFORE "FROM" DATE ---
                    className="w-full bg-slate-50 border-none ring-1 ring-slate-200 p-4 rounded-xl font-bold text-slate-700"
                    value={leaveForm.toDate}
                    onChange={(e) =>
                      setLeaveForm({ ...leaveForm, toDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black  tracking-widest text-slate-400 ml-1">
                  Reason
                </label>
                <textarea
                  rows={3}
                  required
                  className="w-full bg-slate-50 border-none ring-1 ring-slate-200 p-4 rounded-xl font-bold text-slate-700"
                  placeholder="Brief explanation..."
                  value={leaveForm.reason}
                  onChange={(e) =>
                    setLeaveForm({ ...leaveForm, reason: e.target.value })
                  }
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2 pb-6 sm:pb-0">
                <button
                  type="submit"
                  className="w-full sm:flex-1 order-1 sm:order-2 px-4 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="w-full sm:flex-1 order-2 sm:order-1 px-4 py-4 border border-slate-200 rounded-xl font-bold text-slate-500 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TABLE SECTION */}
      <div className="bg-white rounded-4xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                {[
                  "Category",
                  "Duration",
                  "Total Days",
                  "Reason",
                  "Status",
                  "Applied Date",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-8 py-6 text-left text-[14px] font-black  text-slate-900"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {leaves?.map((leave) => {
                const from = new Date(leave.fromDate);
                const to = new Date(leave.toDate);
                const days = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
                return (
                  <tr
                    key={leave._id}
                    className="group odd:bg-white even:bg-slate-100 hover:bg-slate-100 transition-colors"
                  >
                    <td className="px-8 py-5 font-black text-slate-700 text-m capitalize">
                      {leave.leaveType.toLowerCase()}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-slate-900 text-[12px] font-bold bg-slate-100 px-3 py-1.5 rounded-lg w-fit border-b border-slate-400">
                        {from.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        <ArrowRight size={10} />{" "}
                        {to.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="px-8 py-5 font-black text-slate-800 text-sm">
                      {days} Days
                    </td>
                    <td className="px-8 py-5 text-slate-500 text-m font-medium line-clamp-1 max-w-xs">
                      {leave.reason}
                    </td>
                    <td className="px-8 py-5">
                      <span
                        className={`px-3 py-1.5 rounded-xl text-[12px] font-black border capitalize ${getStatusColor(leave.status)}`}
                      >
                        {leave.status.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-8 py-5 flex flex-col">
                      <span className="text-slate-600 font-bold text-sm">
                        {new Date(leave.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-[12px] font-medium text-slate-400 italic">
                        #{leave._id.slice(-6).toUpperCase()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}
        <div className="lg:hidden divide-y divide-slate-50">
          {leaves.length > 0 ? (
            leaves.map((leave) => {
              const days =
                Math.ceil(
                  (new Date(leave.toDate) - new Date(leave.fromDate)) /
                    (1000 * 60 * 60 * 24),
                ) + 1;
              return (
                <div key={leave._id} className="p-5 sm:p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-indigo-500">
                        {leave.leaveType}
                      </span>
                      <p className="text-sm font-black text-slate-800">
                        {days} Days Application
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-lg text-[9px] font-black border ${getStatusColor(leave.status)}`}
                    >
                      {leave.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] font-bold text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <Calendar size={14} className="text-slate-400" />
                    <span>
                      {new Date(leave.fromDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <ChevronRight size={12} className="text-slate-300" />
                    <span>
                      {new Date(leave.toDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <p className="text-xm text-slate-500 font-medium leading-relaxed italic border-l-2 border-slate-100 pl-3">
                    "{leave.reason}"
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                      <Hash size={10} /> #{leave._id.slice(-6).toUpperCase()}
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">
                      {new Date(leave.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center text-slate-300 space-y-2">
              <Info size={32} className="mx-auto" />
              <p className="text-[10px] font-black tracking-widest">
                No Leave Records
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, iconBg, bgRgba, hoverShadow }) => (
  <div
    style={{ backgroundColor: bgRgba }}
    className={`p-5 sm:p-6 rounded-3xl sm:rounded-4xl border border-white/50 shadow-sm flex items-center justify-between group transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${hoverShadow}`}
  >
    <div className="space-y-0.5">
      {/* Title style updated to CamelCase friendly (No uppercase) */}
      <p className="text-slate-500 text-[13px] sm:text-[14px] font-bold leading-none mb-1">
        {title}
      </p>
      <p className="text-2xl sm:text-3xl font-black text-slate-800">{value}</p>
    </div>

    <div
      className={`p-3 sm:p-4 ${iconBg} rounded-2xl transition-transform group-hover:scale-110`}
    >
      {React.cloneElement(icon, {
        className: `${icon.props.className} w-5 h-5 sm:w-6 sm:h-6`,
      })}
    </div>
  </div>
);

export default ManagerLeaves;
