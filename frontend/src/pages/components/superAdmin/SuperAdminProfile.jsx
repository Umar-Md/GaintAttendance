import React, { useEffect, useRef, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Edit2,
  Save,
  X,
  Camera,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import axios from "axios";
import { CLOUD_NAME, preset, superAdminURI, userURI } from "../../../mainApi";

const SuperAdminProfile = () => {
  const fileRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);

  const [formData, setFormData] = useState({
    userName: "",
    phoneNumber: "",
    bio: "",
  });

  /* ---------------- FETCH PROFILE ---------------- */
  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${superAdminURI}/me`, {
        withCredentials: true,
      });
      setProfile(res.data.data);
    } catch (err) {
      console.error("Fetch SuperAdmin profile error:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  /* ---------------- SET FORM DATA ---------------- */
  useEffect(() => {
    if (!profile) return;

    setFormData({
      userName: profile.userName || "",
      phoneNumber: profile.phoneNumber || "",
      bio: profile.bio || "",
    });
  }, [profile]);

  /* ---------------- SAVE PROFILE ---------------- */
  const handleSave = async () => {
    try {
      await axios.put(`${superAdminURI}/update-profile`, formData, {
        withCredentials: true,
      });

      setIsEditing(false);
      fetchProfile();
      alert("Profile updated successfully");
    } catch (err) {
      alert("Failed to update profile");
    }
  };

  /* ---------------- IMAGE UPLOAD ---------------- */
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoadingImage(true);

      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", preset);

      const cloudRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        data
      );

      await axios.patch(
        `${userURI}/update-image`,
        { imageUrl: cloudRes.data.secure_url },
        { withCredentials: true }
      );

      fetchProfile();
    } catch (err) {
      alert("Image update failed");
    } finally {
      setLoadingImage(false);
    }
  };

  if (!profile) return (
    <div className="h-96 flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-10">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* HEADER */}
        <div className="bg-linear-to-r from-blue-500 to-blue-600 p-6 md:p-10">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-white/20 overflow-hidden relative">
                <img
                  src={profile.imageUrl || "https://via.placeholder.com/150"}
                  alt="profile"
                  className={`w-full h-full object-cover transition-opacity ${loadingImage ? 'opacity-50' : 'opacity-100'}`}
                />
                {loadingImage && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="animate-spin text-white" />
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => fileRef.current.click()}
                className="absolute bottom-1 right-1 bg-white text-slate-900 p-2.5 rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer border border-gray-100"
              >
                <Camera className="w-4 h-4" />
              </button>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange}
              />
            </div>

            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white tracking-tight">{profile.userName}</h2>
              <div className="mt-2 flex flex-wrap justify-center md:justify-start gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold backdrop-blur-md border border-blue-500/30">
                  <ShieldCheck size={14} /> Super Administrator
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-gray-300 text-xs backdrop-blur-md">
                  <Mail size={14} /> {profile.email}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="p-6 md:p-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Personal Information</h3>
              <p className="text-sm text-gray-500">Manage your account details and bio.</p>
            </div>

            <button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all shadow-sm active:scale-95 cursor-pointer ${
                isEditing 
                ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100" 
                : "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200"
              }`}
            >
              {isEditing ? <Save size={18} /> : <Edit2 size={18} />}
              {isEditing ? "Save Changes" : "Edit Profile"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
            <div className="space-y-6">
              <Field
                icon={<User size={18} className="text-blue-600" />}
                label="Full Name"
                editable={isEditing}
                value={formData.userName}
                onChange={(v) => setFormData({ ...formData, userName: v })}
              />

              <StaticField
                icon={<Mail size={18} className="text-gray-400" />}
                label="Primary Email"
                value={profile.email}
              />

              <Field
                icon={<Phone size={18} className="text-blue-600" />}
                label="Phone Number"
                editable={isEditing}
                value={formData.phoneNumber}
                onChange={(v) => setFormData({ ...formData, phoneNumber: v })}
              />
            </div>

            <div className="space-y-6">
              <StaticField 
                label="Account Role" 
                value="SuperAdmin" 
                badge="Master"
              />
              <StaticField 
                label="System Permissions" 
                value="Full Read/Write Access" 
                badge="Root"
              />
            </div>
          </div>

          {/* BIO */}
          <div className="mt-8 pt-8 border-t border-gray-50">
            <label className="text-xs font-bold text-gray-400  tracking-widest block mb-2">About You (Bio)</label>
            {isEditing ? (
              <textarea
                className="w-full border border-gray-200 rounded-xl p-4 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none bg-gray-50/50"
                rows={4}
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
              />
            ) : (
              <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                {profile.bio || "No bio information provided yet."}
              </p>
            )}
          </div>

          {isEditing && (
            <div className="flex justify-end mt-8">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    userName: profile.userName,
                    phoneNumber: profile.phoneNumber,
                    bio: profile.bio || "",
                  });
                }}
                className="flex items-center gap-2 px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-semibold transition-colors cursor-pointer"
              >
                <X size={18} /> Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ---------- Reusable Components ---------- */
const Field = ({ icon, label, editable, value, onChange }) => (
  <div className="flex flex-col gap-1.5">
    <label className="flex items-center gap-2 text-xs font-bold text-gray-400  tracking-widest px-1">
      {icon} {label}
    </label>
    {editable ? (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none bg-white"
      />
    ) : (
      <p className="bg-gray-50/80 border border-gray-100 p-3 rounded-xl text-slate-700 font-medium">
        {value || "Not provided"}
      </p>
    )}
  </div>
);

const StaticField = ({ icon, label, value, badge }) => (
  <div className="flex flex-col gap-1.5">
    <label className="flex items-center gap-2 text-xs font-bold text-gray-400  tracking-widest px-1">
      {icon} {label}
    </label>
    <div className="flex items-center justify-between bg-gray-50/80 border border-gray-100 p-3 rounded-xl">
      <p className="text-slate-700 font-medium">{value}</p>
      {badge && (
        <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-black ">
          {badge}
        </span>
      )}
    </div>
  </div>
);

export default SuperAdminProfile;