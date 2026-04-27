import React, { useEffect, useRef, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Building,
  Edit2,
  Save,
  X,
  Camera,
  BadgeCheck,
  ShieldCheck,
  Briefcase,
  IdCard,
} from "lucide-react";
import axios from "axios";
import { CLOUD_NAME, hrURI, preset, userURI } from "../../../mainApi";

const HRProfile = () => {
  const fileRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);

  const [formData, setFormData] = useState({
    userName: "",
    phoneNumber: "",
    department: "",
    bio: "",
  });

  // ---------------- FETCH PROFILE (LOGIC UNCHANGED) ----------------
  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${hrURI}/getprofile`, {
        withCredentials: true,
      });
      setProfile(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []); // Note: In a real app, you might want to remove 'profile' from dependencies to prevent loops, but kept as per your logic.

  useEffect(() => {
    if (!profile) return; {
      setFormData({
        userName: profile.userName || "",
        phoneNumber: profile.phoneNumber || "",
        department: profile.department || "Human Resources",
        bio: profile.bio || "",
      });
    }
  }, [profile]);

  // ---------------- SAVE PROFILE (LOGIC UNCHANGED) ----------------
  const handleSave = async () => {
    try {
      await axios.put(`${hrURI}/update-profile`, formData, {
        withCredentials: true,
      });

      setIsEditing(false);
      fetchProfile();
      alert("Profile updated successfully");
    } catch (err) {
      alert("Failed to update profile");
    }
  };

  // ---------------- IMAGE UPLOAD (LOGIC UNCHANGED) ----------------
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoadingImage(true);

      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", preset);
      data.append("folder", "items");

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
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 border border-slate-100 overflow-hidden">
        
        {/* HEADER SECTION - Premium Gradient Mesh */}
        <div className="relative bg-[#618DF4] px-8 py-12 overflow-hidden">
          {/* Decorative background blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-5  00 rounded-full blur-[100px] opacity-20 -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full blur-[100px] opacity-20 -ml-20 -mb-20"></div>
          
          <div className="relative flex flex-col md:flex-row items-center gap-8">
            {/* Avatar Container */}
            <div className="relative group">
              <div className="w-40 h-40 rounded-[2.5rem] border-4 border-white/20 p-1 backdrop-blur-sm transition-transform duration-500 group-hover:scale-105">
                <img
                  src={profile.imageUrl}
                  alt="profile"
                  className="w-full h-full rounded-[2.2rem] border-2 border-white object-cover shadow-2xl"
                />
              </div>

              <button
                onClick={() => fileRef.current.click()}
                disabled={loadingImage}
                className="absolute -bottom-2 -right-2 bg-white p-3 rounded-2xl shadow-xl text-indigo-600 hover:bg-indigo-50 transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
              >
                {loadingImage ? (
                  <div className="w-5 h-5 animate-spin border-2 border-indigo-600 border-t-transparent rounded-full" />
                ) : (
                  <Camera className="w-5 h-5" />
                )}
              </button>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange}
              />
            </div>

            {/* Quick Stats/Info */}
            <div className="text-center md:text-left text-white space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <h2 className="text-4xl font-black">{profile.userName}</h2>
                <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[14px] font-black flex items-center gap-1 border border-white/20">
                  <BadgeCheck size={12} className="text-blue-400" /> Verified Admin
                </span>
              </div>
              <p className="text-indigo-200 font-medium text-lg flex items-center justify-center md:justify-start gap-2">
                <Building size={18} /> {profile.department || "Human Resources"}
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4 text-indigo-100/70 text-sm">
                <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                  <Mail size={14} /> {profile.email}
                </span>
                <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                  <IdCard size={14} /> ID: {profile._id.slice(-8).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT BODY */}
        <div className="p-10 lg:p-14">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
            <div>
              <h3 className="text-2xl font-black text-slate-900 ">Detailed Profile</h3>
              <p className="text-slate-400 text-xs font-bold  mt-1">Manage your administrative identity</p>
            </div>

            <button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className={`w-full sm:w-auto px-8 py-3 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg ${
                isEditing
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200"
              }`}
            >
              {isEditing ? <Save size={18} /> : <Edit2 size={18} />}
              {isEditing ? "Save Changes" : "Edit Profile"}
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Left Column - Form */}
            <div className="lg:col-span-2 space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <Field
                  icon={<User className="text-[#618DF4]" size={18} />}
                  label="Display Name"
                  editable={isEditing}
                  value={formData.userName}
                  onChange={(v) => setFormData({ ...formData, userName: v })}
                />

                <StaticField
                  icon={<Mail className="text-indigo-500" size={18} />}
                  label="Primary Email"
                  value={profile.email}
                />

                <Field
                  icon={<Phone className="text-indigo-500" size={18} />}
                  label="Contact Number"
                  editable={isEditing}
                  value={formData.phoneNumber}
                  onChange={(v) => setFormData({ ...formData, phoneNumber: v })}
                />

                <Field
                  icon={<Building className="text-indigo-500" size={18} />}
                  label="Office Department"
                  editable={isEditing}
                  value={formData.department}
                  onChange={(v) => setFormData({ ...formData, department: v })}
                />
              </div>

              {/* BIO SECTION */}
              <div className="relative group">
                <label className="text-[10px] font-black text-slate-400 mb-3 block px-1">
                  Professional Biography
                </label>
                {isEditing ? (
                  <textarea
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-5 text-slate-700 font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                    rows={4}
                    placeholder="Tell us about your professional background..."
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                  />
                ) : (
                  <div className="bg-slate-50/50 border border-dashed border-slate-200 p-6 rounded-3xl">
                    <p className="text-slate-600 leading-relaxed font-medium">
                      {profile.bio || "No professional biography has been added yet."}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Status Cards */}
            <div className="space-y-6">
              <div className="bg-indigo-50/50 p-6 rounded-2 border border-indigo-100">
                <h4 className="text-[10px] font-black  text-indigo-400 mb-4">Account Status</h4>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${profile.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <p className="font-black text-slate-900 leading-none">
                      {profile.isActive ? "ACTIVE" : "INACTIVE"}
                    </p>
                    <p className="text-xs font-bold text-slate-400 mt-1">Verified System HR</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 p-6 rounded-2 text-white">
                <h4 className="text-[10px] font-black text-slate-500 mb-4">Organizational Role</h4>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-white/10 text-white">
                    <Briefcase size={24} />
                  </div>
                  <div>
                    <p className="font-black text-white leading-none">
                      {profile.role || "HR EXECUTIVE"}
                    </p>
                    <p className="text-xs font-bold text-slate-400 mt-1 ">Full Permission Access</p>
                  </div>
                </div>
              </div>

              {isEditing && (
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      userName: profile.userName,
                      phoneNumber: profile.phoneNumber,
                      department: profile.department,
                      bio: profile.bio || "",
                    });
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-4 border-2 border-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-50 transition-all text-[10px] "
                >
                  <X size={16} /> Discard Changes
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------- Enhanced Reusable Components ---------- */
const Field = ({ icon, label, editable, value, onChange }) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-[12px] font-black  text-slate-400 px-1">
      {icon} {label}
    </label>
    {editable ? (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl text-slate-700 font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
      />
    ) : (
      <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-slate-700 font-bold flex items-center">
        {value || <span className="text-slate-300 font-normal italic">Not specified</span>}
      </div>
    )}
  </div>
);

const StaticField = ({ icon, label, value }) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-[12px] font-black  text-slate-400 px-1">
      {icon} {label}
    </label>
    <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl text-slate-400 font-bold select-none cursor-not-allowed">
      {value}
    </div>
  </div>
);

export default HRProfile;