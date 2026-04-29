import React, { useEffect, useState } from "react";
import axios from "axios";
import { superAdminURI } from "../../../mainApi";
import { UserPlus, Mail, Lock, Phone, Power, PowerOff, Trash2 } from "lucide-react";

const ManageHRs = () => {
  const [hrs, setHrs] = useState([]);
  const [form, setForm] = useState({
    userName: "",
    email: "",
    password: "",
    phoneNumber: "",
  });

  const fetchHRs = async () => {
    const res = await axios.get(`${superAdminURI}/hrs`, {
      withCredentials: true,
    });
    setHrs(res.data.data);
  };

  useEffect(() => {
    fetchHRs();
  }, []);

  const createHR = async (e) => {
    e.preventDefault();
    await axios.post(`${superAdminURI}/create-hr`, form, {
      withCredentials: true,
    });
    fetchHRs();
    setForm({ userName: "", email: "", password: "", phoneNumber: "" });
  };

  const toggleStatus = async (id, isActive) => {
    try {
      const url = isActive
        ? `${superAdminURI}/hr/deactivate/${id}`
        : `${superAdminURI}/hr/activate/${id}`;

      await axios.put(url, {}, { withCredentials: true });
      fetchHRs(); 
    } catch (error) {
      console.error("Toggle HR error:", error);
      alert(error.response?.data?.message || "Action failed");
    }
  };

  const deleteHR = async (hr) => {
    const confirmed = window.confirm(
      `Delete ${hr.userName} permanently? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await axios.delete(`${superAdminURI}/hr/${hr._id}`, {
        withCredentials: true,
      });
      fetchHRs();
    } catch (error) {
      console.error("Delete HR error:", error);
      alert(error.response?.data?.message || "Failed to delete HR");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black text-gray-900 md:text-3xl">
          Manage HR Personnel
        </h2>
        <p className="text-gray-500 text-sm md:text-base">Create and manage HR accounts across the system.</p>
      </div>

      {/* CREATE HR FORM CARD */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <UserPlus size={18} className="text-blue-600" />
            Create New HR
          </h3>
        </div>
        <form onSubmit={createHR} className="p-4 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 px-1">Full Name</label>
              <input
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/30"
                placeholder="John Doe"
                value={form.userName}
                required
                onChange={(e) => setForm({ ...form, userName: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 px-1">Email Address</label>
              <input
                type="email"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/30"
                placeholder="hr@company.com"
                value={form.email}
                required
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 px-1">Password</label>
              <input
                type="password"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/30"
                placeholder="••••••••"
                value={form.password}
                required
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 px-1">Phone Number</label>
              <input
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/30"
                placeholder="+91 9900452026"
                value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95">
              Register HR Account
            </button>
          </div>
        </form>
      </div>

      {/* HR LIST SECTION */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-800 px-1">Active HR Directory</h3>
        <div className="grid grid-cols-1 gap-3">
          {hrs.map((hr) => (
            <div 
              key={hr._id} 
              className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-100 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg sm:text-xl">
                  {hr.userName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 truncate">{hr.userName}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1 truncate">
                    <Mail size={14} className="shrink-0" /> {hr.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 border-t sm:border-t-0 pt-3 sm:pt-0">
                <div className="flex flex-col sm:items-end">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${hr.isActive ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
                     Status: {hr.isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
                <button
                  onClick={() => toggleStatus(hr._id, hr.isActive)}
                  className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                    hr.isActive
                      ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
                      : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                  }`}
                >
                  {hr.isActive ? (
                    <><PowerOff size={16} /> <span className="whitespace-nowrap">Deactivate</span></>
                  ) : (
                    <><Power size={16} /> <span className="whitespace-nowrap">Activate</span></>
                  )}
                </button>
                <button
                  onClick={() => deleteHR(hr)}
                  className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer bg-red-600 text-white hover:bg-red-700"
                >
                  <Trash2 size={16} />
                  <span className="whitespace-nowrap">Delete</span>
                </button>
              </div>
            </div>
          ))}
          {hrs.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
              No HR records found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageHRs;
