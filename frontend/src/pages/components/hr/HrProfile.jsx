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
import FaceEnrollment from "../FaceEnrollment";

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
    if (!profile) return;

    setFormData({
      userName: profile.userName || "",
      phoneNumber: profile.phoneNumber || "",
      department: profile.department || "Human Resources",
      bio: profile.bio || "",
    });
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
    } catch {
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
    } catch {
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
    <div className="mx-auto w-full max-w-6xl p-3 sm:p-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl shadow-indigo-100">
        
        {/* HEADER SECTION - Premium Gradient Mesh */}
        <div className="relative overflow-hidden bg-[#618DF4] px-5 py-8 sm:px-8 sm:py-10">
          {/* Decorative background blobs */}
          <div className="absolute right-0 top-0 h-64 w-64 -mr-20 -mt-20 rounded-full bg-indigo-500 opacity-20 blur-[100px]"></div>
          <div className="absolute bottom-0 left-0 h-64 w-64 -mb-20 -ml-20 rounded-full bg-purple-500 opacity-20 blur-[100px]"></div>
          
          <div className="relative flex flex-col items-center gap-6 md:flex-row md:items-center md:gap-8">
            {/* Avatar Container */}
            <div className="group relative shrink-0">
              <div className="h-32 w-32 rounded-3xl border-4 border-white/20 p-1 backdrop-blur-sm transition-transform duration-500 group-hover:scale-105 sm:h-40 sm:w-40">
                <img
                  src={
                    profile.imageUrl ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      profile.userName || "HR"
                    )}`
                  }
                  alt="profile"
                  className="h-full w-full rounded-[1.4rem] border-2 border-white object-cover shadow-2xl sm:rounded-[1.7rem]"
                />
              </div>

              <button
                onClick={() => fileRef.current.click()}
                disabled={loadingImage}
                className="absolute -bottom-2 -right-2 rounded-2xl bg-white p-3 text-indigo-600 shadow-xl transition-all hover:scale-110 hover:bg-indigo-50 active:scale-95 disabled:opacity-50"
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
            <div className="min-w-0 flex-1 space-y-2 text-center text-white md:text-left">
              <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
                <h2 className="max-w-full wrap-break-word text-3xl font-black sm:text-4xl">{profile.userName}</h2>
                <span className="flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[12px] font-black backdrop-blur-md sm:text-[14px]">
                  <BadgeCheck size={12} className="text-blue-400" /> Verified Admin
                </span>
              </div>
              <p className="flex items-center justify-center gap-2 text-base font-medium text-indigo-100 md:justify-start sm:text-lg">
                <Building size={18} /> {profile.department || "Human Resources"}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-4 text-sm text-indigo-100/80 md:justify-start">
                <span className="flex min-w-0 items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5">
                  <Mail size={14} /> {profile.email}
                </span>
                <span className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5">
                  <IdCard size={14} /> ID: {profile._id.slice(-8).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT BODY */}
        <div className="p-5 sm:p-8 lg:p-10">
          <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
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

          <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
            {/* Left Column - Form */}
            <div className="min-w-0 space-y-8">
              <div className="grid gap-6 md:grid-cols-2">
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
            <div className="min-w-0 space-y-5">
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5 sm:p-6">
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

              <div className="rounded-2xl bg-slate-900 p-5 text-white sm:p-6">
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

              <FaceEnrollment
                faceRegisteredAt={profile.faceRegisteredAt}
                onRegistered={fetchProfile}
              />

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
