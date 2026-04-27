// import React, { useState } from "react";
// import { Calendar, Clock, XCircle, CheckCircle, Plus, Info, Trash2 } from "lucide-react";
// import axios from "axios";
// import { employeeURI, userURI } from "../../../mainApi";

// const EmployeeLeaves = ({ leaves, fetchDashboardData }) => {
//   const [showForm, setShowForm] = useState(false);
//   const [leaveForm, setLeaveForm] = useState({
//     reason: "",
//     fromDate: "",
//     toDate: "",
//     leaveType: "CASUAL",
//   });

//   const handleApplyLeave = async (e) => {
//     e.preventDefault();
//     try {
//       await axios.post(`${employeeURI}/leaveapply`, leaveForm, {
//         withCredentials: true,
//       });
//       alert("Leave applied successfully!");
//       setShowForm(false);
//       setLeaveForm({
//         reason: "",
//         fromDate: "",
//         toDate: "",
//         leaveType: "CASUAL",
//       });
//       fetchDashboardData();
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to apply leave");
//     }
//   };

//   const handleCancelLeave = async (leaveId) => {
//     if (window.confirm("Are you sure you want to cancel this leave?")) {
//       try {
//         await axios.delete(`${employeeURI}/cancel-leave/${leaveId}`, {
//           withCredentials: true,
//         });
//         fetchDashboardData();
//         alert("Leave cancelled successfully");
//       } catch (err) {
//         alert("Failed to cancel leave");
//       }
//     }
//   };

//   const leaveStats = {
//     total: leaves.length,
//     approved: leaves.filter((l) => l.status === "APPROVED").length,
//     pending: leaves.filter((l) => l.status === "PENDING").length,
//     rejected: leaves.filter((l) => l.status === "REJECTED").length,
//   };

//   return (
//     <div className="space-y-8 animate-in fade-in duration-700">
//       {/* Header Section */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-4xl shadow-sm border border-slate-100">
//         <div>
//           <h2 className="text-4xl font-black text-slate-900 tracking-tight">Leave Management</h2>
//           <p className="text-slate-600 font-medium mt-0">Track, apply, and manage your time off</p>
//         </div>
//         <button
//           onClick={() => setShowForm(true)}
//           className="group relative bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 flex items-center gap-2 overflow-hidden"
//         >
//           <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
//           <span className="relative z-10">Apply for Leave</span>
//           <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
//         </button>
//       </div>

//       {/* Leave Statistics Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//         {[
//           { label: "Total History", value: leaveStats.total, icon: Calendar, color: "blue", bg: "bg-blue-50", text: "text-blue-600" },
//           { label: "Approved", value: leaveStats.approved, icon: CheckCircle, color: "emerald", bg: "bg-emerald-50", text: "text-emerald-600" },
//           { label: "Pending Approval", value: leaveStats.pending, icon: Clock, color: "amber", bg: "bg-amber-50", text: "text-amber-600" },
//           { label: "Declined", value: leaveStats.rejected, icon: XCircle, color: "rose", bg: "bg-rose-50", text: "text-rose-600" },
//         ].map((stat, i) => (
//           <div key={i} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all group relative overflow-hidden">
//             <div className="flex items-center justify-between relative z-10">
//               <div>
//                 <p className="text-slate-900 text-[14px] font-black ">{stat.label}</p>
//                 <p className={`text-3xl font-black mt-2 ${stat.text}`}>{stat.value}</p>
//               </div>
//               <div className={`p-4 ${stat.bg} rounded-4xl group-hover:scale-110 transition-transform`}>
//                 <stat.icon className={`w-6 h-6 ${stat.text}`} />
//               </div>
//             </div>
//             <div className={`absolute bottom-0 left-0 h-1 bg-${stat.color}-500 w-0 group-hover:w-full transition-all duration-500`}></div>
//           </div>
//         ))}
//       </div>

//       {/* Leave Application Form Modal */}
//       {showForm && (
//         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-100 p-4">
//           <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl animate-in zoom-in duration-300 relative">
//             <button 
//               onClick={() => setShowForm(false)}
//               className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
//             >
//               ✕
//             </button>
            
//             <div className="mb-8 text-center">
//               <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
//                 <Calendar className="w-8 h-8" />
//               </div>
//               <h3 className="text-2xl font-black text-slate-900">Apply for Leave</h3>
//               <p className="text-slate-500 font-medium mt-1">Submit your request for administrative review</p>
//             </div>

