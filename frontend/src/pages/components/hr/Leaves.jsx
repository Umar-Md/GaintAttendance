import React, { useEffect, useState } from "react";
import { hrURI } from "../../../mainApi";
import axios from "axios";
import {
  ClipboardList,
  CheckCircle2,
  Clock3,
  XCircle,
  CalendarDays,
  Mail,
  Briefcase,
  ChevronRight,
} from "lucide-react";


const Leaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ id: "", action: "", remarks: "" });

  // ---------------- FETCH LOGIC ----------------
  const fetchTeamLeaves = async () => {
    try {
      const res = await axios.get(`${hrURI}/getTeamLeaves`, {
        withCredentials: true,
      });
      setLeaves(res.data.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchTeamLeaves();
  }, []);

  // ---------------- ACTION LOGIC WITH REMARKS ----------------
  const handleOpenModal = (id, action) => {
    setModalData({ id, action, remarks: "" });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalData({ id: "", action: "", remarks: "" });
  };

  const handleSubmitAction = async () => {
    if (!modalData.remarks.trim()) return alert("Remarks are required");

    try {
      await axios.patch(
        `${hrURI}/leaves/${modalData.id}/${modalData.action}`,
        { remarks: modalData.remarks },
        { withCredentials: true }
      );
      fetchTeamLeaves();
      handleCloseModal();
    } catch (error) {
      console.log(error);
    }
  };

  // ---------------- STATS CALCULATION ----------------
  const approvedCount = leaves.filter((l) => l.status === "APPROVED").length;
  const pendingCount = leaves.filter((l) => l.status === "PENDING").length;
  const rejectedCount = leaves.filter((l) => l.status === "REJECTED").length;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 p-2 md:p-0">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-black text-slate-900">
          Leave Administration
        </h2>
        <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-wider">
          Personnel Absence Management System
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <StatCard
          label="Requests"
          value={leaves.length}
          icon={<ClipboardList className="text-indigo-600" size={20} />}
          color="indigo"
        />
        <StatCard
          label="Approved"
          value={approvedCount}
          icon={<CheckCircle2 className="text-emerald-600" size={20} />}
          color="emerald"
        />
        <StatCard
          label="Pending"
          value={pendingCount}
          icon={<Clock3 className="text-amber-600" size={20} />}
          color="amber"
        />
        <StatCard
          label="Rejected"
          value={rejectedCount}
          icon={<XCircle className="text-rose-600" size={20} />}
          color="rose"
        />
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden border-t-4 border-t-[#F7C43C]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-200">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="py-4 md:py-6 px-4 md:px-8 text-[11px] md:text-[14px] font-black text-slate-400">
                  Requester Identity
                </th>
                <th className="py-4 md:py-6 px-4 md:px-8 text-[11px] md:text-[14px] font-black text-slate-400">
                  Category
                </th>
                <th className="py-4 md:py-6 px-4 md:px-8 text-[11px] md:text-[14px] font-black text-slate-400">
                  Duration Period
                </th>
                <th className="py-4 md:py-6 px-4 md:px-8 text-[11px] md:text-[14px] font-black text-slate-400">
                  Status
                </th>
                <th className="py-4 md:py-6 px-0 text-[11px] md:text-[14px] font-black text-slate-400 text-center">
                  Decision Hub
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {leaves.map((leave) => (
                <tr
                  key={leave._id}
                  className="group odd:bg-white even:bg-slate-50/50 hover:bg-blue-50/40 transition-all duration-300"
                >
                  <td className="py-4 md:py-6 px-4 md:px-8">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="relative shrink-0">
                        <img
                          src={
                            leave?.user?.imageUrl ||
                            `https://ui-avatars.com/api/?name=${leave.user?.userName}&background=random`
                          }
                          alt=""
                          className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl object-cover ring-2 ring-white shadow-md group-hover:scale-110 transition-transform"
                        />
                        <div
                          className={`absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-white ${
                            leave.status === "APPROVED"
                              ? "bg-emerald-500"
                              : "bg-slate-300"
                          }`}
                        />
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-black text-slate-900 text-xm md:text-m">
                          {leave.user?.userName}
                        </p>
                        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 text-[10px] md:text-[12px] font-bold text-slate-400">
                          <span className="flex items-center gap-1">
                            <Briefcase size={10} /> {leave.user?.department}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail size={10} /> {leave.user?.email}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 md:py-6 px-4 md:px-8">
                    <span className="text-[12px] md:text-xm font-black capitalize text-indigo-600 bg-indigo-50 px-2 md:px-3 py-1 rounded-lg">
                      {leave.leaveType.toLowerCase()}
                    </span>
                  </td>

                  <td className="py-4 md:py-6 px-4 md:px-8">
                    <div className="flex items-center gap-2 text-slate-600 font-mono text-[12px] md:text-xm border-b border-green-300 font-bold whitespace-nowrap">
                      <CalendarDays size={14} className="text-slate-400" />
                      {new Date(leave.fromDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                      <ChevronRight size={12} className="text-slate-300" />
                      {new Date(leave.toDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </td>

                  <td className="py-4 md:py-6 px-4 md:px-8">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[9px] md:text-[12px] font-black border shadow-sm capitalize ${
                        leave.status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100 shadow-emerald-100/50"
                          : leave.status === "REJECTED"
                          ? "bg-rose-50 text-rose-700 border-rose-100 shadow-rose-100/50"
                          : "bg-amber-50 text-amber-700 border-amber-100 shadow-amber-100/50 animate-pulse"
                      }`}
                    >
                      <div
                        className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full ${
                          leave.status === "APPROVED"
                            ? "bg-emerald-500"
                            : leave.status === "REJECTED"
                            ? "bg-rose-500"
                            : "bg-amber-500"
                        }`}
                      />
                      {leave.status.toLowerCase()}
                    </span>
                  </td>

                  <td className="py-4 md:py-6 px-4 md:px-8 text-center">
                    {leave.status === "PENDING" ? (
                      <div className="flex justify-center gap-1.5 md:gap-2">
                        <button
                          onClick={() => handleOpenModal(leave._id, "approve")}
                          className="px-2 md:px-4 py-1.5 md:py-2 bg-emerald-500 text-white rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-200 transition-all active:scale-95"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleOpenModal(leave._id, "reject")}
                          className="px-2 md:px-4 py-1.5 md:py-2 bg-white border-2 border-rose-100 text-rose-600 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black hover:bg-rose-50 transition-all active:scale-95"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] md:text-[14px] font-black text-slate-500 italic">
                        Processed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {leaves.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-16 md:py-20 text-center">
                    <p className="text-xs md:text-sm font-bold text-slate-400 ">
                      Queue clear. No pending requests.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------- Modal for Remarks ---------- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-80 md:w-96 shadow-xl">
            <h3 className="text-lg md:text-xl font-black mb-4">
              {modalData.action === "approve" ? "Approve Leave" : "Reject Leave"}
            </h3>
            <textarea
              value={modalData.remarks}
              onChange={(e) =>
                setModalData({ ...modalData, remarks: e.target.value })
              }
              placeholder="Enter reason..."
              className="w-full h-24 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 rounded-lg bg-slate-200 font-bold hover:bg-slate-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitAction}
                className="px-4 py-2 rounded-lg bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------- Sub-component for Statistics Cards ---------- */
const StatCard = ({ label, value, icon, color }) => {
  const colors = {
    indigo:
      "bg-indigo-50 border-indigo-100 text-indigo-600 shadow-indigo-100/50 hover:shadow-indigo-400/40",
    emerald:
      "bg-emerald-50 border-emerald-100 text-emerald-600 shadow-emerald-100/50 hover:shadow-emerald-400/40",
    amber:
      "bg-amber-50 border-amber-100 text-amber-600 shadow-amber-100/50 hover:shadow-amber-400/40",
    rose: "bg-rose-50 border-rose-100 text-rose-600 shadow-rose-100/50 hover:shadow-rose-400/40",
  };

  return (
    <div
      className={`p-4 md:p-6 rounded-2xl md:rounded-3xl border transition-all hover:scale-105 shadow-lg md:shadow-xl ${colors[color]}`}
    >
      <div className="flex items-center justify-between mb-2 md:mb-4">
        <div className="p-2 md:p-3 bg-white rounded-xl md:rounded-2xl shadow-sm">
          {icon}
        </div>
        <div className="hidden md:block w-8 h-1 bg-white/50 rounded-full" />
      </div>
      <p className="text-[11px] md:text-[14px] font-black opacity-70 mb-1 truncate">
        {label}
      </p>
      <p className="text-xl md:text-3xl font-black">{value}</p>
    </div>
  );
};

export default Leaves;
