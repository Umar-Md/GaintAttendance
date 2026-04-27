import React, { useEffect, useState } from "react";
import {
  Home,
  Users,
  User,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import Dashboard from "./DashBoard";
import ManageHRs from "./ManageHRs";
import SuperAdminProfile from "./SuperAdminProfile";
import SettingsPage from "./Settings";
import FloatingChat from "../FloatingChat";

import { superAdminURI, userURI } from "../../../mainApi";

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [profile, setProfile] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${superAdminURI}/me`, {
        withCredentials: true,
      });
      setProfile(res.data.data);
    } catch (err) {
      console.error("Super admin profile error", err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get(`${userURI}/logout`, { withCredentials: true });
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "hrs":
        return <ManageHRs />;
      case "profile":
        return <SuperAdminProfile profile={profile} />;
      case "settings":
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      {profile && <FloatingChat user={profile} />}

      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden" 
          onClick={closeSidebar}
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside className={`fixed left-0 top-0 h-screen w-64 bg-white border-r shadow-sm z-40 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-8 flex justify-between items-center">
          {/* <h1 className="text-2xl font-black text-blue-600">
            Admin Portal
          </h1> */}
          <img src="/src/assets/Gaint_logo.png" alt="Gaint Logo" className="w-32 h-7"/>
          <button onClick={closeSidebar} className="lg:hidden p-1 text-gray-500">
            <X size={24} />
          </button>
        </div>

        <nav className="mt-4">
          <SidebarButton
            icon={<Home size={20} />}
            label="Dashboard"
            active={activeTab === "dashboard"}
            onClick={() => { setActiveTab("dashboard"); closeSidebar(); }}
          />

          <SidebarButton
            icon={<Users size={20} />}
            label="Manage HRs"
            active={activeTab === "hrs"}
            onClick={() => { setActiveTab("hrs"); closeSidebar(); }}
          />

          <SidebarButton
            icon={<User size={20} />}
            label="Admin Profile"
            active={activeTab === "profile"}
            onClick={() => { setActiveTab("profile"); closeSidebar(); }}
          />

          <SidebarButton
            icon={<Settings size={20} />}
            label="Settings"
            active={activeTab === "settings"}
            onClick={() => { setActiveTab("settings"); closeSidebar(); }}
          />
        </nav>

        <div className="absolute bottom-0 w-full p-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex-1 h-screen flex flex-col overflow-hidden lg:ml-64">
        {/* HEADER */}
        <header className="px-4 sm:px-8 py-4 sm:py-5 border-b border-gray-200 bg-white flex justify-between items-center shadow-sm z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-gray-600 lg:hidden hover:bg-gray-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg sm:text-xl font-black text-gray-800 capitalize">
              {activeTab === "dashboard" && "Overview"}
              {activeTab === "hrs" && "HR Management"}
              {activeTab === "profile" && "Profile Settings"}
              {activeTab === "settings" && "System Settings"}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            {profile && (
              <div className="flex items-center gap-3">
                <span className="hidden sm:block text-sm font-semibold text-gray-600">
                  {profile.userName}
                </span>
                <div className="h-8 w-8 rounded-lg bg-blue-700 flex items-center justify-center text-white font-bold text-xs border border-blue-200">
                  {profile.userName?.charAt(0)}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-50/50">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

/* ======================
    SIDEBAR BUTTON COMPONENT
====================== */
const SidebarButton = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-8 py-4 transition-all duration-200 group ${
      active
        ? "text-blue-600 bg-blue-50 border-r-4 border-blue-600 font-bold"
        : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
    }`}
  >
    <span
      className={`${active ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"}`}
    >
      {icon}
    </span>
    <span className="text-sm font-medium">{label}</span>
  </button>
);

export default SuperAdminDashboard;