import React, { useState, useEffect } from "react";
import {
  User,
  Clock,
  CalendarDays,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  ChevronRight,
  MessageCircle,
  ClipboardList, // Added for Chat
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { employeeURI, userURI } from "../mainApi";
import FloatingChat from "./components/FloatingChat";

import EmployeeDashboard from "./components/employee/EmployeeDashboard";
import EmployeeProfile from "./components/employee/EmployeeProfile";
import EmployeeAttendance from "./components/employee/EmployeeAttendance";
import EmployeeLeaves from "./components/employee/EmployeeLeaves";
import EmployeeDocuments from "./components/employee/EmployeeDocuments";
import ChatPage from "./Chat/ChatPage"; // Added ChatPage import
import MyTasks from "./MyTasks";

const EmployeeDashboardPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
    fetchDashboardData();
  }, []);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [activeTab]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${employeeURI}/profile`, {
        withCredentials: true,
      });
      setProfile(res.data.data);
    } catch (err) {
      console.error("Profile fetch error", err);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [attendanceRes, leavesRes, holidaysRes] = await Promise.all([
        axios.get(`${employeeURI}/attendance`, { withCredentials: true }),
        axios.get(`${employeeURI}/leaves`, { withCredentials: true }),
        axios.get(`${employeeURI}/holidays`, {
          params: { year: new Date().getFullYear() },
          withCredentials: true,
        }),
      ]);
      setAttendance(attendanceRes.data.data || []);
      setLeaves(leavesRes.data.data || []);
      setHolidays(holidaysRes.data.data || []);
    } catch (err) {
      console.error("Dashboard data fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.get(`${userURI}/logout`, { withCredentials: true });
      localStorage.removeItem("role");
      navigate("/login");
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  const menuItems = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "profile", label: "My Profile", icon: User },
    { key: "tasks", label: "Tasks", icon: ClipboardList },
    { key: "attendance", label: "Attendance", icon: Clock },
    { key: "leaves", label: "Leave Requests", icon: CalendarDays },
    { key: "documents", label: "Status Tracker", icon: LayoutDashboard },
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b border-blue-600"></div>
        </div>
      );
    }
    switch (activeTab) {
      case "dashboard":
        return (
          <EmployeeDashboard
            profile={profile}
            attendance={attendance}
            leaves={leaves}
            holidays={holidays}
            fetchDashboardData={fetchDashboardData}
          />
        );
      case "profile":
        return (
          <EmployeeProfile profile={profile} fetchProfile={fetchProfile} />
        );
      case "tasks":
        return <MyTasks />;
      case "attendance":
        return <EmployeeAttendance attendance={attendance} />;
      case "leaves":
        return (
          <EmployeeLeaves
            leaves={leaves}
            fetchDashboardData={fetchDashboardData}
          />
        );
      case "documents":
        return <EmployeeDocuments />;
      // case "chat":
      //   return <ChatPage user={profile} />; // Added Chat Case
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white flex overflow-x-hidden">
      {profile && <FloatingChat user={profile} />}
      {/* MOBILE SIDEBAR OVERLAY */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-999"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed lg:sticky left-0 top-0 h-screen w-72 bg-white text-black flex flex-col z-999 border-r border-gray-100 transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} overflow-y-auto`}
      >
        {/* Logo Section */}
        <div className="p-8 border-b border-gray-300 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-black tracking-tight">
              Attendance
            </h1>
            <p className="text-[12px] text-gray-500 font-bold mt-0.5">
              Employee Portal
            </p>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 text-gray-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Mini Profile */}
        {/* User Mini Profile */}
        <div className="px-6 py-8">
          <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
            {/* FIXED IMAGE BLOCK BELOW */}
            {profile?.imageUrl ? (
              <img
                src={profile.imageUrl}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover grayscale-[0.5] contrast-125 shrink-0 border border-white shadow-sm"
                onError={(e) => {
                  e.target.style.display = "none";
                }} // Fallback if URL is invalid
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0 border border-white shadow-sm">
                <User className="text-slate-500" size={20} />
              </div>
            )}

            <div className="min-w-0">
              <h3 className="font-bold text-sm text-black truncate">
                {profile?.userName || "User"}
              </h3>
              <p className="text-[10px] text-gray-800 font-bold truncate">
                {profile?.department || "Staff"}
              </p>c
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center justify-between px-5 py-4 rounded-xl transition-all duration-200 group ${
                activeTab === item.key
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "text-black hover:bg-gray-50 hover:text-black"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  size={18}
                  className={
                    activeTab === item.key
                      ? "text-white"
                      : "text-gray-400 group-hover:text-blue-600"
                  }
                />
                <span className="font-bold text-sm tracking-tight">
                  {item.label}
                </span>
              </div>
              {activeTab === item.key && (
                <ChevronRight size={14} className="opacity-70" />
              )}
            </button>
          ))}
        </nav>

        {/* Logout Section */}
        <div className="p-6 border-t mt-4 border-gray-400 position-fixed bottom-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-5 py-3.5 w-full bg-red-600 hover:bg-red-500 text-white hover:text-white rounded-xl transition-all group font-bold text-sm"
          >
            <LogOut
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#fcfcfc]">
        {/* HEADER */}
        <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-gray-300 px-4 sm:px-10 py-5 sm:py-7">
          <div className="flex justify-between items-center max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2.5 bg-gray-50 rounded-xl text-black hover:bg-gray-100"
              >
                <Menu size={20} />
              </button>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-black text-black capitalize">
                  {activeTab === "dashboard"
                    ? "Overview"
                    : activeTab.replace("-", " ")}
                </h1>
                <p className="text-[12px] sm:text-[14px] text-gray-400 font-bold hidden sm:block mt-0.5">
                  Welcome back,{" "}
                  <span className="text-blue-600">
                    {profile?.userName?.split(" ")[0] || "Employee"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-10 max-w-7xl mx-auto w-full pb-24 lg:pb-8 overflow-x-hidden">
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-700">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* BOTTOM MOBILE NAV */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-8 py-4 flex justify-between items-center z-50 shadow-up">
        {menuItems.slice(0, 5).map(
          (
            item, // Adjusted slice to include Chat icon if space allows
          ) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === item.key ? "text-blue-600 scale-110" : "text-gray-300"}`}
            >
              <item.icon
                size={22}
                strokeWidth={activeTab === item.key ? 2.5 : 2}
              />
              <span
                className={`text-[9px] font-black uppercase ${activeTab === item.key ? "opacity-100" : "opacity-0"}`}
              >
                {item.key.slice(0, 4)}
              </span>
            </button>
          ),
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboardPage;