//             <form onSubmit={handleApplyLeave} className="space-y-6">
//               <div className="space-y-2">
//                 <label className="text-[10px] font-black  text-slate-400 ml-1">Leave Category</label>
//                 <select
//                   value={leaveForm.leaveType}
//                   onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
//                   className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-700 outline-none appearance-none"
//                 >
//                   <option value="CASUAL">Casual Leave</option>
//                   <option value="SICK">Sick Leave</option>
//                   <option value="EARNED">Earned Leave</option>
//                 </select>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <label className="text-[10px] font-black  text-slate-400 ml-1">From Date</label>
//                   <input
//                     type="date"
//                     value={leaveForm.fromDate}
//                     onChange={(e) => setLeaveForm({ ...leaveForm, fromDate: e.target.value })}
//                     className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 font-bold outline-none"
//                     required
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <label className="text-[10px] font-black  text-slate-400 ml-1">To Date</label>
//                   <input
//                     type="date"
//                     value={leaveForm.toDate}
//                     onChange={(e) => setLeaveForm({ ...leaveForm, toDate: e.target.value })}
//                     className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 font-bold outline-none"
//                     required
//                   />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <label className="text-[10px] font-black  text-slate-400 ml-1">Justification / Reason</label>
//                 <textarea
//                   value={leaveForm.reason}
//                   onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
//                   className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 font-bold min-h-24 outline-none"
//                   placeholder="Provide a brief explanation..."
//                   required
//                 />
//               </div>

//               <div className="flex gap-4 pt-4">
//                 <button
//                   type="button"
//                   onClick={() => setShowForm(false)}
//                   className="flex-1 px-6 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-200 transition-all"
//                 >
//                   Discard
//                 </button>
//                 <button
//                   type="submit"
//                   className="flex-2 px-6 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95"
//                 >
//                   Send Application
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Leaves History Table */}
//       <div className="bg-white rounded-4xl shadow-sm border border-slate-100 overflow-hidden">
//         <div className="p-8 border-b border-slate-50 flex items-center gap-2">
//           <Info className="w-5 h-5 text-blue-500" />
//           <h3 className="text-xl font-black text-slate-800">Application History</h3>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="w-full text-left border-collapse">
//             <thead>
//               <tr className="bg-slate-50/50">
//                 <th className="py-5 px-8 text-[14px] font-black text-slate-600 ">Category</th>
//                 <th className="py-5 px-8 text-[14px] font-black text-slate-600 ">Schedule</th>
//                 <th className="py-5 px-8 text-[14px] font-black text-slate-600  text-center">Days</th>
//                 <th className="py-5 px-8 text-[14px] font-black text-slate-600 ">Status</th>
//                 <th className="py-5 px-8 text-[14px] font-black text-slate-600 ">Submitted</th>
//                 <th className="py-5 px-8 text-[14px] font-black text-slate-600  text-right">Action</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-50">
//               {leaves.length > 0 ? (
//                 leaves.map((leave) => {
//                   const fromDate = new Date(leave.fromDate);
//                   const toDate = new Date(leave.toDate);
//                   const duration = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;

//                   return (
//                     <tr key={leave._id} className="hover:bg-slate-50/30 transition-colors group">
//                       <td className="py-5 px-8">
//                         <span className="font-bold text-slate-700 text-sm capitalize">{leave.leaveType.toLowerCase()}</span>
//                       </td>
//                       <td className="py-5 px-8">
//                         <div className="flex flex-col">
//                           <span className="text-sm font-bold text-slate-600">
//                             {fromDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
//                           </span>
//                           <span className="text-[12px] text-slate-400 font-bold">To {toDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
//                         </div>
//                       </td>
//                       <td className="py-5 px-8 text-center">
//                         <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-black">
//                           {duration}d
//                         </span>
//                       </td>
//                       <td className="py-5 px-8">
//   <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[12px] font-black tracking-wide uppercase ${
//       leave.status === "APPROVED" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : 
//       leave.status === "REJECTED" ? "bg-rose-50 text-rose-600 border border-rose-100" : 
//       "bg-amber-50 text-amber-600 border border-amber-100" 
//     }`}>
    
