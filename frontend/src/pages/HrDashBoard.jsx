import React, { useState, useEffect } from "react";
import {
  User,
  Users,
  Calendar,
  Settings,
  LogOut,
  Home,
  Clock,
  CalendarDays,
  ChevronRight,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import Dashboard from "./components/hr/Dashboard";
import HRProfile from "./components/hr/HrProfile";
import ManageManagers from "./components/hr/ManageManagers";
import Attendance from "./components/hr/Attendance";
import Leaves from "./components/hr/Leaves";
import SettingsPage from "./components/hr/Settings";
import { mockManagers, mockAttendance, mockLeaves } from "../utils/data";
import axios from "axios";
import { hrURI, userURI } from "../mainApi";
import { useNavigate } from "react-router-dom";
import FloatingChat from "./components/FloatingChat";
import HrCreateProject from "./components/hr/HrCreateProject";

const HRDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [managers, setManagers] = useState(mockManagers);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState(mockLeaves);
  const [searchTerm, setSearchTerm] = useState("");
  const [profile, setProfile] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const formatTime = (dateString) => {
    if (!dateString) return "--:--";
    return new Date(dateString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  /* --- DATA FETCHING --- */
  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${hrURI}/getprofile`, {
        withCredentials: true,
      });
      setProfile(res.data.data);
    } catch (err) {
      console.error("HR profile fetch error", err);
    }
  };

  const fetchManagers = async () => {
    try {
      const res = await axios.get(`${hrURI}/getManagers`, {
        withCredentials: true,
      });
      if (res.data && res.data.data) {
        const formattedManagers = res.data.data.map((m) => ({
          id: m._id,
          name: m.userName,
          email: m.email,
          department: m.department || "N/A",
          avatar: m.imageUrl || "",
          employees: 0,
          status: m.isActive ? "active" : "inactive",
        }));
        setManagers(formattedManagers);
      }
    } catch (error) {
      console.error("Error fetching managers", error);
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await axios.get(`${hrURI}/manager-attendance`, {
        withCredentials: true,
      });
      const formatted = res.data.data.map((att) => ({
        id: att._id,
        name: att.userId?.userName || "Unknown",
        date: att.date,
        status: att.status,
        checkIn: formatTime(att.startTime),
        checkOut: formatTime(att.endTime),
        department: att.userId?.department || "N/A",
      }));
      setAttendance(formatted);
    } catch (err) {
      console.error("Attendance fetch error", err);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchManagers();
    fetchAttendance();
  }, []);

  /* --- MANAGER STATUS HANDLERS --- */
  const handleActivateManager = async (id) => {
    try {
      await axios.patch(`${hrURI}/activateManager/${id}`, { isActive: true }, { withCredentials: true });
      await fetchManagers();
    } catch (error) {
      console.error(error);
      alert("Failed to activate manager");
    }
  };

  const handleDeactivateManager = async (id) => {
    try {
      await axios.patch(`${hrURI}/deleteManager/${id}`, { isActive: false }, { withCredentials: true });
      await fetchManagers();
    } catch (error) {
      console.error(error);
      alert("Failed to deactivate manager");
    }
  };

  const handleDeleteManager = async (manager) => {
    const confirmed = window.confirm(
      `Delete ${manager.name} permanently? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await axios.delete(`${hrURI}/manager/${manager.id}`, {
        withCredentials: true,
      });
      await fetchManagers();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to delete manager");
    }
  };

  const handleLogout = async () => {
    try {
      await axios.get(`${userURI}/logout`, { withCredentials: true });
      navigate("/login");
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard attendance={attendance} leaves={leaves} managers={managers} />;
      case "profile":
        return <HRProfile />;
      case "managers":
        return (
          <ManageManagers
            managers={managers}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleActivateManager={handleActivateManager}
            handleDeactivateManager={handleDeactivateManager}
            handleDeleteManager={handleDeleteManager}
          />
        );
      case "projects":
        return <HrCreateProject />;
      case "attendance":
        return <Attendance attendance={attendance} selectedDate={selectedDate} setSelectedDate={setSelectedDate} />;
      case "leaves":
        return <Leaves leaves={leaves} />;
      case "settings":
        return <SettingsPage />;
      default:
        return <Dashboard attendance={attendance} leaves={leaves} managers={managers} />;
    }
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "profile", label: "My Profile", icon: User },
    { id: "managers", label: "Manage Managers", icon: Users },
    { id: "attendance", label: "Attendance", icon: Clock },
    { id: "leaves", label: "Leave Requests", icon: CalendarDays },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">
      {profile && <FloatingChat user={profile} />}
      
      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={closeSidebar} />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed left-0 top-0 h-screen w-72 bg-white flex flex-col z-50 shadow-xl border-r border-slate-100 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-100">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="italic text-3xl font-black">HR</span>
          </div>
          <button onClick={closeSidebar} className="lg:hidden p-1 text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-4 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); closeSidebar(); }}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 ${
                activeTab === item.id
                  ? "bg-[#618df4] text-white shadow-md"
                  : "text-slate-500 hover:bg-slate-50 hover:text-[#618df4]"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-5 h-5 ${activeTab === item.id ? "text-white" : "text-slate-400"}`} />
                <span className="font-semibold text-sm">{item.label}</span>
              </div>
              {activeTab === item.id && <ChevronRight className="w-4 h-4 opacity-70" />}
            </button>
          ))}

          <button
            onClick={() => { setActiveTab("projects"); closeSidebar(); }}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 mt-1 ${
              activeTab === "projects" ? "bg-[#618df4] text-white shadow-md" : "text-slate-500 hover:bg-slate-50 hover:text-[#618df4]"
            }`}
          >
            <div className="flex items-center gap-3">
              <Calendar className={`w-5 h-5 ${activeTab === "projects" ? "text-white" : "text-slate-400"}`} />
              <span className="font-semibold text-sm">Projects</span>
            </div>
            {activeTab === "projects" && <ChevronRight className="w-4 h-4 opacity-70" />}
          </button>
        </nav>

        <div className="p-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 text-white font-bold px-4 py-3.5 bg-red-600 rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-100 active:scale-95"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col lg:ml-72 w-full">
        {/* MOBILE HEADER - Only visible on small screens */}
        <header className="lg:hidden bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-lg">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-black italic text-xl">HR Portal</span>
          </div>
          <div className="flex items-center gap-3">
             {profile && (
               <div className="w-8 h-8 rounded-full bg-[#618df4] text-white flex items-center justify-center text-xs font-bold">
                 {profile.userName?.charAt(0)}
               </div>
             )}
          </div>
        </header>

        <main className="p-4 sm:p-8">
          <div className="rounded-2xl sm:rounded-[2.5rem] bg-white p-4 sm:p-8 min-h-[85vh] shadow-sm border border-slate-100">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default HRDashboard;
