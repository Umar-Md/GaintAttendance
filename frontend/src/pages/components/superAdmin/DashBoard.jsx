import { useEffect, useState } from "react";
import axios from "axios";
import { superAdminURI } from "../../../mainApi";
import Chatbot from "../../Chatbot";

/* STATUS BADGE */
const StatusBadge = ({ active }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium border ${
      active
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : "bg-rose-50 text-rose-700 border-rose-200"
    }`}
  >
    <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full mr-1 sm:mr-1.5 ${active ? "bg-emerald-500" : "bg-rose-500"}`}></span>
    {active ? "Active" : "Inactive"}
  </span>
);

/* SUMMARY CARD */
const SummaryCard = ({ label, value, theme = "blue" }) => {
  const palettes = {
    green: {
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      text: "text-emerald-700",
      value: "text-emerald-900",
      glow: "hover:shadow-[0_20px_40px_-10px_rgba(16,185,129,0.4)]",
      circle: "bg-emerald-200/50",
    },
    blue: {
      bg: "bg-blue-100",
      border: "border-blue-100",
      text: "text-blue-700",
      value: "text-blue-900",
      glow: "hover:shadow-[0_20px_40px_-10px_rgba(59,130,246,0.4)]",
      circle: "bg-blue-200/50",
    },
    yellow: {
      bg: "bg-amber-50",
      border: "border-amber-100",
      text: "text-amber-700",
      value: "text-amber-900",
      glow: "hover:shadow-[0_20px_40px_-10px_rgba(245,158,11,0.4)]",
      circle: "bg-amber-200/50",
    },
  };

  const activeTheme = palettes[theme];

  return (
    <div className={`group relative overflow-hidden ${activeTheme.bg} p-5 sm:p-6 rounded-2xl border ${activeTheme.border} shadow-sm hover:-translate-y-1 transition-all duration-300 ${activeTheme.glow}`}>
      <div className="relative z-10">
        <p className={`text-xs sm:text-sm font-semibold ${activeTheme.text}`}>{label}</p>
        <h3 className={`text-2xl sm:text-4xl font-black mt-1 sm:mt-2 ${activeTheme.value}`}>
          {value.toLocaleString()}
        </h3>
      </div>
      <div className={`absolute -right-4 -bottom-4 w-16 h-16 sm:w-24 sm:h-24 ${activeTheme.circle} rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0`} />
    </div>
  );
};

/* TABLE */
const Table = ({ title, data, columns }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-200 bg-blue-200">
      <h3 className="text-md sm:text-lg font-bold text-gray-800">{title}</h3>
    </div>

    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse min-w-150">
        <thead>
          <tr className="bg-gray-100/50">
            {columns.map((c) => (
              <th
                key={c}
                className="px-4 py-3 sm:px-6 sm:py-4 text-[10px] sm:text-xs font-bold text-gray-500 border-b border-gray-100"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((u) => (
            <tr
              key={u._id}
              className="even:bg-gray-100/50 hover:bg-blue-50/40 transition-colors group"
            >
              <td className="px-4 py-3 sm:px-6 sm:py-4">
                <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate max-w-30 sm:max-w-none">
                  {u.userName}
                </div>
              </td>
              <td className="px-4 py-3 sm:px-6 sm:py-4 text-xs sm:text-sm text-gray-600 truncate max-w-37.5 sm:max-w-none">
                {u.email}
              </td>
              <td className="px-4 py-3 sm:px-6 sm:py-4">
                <span className="px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-600 text-[10px] sm:text-xs font-medium">
                  {u.department || "N/A"}
                </span>
              </td>
              <td className="px-4 py-3 sm:px-6 sm:py-4">
                <StatusBadge active={u.isActive} />
              </td>
              <td className="px-4 py-3 sm:px-6 sm:py-4 text-[10px] sm:text-xs text-gray-400 whitespace-nowrap tabular-nums">
                {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    
    {data.length === 0 && (
      <div className="p-10 text-center text-gray-400 text-sm italic bg-gray-50/30">
        No records found in this category.
      </div>
    )}
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios
      .get(`${superAdminURI}/stats`, { withCredentials: true })
      .then((res) => setStats(res.data))
      .catch(err => console.error("Error fetching stats:", err));

    const u = JSON.parse(localStorage.getItem("user"));
    setUser(u);
  }, []);

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-10 w-10 sm:h-12 sm:w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="text-gray-500 text-sm sm:text-base font-medium animate-pulse">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-12 sm:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        
        <header className="mb-8 sm:mb-10 text-left">
          <h2 className="text-2xl sm:text-4xl font-black text-gray-900 ">
            System Dashboard
          </h2>
          <p className="text-sm sm:text-base text-gray-500 mt-1 sm:mt-2 font-medium">
            Manage your organization's hierarchy and active users.
          </p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <SummaryCard 
            label="Total HRs" 
            value={stats.summary.totalHRs} 
            theme="green"
          />
          <SummaryCard 
            label="Managers" 
            value={stats.summary.totalManagers} 
            theme="blue"
          />
          <div className="sm:col-span-2 lg:col-span-1">
            <SummaryCard 
              label="Employees" 
              value={stats.summary.totalEmployees} 
              theme="yellow"
            />
          </div>
        </section>

        <section className="space-y-8 sm:space-y-10">
          <Table
            title="HR Directory"
            data={stats.data.hrs}
            columns={["Name", "Email", "Dept", "Status", "Last Login"]}
          />

          <Table
            title="Management Team"
            data={stats.data.managers}
            columns={["Name", "Email", "Dept", "Status", "Last Login"]}
          />

          <Table
            title="Employee Directory"
            data={stats.data.employees}
            columns={["Name", "Email", "Dept", "Status", "Last Login"]}
          />
        </section>
      </div>
    </div>
  );
};

export default Dashboard;