import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Calendar,
  Clock,
  Download,
  FileText,
  Search,
  UserCheck,
} from "lucide-react";
import { hrURI } from "../../../mainApi";

const EmployeeLoginDetails = () => {
  const [records, setRecords] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchLoginDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${hrURI}/employee-login-details`, {
        withCredentials: true,
      });
      setRecords(res.data.data || []);
    } catch (error) {
      console.error("Employee login details fetch error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoginDetails();
  }, []);

  const visibleRecords = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return records.filter((record) => {
      const user = record.userId || {};
      const manager = user.managerId || {};
      const matchesDate = !selectedDate || record.date === selectedDate;
      const matchesSearch =
        !query ||
        user.userName?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.department?.toLowerCase().includes(query) ||
        manager.userName?.toLowerCase().includes(query);

      return matchesDate && matchesSearch;
    });
  }, [records, searchTerm, selectedDate]);

  const summary = useMemo(() => {
    const completed = visibleRecords.filter((record) => record.endTime).length;
    const active = visibleRecords.filter(
      (record) => record.startTime && !record.endTime
    ).length;
    const totalHours = visibleRecords.reduce(
      (sum, record) => sum + Number(record.totalHours || 0),
      0
    );

    return {
      total: visibleRecords.length,
      completed,
      active,
      totalHours: totalHours.toFixed(1),
    };
  }, [visibleRecords]);

  const formatTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const escapeCSV = (value) => {
    const text = value === null || value === undefined ? "" : String(value);
    return `"${text.replaceAll('"', '""')}"`;
  };

  const downloadCSV = () => {
    if (!visibleRecords.length) {
      alert("No employee login records found for this view.");
      return;
    }

    const headers = [
      "Employee",
      "Email",
      "Department",
      "Manager",
      "Date",
      "Login Time",
      "Logout Time",
      "Total Hours",
      "Status",
    ];

    const rows = visibleRecords.map((record) => {
      const user = record.userId || {};
      const manager = user.managerId || {};
      return [
        user.userName,
        user.email,
        user.department || "-",
        manager.userName || "-",
        record.date,
        formatDateTime(record.startTime),
        formatDateTime(record.endTime),
        record.totalHours ?? 0,
        record.status,
      ].map(escapeCSV);
    });

    const csv = [headers.map(escapeCSV), ...rows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Employee_Login_Details_${selectedDate || "all"}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              Employee Login Details
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-400">
              Employee login and logout records from attendance clock-in data.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search employee"
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <button
              onClick={downloadCSV}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric title="Records" value={summary.total} icon={FileText} />
        <Metric title="Logged In" value={summary.active} icon={Clock} />
        <Metric title="Logged Out" value={summary.completed} icon={UserCheck} />
        <Metric title="Total Hours" value={summary.totalHours} icon={Clock} />
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-225 text-left">
            <thead className="bg-slate-50 text-xs tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">Employee</th>
                <th className="px-5 py-4">Department</th>
                <th className="px-5 py-4">Manager</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Login</th>
                <th className="px-5 py-4">Logout</th>
                <th className="px-5 py-4">Hours</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-5 py-10 text-center text-slate-500">
                    Loading employee login details...
                  </td>
                </tr>
              ) : visibleRecords.length ? (
                visibleRecords.map((record) => {
                  const user = record.userId || {};
                  const manager = user.managerId || {};
                  return (
                    <tr key={record._id} className="hover:bg-blue-50/40">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              user.imageUrl ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                user.userName || "Employee"
                              )}`
                            }
                            alt=""
                            className="h-10 w-10 rounded-lg border border-slate-100 object-cover"
                          />
                          <div>
                            <p className="font-bold text-slate-800">
                              {user.userName || "Unknown"}
                            </p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                        {user.department || "-"}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {manager.userName || "-"}
                      </td>
                      <td className="px-5 py-4 font-mono text-sm text-slate-600">
                        {record.date}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-700">
                        {formatTime(record.startTime)}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-700">
                        {formatTime(record.endTime)}
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-slate-700">
                        {Number(record.totalHours || 0).toFixed(2)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                            record.endTime
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {record.endTime ? "Logged out" : "Logged in"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="px-5 py-10 text-center text-slate-500">
                    No employee login details found.
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

const Metric = ({ title, value, icon: Icon }) => (
  <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <p className="text-sm font-semibold text-slate-500">{title}</p>
      {Icon ? React.createElement(Icon, { className: "h-4 w-4 text-blue-600" }) : null}
    </div>
    <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>
  </div>
);

export default EmployeeLoginDetails;