//     {/* Status Indicator Dot */}
//     <span className={`w-1.5 h-1.5 rounded-full ${
//       leave.status === "APPROVED" ? "bg-emerald-500" : 
//       leave.status === "REJECTED" ? "bg-rose-500" : 
//       "bg-amber-500 animate-pulse" 
//     }`}></span>

//     {leave.status.toLowerCase()}
//   </span>
// </td>
//                       <td className="py-5 px-8 text-sm font-medium text-slate-400">
//                         {new Date(leave.createdAt).toLocaleDateString()}
//                       </td>
//                       <td className="py-5 px-8 text-right">
//                         {leave.status === "PENDING" && (
//                           <button
//                             onClick={() => handleCancelLeave(leave._id)}
//                             className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-90"
//                             title="Cancel Request"
//                           >
//                             <Trash2 className="w-4 h-4" />
//                           </button>
//                         )}
//                       </td>
//                     </tr>
//                   );
//                 })
//               ) : (
//                 <tr>
//                   <td colSpan="7" className="py-20 text-center">
//                     <div className="flex flex-col items-center opacity-20">
//                       <Calendar className="w-16 h-16 mb-4" />
//                       <p className="text-xl font-black ">Void Repository</p>
//                       <p className="text-sm font-bold">No leave records found in the archive</p>
//                     </div>
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EmployeeLeaves;


import React, { useState } from "react";
import { Calendar, Clock, XCircle, CheckCircle, Plus, Info, Trash2 } from "lucide-react";
import axios from "axios";
import { employeeURI, userURI } from "../../../mainApi";

