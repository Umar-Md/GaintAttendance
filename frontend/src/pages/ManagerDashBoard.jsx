import React, { useState, useEffect } from "react";
import {
  User,
  Users,
  Settings,
  LogOut,
  Home,
  Clock,
  CalendarDays,
  ChevronRight,
  LayoutGrid,
  Menu,
  X,
  ClipboardList,
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { managerURI, userURI } from "../mainApi";

// Component Imports
import ManagerDashboard from "./components/manager/ManagerDashboard";
import ManagerProfile from "./components/manager/ManagerProfile";
import MyTeam from "./components/manager/MyTeam";
import TeamAttendance from "./components/manager/TeamAttendance";
import TeamLeaves from "./components/manager/TeamLeaves";
import ManagerSettings from "./components/manager/ManagerSettings";
import ManagerAttendance from "./components/manager/ManagerAttendance";
import ManagerLeaves from "./components/manager/ManagerLeaves";
import FloatingChat from "./components/FloatingChat";
import ManagerProjects from "./components/manager/ManagerTaskBoard";
import ChatPage from "./Chat/ChatPage";

const ManagerDashboardPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [team, setTeam] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(null);

  const navigate = useNavigate();

  // 🔹 Initialization: Fetch all necessary data on mount
  useEffect(() => {
    fetchTeam();
    fetchAttendance();
    fetchLeaves();
    fetchProfile();
  }, []);

  // 🔹 UX: Close sidebar and reset scroll position when switching tabs
  useEffect(() => {
    setIsSidebarOpen(false);
    window.scrollTo(0, 0);
  }, [activeTab]);

  const fetchTeam = async () => {
    try {
      const res = await axios.get(`${managerURI}/employees`, { withCredentials: true });
      const formatted = res.data.data.map((emp) => ({
        id: emp._id,
        name: emp.userName,
        email: emp.email,
        department: emp.department || "N/A",
        imageUrl: emp.imageUrl,
        status: emp.isActive ? "active" : "inactive",
        joinDate: new Date(emp.createdAt).toISOString().split("T")[0],
      }));
      setTeam(formatted);
    } catch (err) {
      console.error("Team fetch error", err);
    }
  };

  const fetchAttendance = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await axios.get(`${managerURI}/team-attendance?date=${today}`, { withCredentials: true });
      const formatted = res.data.data.map((att) => ({
        id: att._id,
        name: att.userId?.userName || "Unknown",
        date: att.date,
        status: att.status,
        checkIn: att.startTime,
        checkOut: att.endTime,
        department: att.userId?.department || "N/A",
      }));
      setAttendance(formatted);
    } catch (err) {
      console.error("Attendance fetch error", err);
    }
  };

  const fetchLeaves = async () => {
    try {
      const res = await axios.get(`${managerURI}/team-leaves`, { withCredentials: true });
      const formatted = res.data.data.map((leave) => ({
        id: leave._id,
        name: leave.user?.userName || "Unknown",
        type: leave.leaveType,
        from: new Date(leave.fromDate).toISOString().split("T")[0],
        to: new Date(leave.toDate).toISOString().split("T")[0],
        status: leave.status,
      }));
      setLeaves(formatted);
    } catch (err) {
      console.error("Leave fetch error", err);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${managerURI}/profile`, { withCredentials: true });
      setProfile(res.data.data);
    } catch (err) {
      console.error("Profile fetch error", err);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.get(`${userURI}/logout`, { withCredentials: true });
      navigate("/login");
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <ManagerDashboard team={team} attendance={attendance} leaves={leaves} />;
      case "profile":
        return <ManagerProfile />;
      case "projects":
        return <ManagerProjects />;
      case "myteam":
        return (
          <MyTeam
            team={team}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            fetchTeam={fetchTeam}
          />
        );
      case "myattendance":
        return <ManagerAttendance />;
      case "myleaves":
        return <ManagerLeaves />;
      case "attendance":
        return <TeamAttendance attendance={attendance} />;
      case "leaves":
        return <TeamLeaves leaves={leaves} />;
      case "chat":
        return <ChatPage user={profile} />;
      case "settings":
        return <ManagerSettings />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      {profile && <FloatingChat user={profile} />}

      {/* 📱 MOBILE TOP NAV BAR */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-50 flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#618DF4] rounded-lg flex items-center justify-center">
            <LayoutGrid className="text-white w-5 h-5" />
          </div>
          <span className="font-black text-lg italic">
            Manager<span className="text-[#618DF4]">.</span>
          </span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6 text-slate-600" />
        </button>
      </div>

      {/* 🌑 SIDEBAR OVERLAY (Mobile only) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-60 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed left-0 top-0 h-screen w-72 bg-white shadow-2xl z-70 flex flex-col transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#618DF4] rounded-xl flex items-center justify-center">
              <LayoutGrid className="text-white w-6 h-6" />
            </div>
            <span className="font-black text-xl italic">
              Manager<span className="text-[#618DF4]">.</span>
            </span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-full"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <div className="pb-4 px-4 text-[11px] font-bold text-slate-400 tracking-wider">MAIN MENU</div>
          {[
            { key: "dashboard", icon: Home, label: "Dashboard" },
            { key: "profile", icon: User, label: "Profile" },
            { key: "projects", icon: ClipboardList, label: "Projects" },
            { key: "myteam", icon: Users, label: "My Team" },
          ].map((item) => (
            <SidebarItem
              key={item.key}
              item={item}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          ))}

          <div className="pt-8 pb-4 px-4 text-[11px] font-bold text-slate-400 tracking-wider">MANAGEMENT</div>
          {[
            { key: "attendance", icon: Clock, label: "Team Attendance" },
            { key: "leaves", icon: CalendarDays, label: "Team Leaves" },
          ].map((item) => (
            <SidebarItem
              key={item.key}
              item={item}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          ))}

          <div className="pt-8 pb-4 px-4 text-[11px] font-bold text-slate-400 tracking-wider">PERSONAL</div>
          {[
            { key: "myattendance", icon: Clock, label: "My Attendance" },
            { key: "myleaves", icon: CalendarDays, label: "My Leaves" },
            { key: "settings", icon: Settings, label: "Settings" },
          ].map((item) => (
            <SidebarItem
              key={item.key}
              item={item}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          ))}
        </nav>

        <div className="p-6 mt-auto border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 bg-[#EF233C] text-white py-3.5 rounded-xl font-black shadow-lg shadow-rose-100 transition-all active:scale-95 hover:bg-rose-600"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* 🚀 MAIN CONTENT AREA */}
      <main className="flex-1 lg:ml-72 p-4 sm:p-6 lg:p-10 mt-16 lg:mt-0">
        <div className="max-w-350 mx-auto min-h-full">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

// 🔹 Sub-component for Sidebar Buttons
const SidebarItem = ({ item, activeTab, setActiveTab }) => {
  const Icon = item.icon;
  const isActive = activeTab === item.key;

  return (
    <button
      onClick={() => setActiveTab(item.key)}
      className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all duration-200 group
        ${isActive 
          ? "bg-[#618DF4] text-white shadow-lg shadow-indigo-100" 
          : "text-slate-600 hover:bg-slate-50 active:bg-slate-100"}`}
    >
      <div className="flex items-center gap-4">
        <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-[#618DF4]"}`} />
        <span className={`text-sm font-bold ${isActive ? "text-white" : "text-slate-600 group-hover:text-slate-900"}`}>
          {item.label}
        </span>
      </div>
      {isActive && <ChevronRight className="w-4 h-4 animate-in slide-in-from-left-1 duration-200" />}
    </button>
  );
};

export default ManagerDashboardPage;