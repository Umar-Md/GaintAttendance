import React, { useState, useEffect, useRef } from "react";
import { User, Mail, Phone, Building, Edit2, Save, X, Camera, ShieldCheck, Fingerprint } from "lucide-react";
import axios from "axios";
import { CLOUD_NAME, employeeURI, preset, userURI } from "../../../mainApi";

const EmployeeProfile = () => {
  const fileRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [formData, setFormData] = useState({ userName: "", phoneNumber: "", department: "", bio: "" });
  const [profile, setProfile] = useState(null);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${employeeURI}/profile`, { withCredentials: true });
      setProfile(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!profile) return;
    setFormData({
      userName: profile.userName || "",
      phoneNumber: profile.phoneNumber || "",
      department: profile.department || "",
      bio: profile.bio || "",
    });
  }, [profile]);

  const handleSave = async () => {
    try {
      await axios.put(`${employeeURI}/update-profile`, formData, { withCredentials: true });
      setIsEditing(false);
      fetchProfile();
    } catch (err) { alert("Failed to update profile"); }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setLoadingImage(true);
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", preset);
      const cloudRes = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, data);
      await axios.patch(`${userURI}/update-image`, { imageUrl: cloudRes.data.secure_url }, { withCredentials: true });
      fetchProfile();
    } catch (err) { alert("Image update failed"); }
    finally { setLoadingImage(false); }
  };

  if (!profile) return null;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      <div className="bg-white rounded-3xl sm:rounded-4xl shadow-xl border border-slate-100 overflow-hidden">
        
        {/* Hero Banner */}
        <div className="relative h-40 sm:h-48 md:h-56 bg-linear-to-br from-indigo-600 to-blue-700">
          <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          
          <div className="absolute -bottom-4 sm:-bottom-6 left-0 right-0 flex flex-col items-center sm:flex-row sm:items-end sm:left-10 gap-4 sm:gap-6 px-4">
            <div className="relative group">
              <div className={`w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-2xl sm:rounded-3xl border-4 sm:border-8 border-white shadow-2xl overflow-hidden bg-slate-100 ${loadingImage ? 'animate-pulse' : ''}`}>
                <img src={profile.imageUrl || "https://via.placeholder.com/150"} alt="profile" className="w-full h-full object-cover" />
                {loadingImage && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <button 
                onClick={() => fileRef.current.click()} 
                className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-blue-600 text-white p-2 sm:p-2.5 rounded-xl sm:rounded-2xl shadow-lg hover:scale-110 active:scale-90 transition-all"
              >
                <Camera size={16} className="sm:w-5 sm:h-5" />
              </button>
              <input ref={fileRef} type="file" hidden accept="image/*" onChange={handleImageChange} />
            </div>

            <div className="text-center sm:text-left pb-2 sm:pb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 sm:text-white drop-shadow-sm leading-tight">
                {profile.userName}
              </h2>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-1 sm:mt-2">
                <span className="bg-blue-100 sm:bg-white/20 text-blue-700 sm:text-white px-4 py-1.5 rounded-full text-xs font-bold border border-blue-200 sm:border-white/10 backdrop-blur-md">
                  {profile.department || "General Staff"}
                </span>
                <span className="flex items-center gap-1 text-slate-500 sm:text-blue-100 text-xs sm:text-sm font-medium">
                  <Fingerprint size={14} /> ID: {profile._id.slice(-8)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="h-16 sm:h-10 md:h-12"></div>

        <div className="p-5 sm:p-8 md:p-10 pt-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="text-left">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 ">Profile Essence</h3>
              <p className="text-slate-500 text-sm sm:text-base font-medium">Manage your professional digital identity</p>
            </div>
            <button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className={`w-full md:w-auto px-6 sm:px-8 py-3.5 rounded-xl sm:rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
                isEditing ? "bg-emerald-600 text-white shadow-emerald-200" : "bg-slate-900 text-white shadow-slate-200"
              }`}
            >
              {isEditing ? <Save size={20} /> : <Edit2 size={20} />}
              <span>{isEditing ? "Commit Changes" : "Edit Profile"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            <Field icon={<User className="text-blue-500" size={22} />} label="Public Identity" editable={isEditing} value={formData.userName} onChange={(v) => setFormData({...formData, userName: v})} />
            <StaticField icon={<Mail className="text-indigo-500" size={22} />} label="Official Email" value={profile.email} />
            <Field icon={<Phone className="text-emerald-500" size={22} />} label="Contact Channel" editable={isEditing} value={formData.phoneNumber} onChange={(v) => setFormData({...formData, phoneNumber: v})} />
            <Field icon={<Building className="text-amber-500" size={22} />} label="Department Unit" editable={isEditing} value={formData.department} onChange={(v) => setFormData({...formData, department: v})} />
          </div>

          <div className="mt-10 group">
            <label className="text-sm font-black text-slate-400 mb-3 block uppercase tracking-wider">Professional Narrative</label>
            {isEditing ? (
              <textarea 
                className="w-full border-2 border-slate-100 bg-slate-50 rounded-xl sm:rounded-2xl p-4 sm:p-5 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-slate-700 text-base sm:text-lg" 
                rows={4} 
                value={formData.bio} 
                onChange={(e) => setFormData({...formData, bio: e.target.value})} 
              />
            ) : (
              <div className="bg-slate-50 border border-slate-100 p-6 sm:p-8 rounded-xl sm:rounded-2xl italic text-slate-600 text-base sm:text-lg leading-relaxed relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                <p>"{profile.bio || "No narrative provided. Update your profile to include your expertise."}"</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* Reusable Components */
const Field = ({ icon, label, editable, value, onChange }) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-xs sm:text-sm font-black text-slate-400 ml-1 uppercase tracking-wide">
      {icon} <span>{label}</span>
    </label>
    {editable ? (
      <input 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-xl focus:border-blue-500 outline-none font-bold text-slate-700 text-base sm:text-lg transition-all shadow-inner" 
      />
    ) : (
      <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl font-bold text-slate-700 text-base sm:text-lg truncate shadow-sm">
        {value || "Unspecified"}
      </div>
    )}
  </div>
);

const StaticField = ({ icon, label, value }) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-xs sm:text-sm font-black text-slate-400 ml-1 uppercase tracking-wide">
      {icon} <span>{label}</span>
    </label>
    <div className="bg-slate-100/50 border border-slate-200/50 p-4 rounded-xl text-slate-500 font-bold text-base sm:text-lg truncate">
      {value}
    </div>
  </div>
);

export default EmployeeProfile;