const EmployeeLeaves = ({ leaves, fetchDashboardData }) => {
  const [showForm, setShowForm] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    reason: "",
    fromDate: "",
    toDate: "",
    leaveType: "CASUAL",
  });

  // --- LOGIC ADDED: Get today's date in YYYY-MM-DD format ---
  const today = new Date().toISOString().split("T")[0];

  const handleApplyLeave = async (e) => {
    e.preventDefault();

    // --- LOGIC ADDED: Validation check before API call ---
    if (leaveForm.fromDate < today) {
      alert("Error: You cannot apply for leave on a date that has already passed.");
      return;
    }

    if (leaveForm.toDate < leaveForm.fromDate) {
      alert("Error: 'To Date' cannot be earlier than 'From Date'.");
      return;
    }

    try {
      await axios.post(`${employeeURI}/leaveapply`, leaveForm, {
        withCredentials: true,
      });
      alert("Leave applied successfully!");
      setShowForm(false);
      setLeaveForm({
        reason: "",
        fromDate: "",
        toDate: "",
        leaveType: "CASUAL",
      });
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to apply leave");
    }
  };

  const handleCancelLeave = async (leaveId) => {
    if (window.confirm("Are you sure you want to cancel this leave?")) {
      try {
        await axios.delete(`${employeeURI}/cancel-leave/${leaveId}`, {
          withCredentials: true,
        });
        fetchDashboardData();
        alert("Leave cancelled successfully");
      } catch (err) {
        alert("Failed to cancel leave");
      }
    }
  };

  const leaveStats = {
    total: leaves.length,
    approved: leaves.filter((l) => l.status === "APPROVED").length,
    pending: leaves.filter((l) => l.status === "PENDING").length,
    rejected: leaves.filter((l) => l.status === "REJECTED").length,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-4xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Leave Management</h2>
          <p className="text-slate-600 font-medium mt-0">Track, apply, and manage your time off</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="group relative bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 flex items-center gap-2 overflow-hidden"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          <span className="relative z-10">Apply for Leave</span>
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
        </button>
      </div>

      {/* Leave Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total History", value: leaveStats.total, icon: Calendar, color: "blue", bg: "bg-blue-50", text: "text-blue-600" },
          { label: "Approved", value: leaveStats.approved, icon: CheckCircle, color: "emerald", bg: "bg-emerald-50", text: "text-emerald-600" },
          { label: "Pending Approval", value: leaveStats.pending, icon: Clock, color: "amber", bg: "bg-amber-50", text: "text-amber-600" },
          { label: "Declined", value: leaveStats.rejected, icon: XCircle, color: "rose", bg: "bg-rose-50", text: "text-rose-600" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all group relative overflow-hidden">
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-slate-900 text-[14px] font-black ">{stat.label}</p>
                <p className={`text-3xl font-black mt-2 ${stat.text}`}>{stat.value}</p>
              </div>
              <div className={`p-4 ${stat.bg} rounded-4xl group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-6 h-6 ${stat.text}`} />
              </div>
            </div>
            <div className={`absolute bottom-0 left-0 h-1 bg-${stat.color}-500 w-0 group-hover:w-full transition-all duration-500`}></div>
          </div>
        ))}
      </div>

      {/* Leave Application Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-100 p-4">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl animate-in zoom-in duration-300 relative">
            <button 
              onClick={() => setShowForm(false)}
              className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
            >
              ✕
            </button>
            
            <div className="mb-8 text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">Apply for Leave</h3>
              <p className="text-slate-500 font-medium mt-1">Submit your request for administrative review</p>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black  text-slate-400 ml-1">Leave Category</label>
                <select
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-700 outline-none appearance-none"
                >
                  <option value="CASUAL">Casual Leave</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="EARNED">Earned Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black  text-slate-400 ml-1">From Date</label>
                  <input
                    type="date"
                    min={today} // --- BLOCKS PAST DATES ---
                    value={leaveForm.fromDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, fromDate: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 font-bold outline-none"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black  text-slate-400 ml-1">To Date</label>
                  <input
                    type="date"
                    min={leaveForm.fromDate || today} // --- BLOCKS DATES BEFORE START DATE ---
                    value={leaveForm.toDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, toDate: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 font-bold outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black  text-slate-400 ml-1">Justification / Reason</label>
                <textarea
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 font-bold min-h-24 outline-none"
                  placeholder="Provide a brief explanation..."
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-6 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="flex-2 px-6 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95"
                >
                  Send Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leaves History Table */}
      <div className="bg-white rounded-4xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-500" />
          <h3 className="text-xl font-black text-slate-800">Application History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="py-5 px-8 text-[14px] font-black text-slate-600 ">Category</th>
                <th className="py-5 px-8 text-[14px] font-black text-slate-600 ">Schedule</th>
                <th className="py-5 px-8 text-[14px] font-black text-slate-600  text-center">Days</th>
                <th className="py-5 px-8 text-[14px] font-black text-slate-600 ">Status</th>
                <th className="py-5 px-8 text-[14px] font-black text-slate-600 ">Submitted</th>
                <th className="py-5 px-8 text-[14px] font-black text-slate-600  text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {leaves.length > 0 ? (
                leaves.map((leave) => {
                  const fromDate = new Date(leave.fromDate);
                  const toDate = new Date(leave.toDate);
                  const duration = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;

                  return (
                    <tr key={leave._id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="py-5 px-8">
                        <span className="font-bold text-slate-700 text-sm capitalize">{leave.leaveType.toLowerCase()}</span>
                      </td>
                      <td className="py-5 px-8">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-600">
                            {fromDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="text-[12px] text-slate-400 font-bold">To {toDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </td>
                      <td className="py-5 px-8 text-center">
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-black">
                          {duration}d
                        </span>
                      </td>
                      <td className="py-5 px-8">
                        <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[12px] font-black tracking-wide uppercase ${
                            leave.status === "APPROVED" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : 
                            leave.status === "REJECTED" ? "bg-rose-50 text-rose-600 border border-rose-100" : 
                            "bg-amber-50 text-amber-600 border border-amber-100" 
                          }`}>
                          
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            leave.status === "APPROVED" ? "bg-emerald-500" : 
                            leave.status === "REJECTED" ? "bg-rose-500" : 
                            "bg-amber-500 animate-pulse" 
                          }`}></span>

                          {leave.status.toLowerCase()}
                        </span>
                      </td>
                      <td className="py-5 px-8 text-sm font-medium text-slate-400">
                        {new Date(leave.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-5 px-8 text-right">
                        {leave.status === "PENDING" && (
                          <button
                            onClick={() => handleCancelLeave(leave._id)}
                            className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-90"
                            title="Cancel Request"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="py-20 text-center">
                    <div className="flex flex-col items-center opacity-20">
                      <Calendar className="w-16 h-16 mb-4" />
                      <p className="text-xl font-black ">Void Repository</p>
                      <p className="text-sm font-bold">No leave records found in the archive</p>
                    </div>
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

export default EmployeeLeaves;