import React, { useState } from "react";
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  UserPlus,
  CheckCircle,
  XCircle,
  Mail,
  Building,
  Calendar,
  Phone,
  Lock,
  X,
} from "lucide-react";
import axios from "axios";
import { managerURI, userURI } from "../../../mainApi";

const MyTeam = ({ team, searchTerm, setSearchTerm, fetchTeam }) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    userName: "",
    email: "",
    department: "",
    password: "",
    phoneNumber: "",
  });

  const filteredTeam = team.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // <-- handleExport moved here
  const handleExport = () => {
    if (!filteredTeam.length) return alert("No data to export");

    const headers = ["Name", "Email", "Department", "Status", "Join Date"];
    const rows = filteredTeam.map((emp) => [
      emp.name,
      emp.email,
      emp.department,
      emp.status,
      emp.joinDate,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "team_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeactivate = async (id) => {
    try {
      await axios.patch(
        `${managerURI}/employees/${id}/deactivate`,
        {},
        { withCredentials: true }
      );
      fetchTeam();
    } catch (error) {
      alert("Failed to deactivate employee");
    }
  };

  const handleActivate = async (id) => {
    try {
      await axios.patch(
        `${managerURI}/employees/${id}/activate`,
        {},
        { withCredentials: true }
      );
      fetchTeam();
    } catch (error) {
      alert("Failed to activate employee");
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${userURI}/register`, form, { withCredentials: true });
      setShowModal(false);
      setForm({
        userName: "",
        email: "",
        department: "",
        password: "",
        phoneNumber: "",
      });
      fetchTeam();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-8 animate-in fade-in duration-700">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-4xl font-black text-slate-900 ">
            Team
            </h2>
            <p className="text-slate-600 text-m font-medium mt-1">
              Manage your department members and their account status.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-emerald-500 text-white px-6 py-3 rounded-2xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 font-bold text-sm"
          >
            <UserPlus className="w-5 h-5" />
            Add New Member
          </button>
        </div>

        {/* Search & Action Bar */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, or department..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 outline-none transition-all shadow-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="px-5 py-3 bg-white border border-slate-100 rounded-2xl flex items-center gap-2 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-all"
            >
              <Download className="w-4 h-4 text-slate-400 " /> Export
            </button>
          </div>
        </div>

        {/* Employee Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTeam.map((employee) => (
            <div
              key={employee.id}
              className="group bg-white border border-slate-100 p-6 rounded-4xl shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="relative">
                  <img
                    src={employee?.imageUrl}
                    alt={employee.name}
                    className="w-20 h-20 rounded-3xl object-cover border-4 border-slate-50 shadow-inner"
                  />
                  <div
                    className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white ${
                      employee.status === "active"
                        ? "bg-emerald-500"
                        : "bg-rose-500"
                    }`}
                  ></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-slate-900 text-lg truncate ">
                    {employee.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[12px]   mb-1">
                    <Building className="w-3 h-3" /> {employee.department}
                  </div>
                  <p className="text-slate-400 text-xs truncate flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {employee.email}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50/80 rounded-2xl p-4 mb-6 flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-[12px] font-black text-slate-600  ">
                    Joined On
                  </p>
                  <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-slate-400" />{" "}
                    {employee.joinDate}
                  </p>
                </div>
                <span
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black   ${
                    employee.status === "active"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {employee.status}
                </span>
              </div>

              <div className="flex gap-2">
                {employee.status === "active" ? (
                  <button
                    onClick={() => handleDeactivate(employee.id)}
                    className="flex-1 bg-rose-50 text-rose-600 py-3 rounded-xl font-bold text-xs   hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <XCircle className="w-4 h-4" /> Deactivate
                  </button>
                ) : (
                  <button
                    onClick={() => handleActivate(employee.id)}
                    className="flex-1 bg-emerald-50 text-emerald-600 py-3 rounded-xl font-bold text-xs   hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4" /> Activate Account
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-100 p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-[#0F172A] p-8 text-white relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <h3 className="text-2xl font-black ">
                Add New Employee
              </h3>
              <p className="text-slate-400 text-sm mt-1">
                Fill in the details to create a new team account.
              </p>
            </div>

            <form onSubmit={handleAddEmployee} className="p-8 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400   ml-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input
                      type="text"
                      placeholder="John Doe"
                      required
                      value={form.userName}
                      onChange={(e) =>
                        setForm({ ...form, userName: e.target.value })
                      }
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 font-bold text-slate-700 text-sm transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400   ml-1">
                    Department
                  </label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input
                      type="text"
                      placeholder="Engineering"
                      value={form.department}
                      onChange={(e) =>
                        setForm({ ...form, department: e.target.value })
                      }
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 font-bold text-slate-700 text-sm transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400   ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    type="email"
                    placeholder="john@company.com"
                    required
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 font-bold text-slate-700 text-sm transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400   ml-1">
                    Temporary Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 font-bold text-slate-700 text-sm transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400   ml-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input
                      type="text"
                      placeholder="+1 234 567 890"
                      value={form.phoneNumber}
                      onChange={(e) =>
                        setForm({ ...form, phoneNumber: e.target.value })
                      }
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 font-bold text-slate-700 text-sm transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-4 border border-slate-100 text-slate-500 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  disabled={loading}
                  className="flex-1 px-4 py-4 bg-emerald-500 text-white rounded-2xl font-black text-sm   shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Registering..." : "Add Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default MyTeam;
