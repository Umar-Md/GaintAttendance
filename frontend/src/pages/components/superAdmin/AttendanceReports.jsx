import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Calendar,
  Clock,
  Download,
  FileText,
  Filter,
  UserCheck,
} from "lucide-react";
import { superAdminURI } from "../../../mainApi";

const roleLabels = {
  Hr: "HR",
  Manager: "Manager",
  Employee: "Employee",
};

const AttendanceReports = () => {
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [roleFilter, setRoleFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${superAdminURI}/attendance`, {
        withCredentials: true,
      });
      setAttendance(res.data.data || []);
    } catch (error) {
      console.error("Super admin attendance fetch error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const visibleAttendance = useMemo(() => {
    return attendance.filter((record) => {
      const role = record.userId?.role;
      return roleFilter === "All" || role === roleFilter;
    });
  }, [attendance, roleFilter]);

  const summary = useMemo(() => {
    const records = visibleAttendance;
    const completed = records.filter((record) => record.endTime).length;
    const present = records.filter((record) => record.status === "Present").length;
    const totalHours = records.reduce(
      (sum, record) => sum + Number(record.totalHours || 0),
      0
    );

    return {
      total: records.length,
      completed,
      present,
      totalHours: totalHours.toFixed(1),
    };
  }, [visibleAttendance]);

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

  const getDateRange = (type) => {
    const base = new Date(`${selectedDate}T00:00:00`);
    const from = new Date(base);
    const to = new Date(base);

    if (type === "weekly") {
      from.setDate(base.getDate() - 6);
    }

    if (type === "monthly") {
      from.setDate(1);
      to.setMonth(base.getMonth() + 1, 0);
    }

    return {
      from: from.toISOString().split("T")[0],
      to: to.toISOString().split("T")[0],
    };
  };

  const getRecordsForExport = (type) => {
    const { from, to } = getDateRange(type);
    return visibleAttendance.filter(
      (record) => record.date >= from && record.date <= to
    );
  };

  const escapeCSV = (value) => {
    const text = value === null || value === undefined ? "" : String(value);
    return `"${text.replaceAll('"', '""')}"`;
  };

  const downloadCSV = (records, type) => {
    if (!records.length) {
      alert("No attendance records found for this report.");
      return;
    }

    const headers = [
      "Name",
      "Email",
      "Role",
      "Department",
      "Date",
      "Clock In",
      "Clock Out",
      "Total Hours",
      "Status",
      "Reports To",
    ];

    const rows = records.map((record) => {
      const user = record.userId || {};
      const manager = user.managerId?.userName || user.hrId?.userName || "";
      return [
        user.userName,
        user.email,
        roleLabels[user.role] || user.role,
        user.department || "-",
        record.date,
        formatDateTime(record.startTime),
        formatDateTime(record.endTime),
        record.totalHours ?? 0,
        record.status,
        manager || "-",
      ].map(escapeCSV);
    });

    const csv = [headers.map(escapeCSV), ...rows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SuperAdmin_Attendance_${type}_${selectedDate}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExport = (type) => {
    downloadCSV(getRecordsForExport(type), type);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-100">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Attendance Reports
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              HR, Manager, and Employee clock-in and clock-out records.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="relative">
              <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-8 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="All">All roles</option>
                <option value="Hr">HR</option>
                <option value="Manager">Manager</option>
                <option value="Employee">Employee</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric title="Records" value={summary.total} icon={FileText} />
        <Metric title="Present Days" value={summary.present} icon={UserCheck} />
        <Metric title="Clocked Out" value={summary.completed} icon={Clock} />
        <Metric title="Total Hours" value={summary.totalHours} icon={Clock} />
      </div>

      <div className="rounded-lg bg-white p-4 shadow-sm border border-slate-100">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold text-slate-800">Export Reports</h2>
          <div className="grid gap-2 sm:grid-cols-3">
            <ExportButton label="Daily" onClick={() => handleExport("daily")} />
            <ExportButton label="Weekly" onClick={() => handleExport("weekly")} />
            <ExportButton
              label="Monthly"
              onClick={() => handleExport("monthly")}
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left">
            <thead className="bg-slate-50 text-xs tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">Person</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Clock In</th>
                <th className="px-5 py-4">Clock Out</th>
                <th className="px-5 py-4">Hours</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-10 text-center text-slate-500">
                    Loading attendance records...
                  </td>
                </tr>
              ) : visibleAttendance.length ? (
                visibleAttendance.map((record) => {
                  const user = record.userId || {};
                  return (
                    <tr key={record._id} className="hover:bg-blue-50/40">
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-800">
                          {user.userName || "Unknown"}
                        </p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                        {roleLabels[user.role] || user.role || "-"}
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
                            record.status === "Present"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-5 py-10 text-center text-slate-500">
                    No attendance records found.
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
      <Icon className="h-4 w-4 text-blue-600" />
    </div>
    <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>
  </div>
);

const ExportButton = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700"
  >
    <Download className="h-4 w-4" />
    {label}
  </button>
);

export default AttendanceReports;
