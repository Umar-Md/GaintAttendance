import React, { useState } from "react";
import axios from "axios";
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  UserPlus,
  CheckCircle,
  XCircle,
  MoreVertical,
  Mail,
  Users,
} from "lucide-react";
import { hrURI, userURI } from "../../../mainApi";

const ManageManagers = ({
  managers,
  searchTerm,
  setSearchTerm,
  handleActivateManager,
  handleDeactivateManager,
}) => {
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    phoneNumber: "",
    department: "",
  });

  //added
  
  const handleViewManager = (manager) => {
  alert(`
Name: ${manager.name}
Email: ${manager.email}
Department: ${manager.department}
Status: ${manager.status}
  `);
};

const handleEditManager = (manager) => {
  console.log("Edit manager:", manager);
  // later: open modal or navigate
};


  const filteredManagers = managers.filter(
    (manager) =>
      manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manager.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manager.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddManager = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${userURI}/register`, formData, {
        withCredentials: true,
      });

      setFormOpen(false);
      setFormData({
        userName: "",
        email: "",
        password: "",
        phoneNumber: "",
        department: "",
      });

      window.location.reload();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add manager");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 ">
            Manager Directory
          </h2>
          <p className="text-[14px] font-black text-slate-400  mt-1">
            Global Personnel Control
          </p>
        </div>
        <button
          onClick={() => setFormOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-200 transition-all flex items-center gap-2 font-bold text-sm"
        >
          <UserPlus className="w-5 h-5" />
          Provision Manager
        </button>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-2 border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by name, email, or department..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const csv = [
                ["Name", "Email", "Department", "Status"],
                ...filteredManagers.map((m) => [
                  m.name,
                  m.email,
                  m.department,
                  m.status,
                ]),
              ]
                .map((e) => e.join(","))
                .join("\n");

              const blob = new Blob([csv], { type: "text/csv" });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "managers.csv";
              a.click();
            }}
            className="px-5 py-3 bg-white border border-slate-200 rounded-xl flex items-center gap-2 text-[10px] font-black hover:bg-slate-50 transition-all"
          >
            <Download className="w-4 h-4 text-slate-400" /> Export
          </button>
        </div>
      </div>

      {/* Manager Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredManagers.map((manager) => (
          <div
            key={manager.id}
            className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 group relative overflow-hidden"
          >
            {/* Background Accent */}
            <div
              className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full blur-3xl opacity-10 transition-colors ${
                manager.status === "active" ? "bg-emerald-500" : "bg-rose-500"
              }`}
            ></div>

            <div className="flex items-start justify-between mb-6 relative z-10">
              <div className="relative">
                <img
                  src={
                    manager.avatar ||
                    "https://ui-avatars.com/api/?name=" + manager.name
                  }
                  alt={manager.name}
                  className="w-20 h-20 rounded-3xl object-cover ring-4 ring-slate-50 group-hover:scale-105 transition-transform duration-500"
                />
                <span
                  className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white ${
                    manager.status === "active"
                      ? "bg-emerald-500"
                      : "bg-slate-300"
                  }`}
                ></span>
              </div>
              <button className="text-slate-300 hover:text-slate-600 transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1 mb-6">
              <h3 className="text-xl font-black text-slate-900">
                {manager.name}
              </h3>
              <div className="flex items-center gap-2 text-blue-600">
                <Building className="w-3 h-3" />
                <p className="text-[10px] font-black ">
                  {manager.department}
                </p>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Mail className="w-3 h-3" />
                <p className="text-xs font-bold truncate">{manager.email}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Users className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400">
                    Team Management
                  </p>
                  <p className="text-sm font-black text-slate-700">
                    {manager.employees} Units
                  </p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-[9px] font-black  border ${
                  manager.status === "active"
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                    : "bg-rose-50 text-rose-600 border-rose-100"
                }`}
              >
                {manager.status}
              </span>
            </div>

            <div className="flex gap-3">
              {manager.status === "active" ? (
                <button
                  onClick={() => handleDeactivateManager(manager.id)}
                  className="flex-1 bg-rose-50 text-rose-600 py-3 rounded-xl flex justify-center items-center gap-2 text-[12px] font-black  hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                >
                  <XCircle className="w-4 h-4" /> Deactivate
                </button>
              ) : (
                <button
                  onClick={() => handleActivateManager(manager.id)}
                  className="flex-1 bg-emerald-50 text-emerald-600 py-3 rounded-xl flex justify-center items-center gap-2 text-[12px] font-black  hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                >
                  <CheckCircle className="w-4 h-4" /> Activate
                </button>
              )}
             <button
  onClick={() => handleViewManager(manager)}
  className="p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all text-slate-400 hover:text-blue-600 shadow-sm"
>
  <Eye className="w-4 h-4" />
</button>

<button
  onClick={() => handleEditManager(manager)}
  className="p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all text-slate-400 hover:text-blue-600 shadow-sm"
>
  <Edit className="w-4 h-4" />
</button>

            </div>
          </div>
        ))}
      </div>

      {/* MODAL - ADD MANAGER */}
      {formOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-100 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl border border-white/20 relative overflow-hidden">
            {/* Modal Header Decor */}
            <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>

            <div className="mb-8">
              <h3 className="text-2xl font-black text-slate-900 ">
                Provision Account
              </h3>
              <p className="text-[10px] font-bold text-slate-400 mt-1">
                Register new management personnel
              </p>
            </div>

            <form onSubmit={handleAddManager} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400  ml-1">
                    Identity
                  </label>
                  <input
                    name="userName"
                    placeholder="Full Name"
                    value={formData.userName}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border-2 border-slate-50 px-5 py-3.5 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400  ml-1">
                    Office
                  </label>
                  <input
                    name="department"
                    placeholder="Department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border-2 border-slate-50 px-5 py-3.5 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 ml-1">
                  Access Email
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-2 border-slate-50 px-5 py-3.5 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400   ml-1">
                    Phone
                  </label>
                  <input
                    name="phoneNumber"
                    placeholder="+1 (555) 000"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border-2 border-slate-50 px-5 py-3.5 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400                                                                                                                                                                                                                                ml-1">
                    Security
                  </label>
                  <input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border-2 border-slate-50 px-5 py-3.5 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="flex-1 px-4 py-4 border-2 border-slate-100 rounded-2xl text-[10px] font-black text-slate-400 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-2 bg-blue-600 text-white px-4 py-4 rounded-2xl text-[10px] font-black  hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all disabled:opacity-50"
                >
                  {loading ? "System Provisioning..." : "Finalize Registration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Simple Internal Component for icons
const Building = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
    />
  </svg>
);

export default ManageManagers;
