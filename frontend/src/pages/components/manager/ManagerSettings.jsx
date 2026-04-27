import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bell, Calendar, Mail, Clock, ShieldCheck, ChevronRight, Info } from "lucide-react";
import { userURI } from "../../../mainApi";

const ManagerSettings = () => {
  const [holidays, setHolidays] = useState([]);
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    attendanceReminders: true,
    leaveApprovalAlerts: true,
  });

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const res = await axios.get(`${userURI}/getPublicHolidays`, {
        params: { year: currentYear },
        withCredentials: true,
      });
      setHolidays(res.data || []);
    } catch (error) {
      console.error("Error fetching holidays", error);
    }
  };

  const handleNotificationChange = (key) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto">
      {/* HEADER */}
      <div>
        <h2 className="text-3xl font-black text-slate-800 ">Settings</h2>
        <p className="text-slate-500 text-sm font-medium mt-1">Configure your preferences and view company calendar</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* NOTIFICATION PREFERENCES */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/40 border border-slate-100 h-full">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                <Bell size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800  ">Notifications</h3>
                <p className="text-xs font-bold text-slate-400">Manage how you stay updated</p>
              </div>
            </div>

            <div className="space-y-6">
              <ToggleItem 
                icon={<Mail className="text-blue-500" />}
                title="Email Notifications" 
                description="Receive updates regarding team activity via email"
                checked={notificationSettings.emailNotifications}
                onChange={() => handleNotificationChange("emailNotifications")}
              />
              <ToggleItem 
                icon={<Clock className="text-emerald-500" />}
                title="Attendance Reminders" 
                description="Daily pings to ensure team logs their hours"
                checked={notificationSettings.attendanceReminders}
                onChange={() => handleNotificationChange("attendanceReminders")}
              />
              <ToggleItem 
                icon={<ShieldCheck className="text-amber-500" />}
                title="Leave Approval Alerts" 
                description="Instant notification for new leave requests"
                checked={notificationSettings.leaveApprovalAlerts}
                onChange={() => handleNotificationChange("leaveApprovalAlerts")}
              />
            </div>
          </div>
        </div>

        {/* UPCOMING HOLIDAYS */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/40 border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-50 rounded-2xl text-rose-600">
                <Calendar size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800  ">Holiday Calendar</h3>
                <p className="text-xs font-bold text-slate-400">{new Date().getFullYear()} Scheduled Offs</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {holidays.length > 0 ? (
              holidays.slice(0, 6).map((holiday) => (
                <div
                  key={holiday._id}
                  className="group flex items-center justify-between p-4 bg-slate-50/50 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 rounded-2xl border border-transparent hover:border-slate-100 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex flex-col items-center justify-center border border-slate-100 group-hover:border-rose-100 group-hover:bg-rose-50 transition-colors">
                      <span className="text-[10px] font-black text-rose-500  leading-none">
                        {new Date(holiday.date).toLocaleDateString("en-US", { month: "short" })}
                      </span>
                      <span className="text-sm font-black text-slate-700 leading-none mt-1">
                        {new Date(holiday.date).getDate()}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-700 text-sm">{holiday.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold   mt-0.5">
                        {new Date(holiday.date).toLocaleDateString("en-US", { weekday: "long" })}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black   ${
                    holiday.type === "public" ? "bg-purple-100 text-purple-700" : 
                    holiday.type === "company" ? "bg-blue-100 text-blue-700" : 
                    "bg-slate-100 text-slate-600"
                  }`}>
                    {holiday.type}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-300 gap-3">
                <Info size={40} strokeWidth={1.5} />
                <p className="text-xs font-black  ">No holidays scheduled</p>
              </div>
            )}
            
            {holidays.length > 6 && (
              <button className="w-full py-3 text-[10px] font-black   text-slate-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2">
                View Full Calendar <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* --- SUB-COMPONENT FOR TOGGLES --- */
const ToggleItem = ({ icon, title, description, checked, onChange }) => (
  <div className="flex items-center justify-between group p-2">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-white transition-colors group-hover:shadow-md">
        {React.cloneElement(icon, { size: 18 })}
      </div>
      <div>
        <p className="font-bold text-slate-700 text-sm">{title}</p>
        <p className="text-xs text-slate-400 font-medium">{description}</p>
      </div>
    </div>
    <label className="relative inline-flex items-center cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
      />
      <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 shadow-inner"></div>
    </label>
  </div>
);

export default ManagerSettings;