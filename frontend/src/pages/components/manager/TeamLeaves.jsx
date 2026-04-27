import React, { useState, useEffect } from "react";
import {
  Check,
  X,
  Clock,
  Calendar,
  PieChart,
  Users,
  Building,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import { managerURI } from "../../../mainApi";

const TeamLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [actionType, setActionType] = useState(""); // "approve" or "reject"
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${managerURI}/team-leaves`, {
        withCredentials: true,
      });
      setLeaves(res.data.data || []);
    } catch (err) {
      console.error("Error fetching leaves", err);
    } finally {
      setLoading(false);
    }
  };

  const openDecisionModal = (leave, type) => {
    setSelectedLeave(leave);
    setActionType(type);
    setRemarks("");
    setShowModal(true);
  };

  const submitDecision = async () => {
    if (!remarks.trim()) return alert("Please enter a reason/remarks");

    try {
      await axios.patch(
        `${managerURI}/leaves/${selectedLeave._id}/${actionType}`,
        { remarks },
        { withCredentials: true },
      );
      setShowModal(false);
      setSelectedLeave(null);
      fetchLeaves();
    } catch (err) {
      console.error(`Error during ${actionType}`, err);
    }
  };

  const getLeaveTypeStyles = (type) => {
    const t = type?.toLowerCase();
    if (t?.includes("sick")) return "text-rose-600 bg-rose-50 border-rose-100";
    if (t?.includes("vacation")) return "text-sky-600 bg-sky-50 border-sky-100";
    return "text-indigo-600 bg-indigo-50 border-indigo-100";
  };

  return (
    <div className="p-4 sm:p-0 space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
          Leave Requests
        </h2>
        <p className="text-slate-500 text-sm font-medium mt-1">
          Review and manage team time-off
        </p>
      </div>

      {/* Stats Section */}
{/* Stats Section */}
<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
  {[
    { 
      label: "Total", 
      value: leaves.length, 
      icon: Users, 
      rgb: "97, 250, 244", // Blue (A)
      hex: "#618DF4",
      hoverShadow: "hover:shadow-[#618DF4]/40" 
    },
    { 
      label: "Approved", 
      value: leaves.filter(l => l.status === "APPROVED").length, 
      icon: Check, 
      rgb: "82, 320, 96", // Green (T)
      hex: "#52AF60",
      hoverShadow: "hover:shadow-[#52AF65]/40" 
    },
    { 
      label: "Pending", 
      value: leaves.filter(l => l.status === "PENDING").length, 
      icon: Clock, 
      rgb: "240, 196, 60", // Yellow (I)
      hex: "#F7C43C",
      hoverShadow: "hover:shadow-[#F7C43C]/40" 
    },
    { 
      label: "Rejected", 
      value: leaves.filter(l => l.status === "REJECTED").length, 
      icon: X, 
      rgb: "229, 83, 74", // Red (G)
      hex: "#E5534A",
      hoverShadow: "hover:shadow-[#E5534A]/40" 
    },
  ].map((stat, i) => (
    <div 
      key={i} 
      style={{ backgroundColor: `rgba(${stat.rgb}, 0.15)` }}
      className={`p-4 sm:p-6 rounded-2xl sm:rounded-4xl border border-white/50 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${stat.hoverShadow}`}
    >
      {/* Icon Container - Solid Brand Color */}
      <div 
        style={{ backgroundColor: stat.hex }}
        className="p-3 rounded-xl sm:rounded-2xl text-white shadow-lg shadow-black/5"
      >
        <stat.icon size={20} className="sm:w-6 sm:h-6" />
      </div>
      
      <div>
        <p className="text-[9px] sm:text-[14px] font-black text-slate-600 uppercase tracking-wider leading-none mb-1">
          {stat.label}
        </p>
        <p 
          className="text-xl sm:text-2xl font-black"
          style={{ color: stat.hex }}
        >
          {stat.value}
        </p>
      </div>
    </div>
  ))}
</div>

      {/* Content Section */}
      <div className="w-full">
        {loading ? (
          <LoadingState />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="text-left py-5 px-8 text-[14px] font-black text-slate-600">
                      Employee
                    </th>
                    <th className="text-left py-5 px-6 text-[14px] font-black text-slate-600">
                      Request
                    </th>
                    <th className="text-left py-5 px-6 text-[14px] font-black text-slate-600">
                      Duration
                    </th>
                    <th className="text-left py-5 px-6 text-[14px] font-black text-slate-600">
                      Status
                    </th>
                    <th className="text-center py-5 px-8 text-[14px] font-black text-slate-600">
                      Decision
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {leaves.map((leave) => (
                    <DesktopRow
                      key={leave._id}
                      leave={leave}
                      getStyles={getLeaveTypeStyles}
                      onOpenModal={openDecisionModal}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {leaves.length > 0 ? (
                leaves.map((leave) => (
                  <MobileCard
                    key={leave._id}
                    leave={leave}
                    getStyles={getLeaveTypeStyles}
                    onOpenModal={openDecisionModal}
                  />
                ))
              ) : (
                <EmptyState />
              )}
            </div>
            {leaves.length === 0 && (
              <div className="hidden md:block">
                <EmptyState />
              </div>
            )}
          </>
        )}
      </div>

      {/* Decision Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`p-3 rounded-2xl ${actionType === "approve" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}
              >
                {actionType === "approve" ? (
                  <CheckCircle2 size={24} />
                ) : (
                  <XCircle size={24} />
                )}
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 capitalize">
                  {actionType} Leave
                </h3>
                <p className="text-xs font-medium text-slate-500">
                  Provide remarks for {selectedLeave?.user?.userName}
                </p>
              </div>
            </div>

            <textarea
              rows={4}
              className="w-full border-2 border-slate-100 rounded-2xl p-4 text-sm focus:border-indigo-500 focus:ring-0 transition-all outline-none"
              placeholder="e.g. Project timeline allows for this absence..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 border-2 border-slate-100 rounded-2xl text-sm font-black text-slate-500 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitDecision}
                className={`flex-1 py-3 text-white rounded-2xl text-sm font-black shadow-lg transition-all active:scale-95 ${
                  actionType === "approve"
                    ? "bg-emerald-500 shadow-emerald-500/20"
                    : "bg-rose-500 shadow-rose-500/20"
                }`}
              >
                Confirm {actionType}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* Sub-components */

const DesktopRow = ({ leave, getStyles, onOpenModal }) => (
  <tr className="group hover:bg-slate-50/50 transition-colors">
    <td className="py-5 px-8">
      <div className="flex items-center gap-4">
        <img
          src={leave?.user?.imageUrl}
          className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-sm"
          alt=""
        />
        <div className="min-w-0">
          <p className="font-black text-slate-700 text-lg truncate">
            {leave.user?.userName}
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold truncate">
            <Building size={10} /> {leave.user?.department}
          </div>
        </div>
      </div>
    </td>
    <td className="py-5 px-6">
      <span
        className={`inline-block px-2.5 py-1 rounded-lg text-[14px] font-black border mb-1.5 ${getStyles(leave.leaveType)}`}
      >
        {leave.leaveType?.toLowerCase()}
      </span>
      <p className="text-xs text-slate-500 font-medium line-clamp-1 italic">
        "{leave.reason}"
      </p>
    </td>
    <td className="py-5 px-6 font-bold text-slate-600 text-xs">
      <div className="flex items-center gap-2">
        <Calendar size={12} className="text-indigo-400" />
        {new Date(leave.fromDate).toLocaleDateString()} -{" "}
        {new Date(leave.toDate).toLocaleDateString()}
      </div>
    </td>
    <td className="py-5 px-6">
      <StatusBadge status={leave.status} />
    </td>
    <td className="py-5 px-8">
      <ActionButtons
        status={leave.status}
        leave={leave}
        onOpenModal={onOpenModal}
      />
    </td>
  </tr>
);

const MobileCard = ({ leave, getStyles, onOpenModal }) => (
  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-3">
        <img
          src={leave?.user?.imageUrl}
          className="w-10 h-10 rounded-xl object-cover"
          alt=""
        />
        <div>
          <p className="font-black text-slate-700 text-sm leading-tight">
            {leave.user?.userName}
          </p>
          <p className="text-[10px] text-slate-400 font-bold">
            {leave.user?.department}
          </p>
        </div>
      </div>
      <StatusBadge status={leave.status} />
    </div>

    <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
      <span
        className={`text-[9px] font-black ${getStyles(leave.leaveType).split(" ")[0]}`}
      >
        {leave.leaveType}
      </span>
      <p className="text-xs text-slate-600 mt-1 italic font-medium">
        "{leave.reason}"
      </p>
    </div>

    <div className="flex items-center text-[11px] font-bold text-slate-500">
      <Calendar size={14} className="text-indigo-400 mr-2" />
      {new Date(leave.fromDate).toLocaleDateString()} -{" "}
      {new Date(leave.toDate).toLocaleDateString()}
    </div>

    <ActionButtons
      status={leave.status}
      leave={leave}
      onOpenModal={onOpenModal}
      isFullWidth
    />
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    APPROVED: "bg-emerald-100 text-emerald-700",
    REJECTED: "bg-rose-100 text-rose-700",
    PENDING: "bg-amber-100 text-amber-700",
  };
  return (
    <span
      className={`px-3 py-1.5 rounded-xl text-[12px] font-black ${styles[status]}`}
    >
      {status?.toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
    </span>
  );
};

const ActionButtons = ({ status, leave, onOpenModal, isFullWidth }) => {
  if (status !== "PENDING") {
    return (
      <div className="text-center w-full">
        <span className="text-[14px] font-black text-slate-400">Processed</span>
      </div>
    );
  }

  return (
    <div
      className={`flex gap-2 ${isFullWidth ? "w-full" : "max-w-50 mx-auto"}`}
    >
      <button
        onClick={() => onOpenModal(leave, "approve")}
        className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl text-[12px] font-black shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
      >
        Approve
      </button>
      <button
        onClick={() => onOpenModal(leave, "reject")}
        className="flex-1 py-2.5 bg-white border border-rose-100 text-rose-600 rounded-xl text-[12px] font-black active:scale-95 transition-all"
      >
        Reject
      </button>
    </div>
  );
};

const LoadingState = () => (
  <div className="flex flex-col justify-center items-center h-80 bg-white rounded-[2.5rem] border border-slate-100">
    <div className="w-10 h-10 rounded-full border-4 border-slate-100 border-t-indigo-500 animate-spin"></div>
    <p className="mt-4 text-slate-400 font-black text-[10px] tracking-widest uppercase">
      Syncing Records...
    </p>
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-slate-100">
    <div className="bg-slate-50 p-6 rounded-full mb-4">
      <PieChart size={32} className="text-slate-200" />
    </div>
    <p className="text-slate-400 font-bold text-sm">Inbox is clear</p>
  </div>
);

export default TeamLeaves;

