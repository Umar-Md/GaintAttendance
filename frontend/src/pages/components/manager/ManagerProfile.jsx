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
  Loader2,
  AlertCircle
} from "lucide-react";
import axios from "axios";
import { CLOUD_NAME, managerURI, preset, userURI } from "../../../mainApi";

const ManagerProfile = () => {
  const fileRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);

  const [formData, setFormData] = useState({
    userName: "",
    phoneNumber: "",
    department: "",
    bio: "",
  });

  // ---------------- FETCH PROFILE ----------------
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${managerURI}/profile`, {
        withCredentials: true, // Crucial for sending "ManagerToken" cookie
      });
      setProfile(res.data.data);
      setError(null);
    } catch (err) {
      console.error("Fetch Error:", err);
      // If 403, it means managerOnly middleware rejected the userRole
      setError(err.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!profile) return;{
      setFormData({
        userName: profile.userName || "",
        phoneNumber: profile.phoneNumber || "",
        department: profile.department || "",
        bio: profile.bio || "",
      });
    }
  }, [profile]);

  // ---------------- SAVE PROFILE ----------------
  const handleSave = async () => {
    try {
      await axios.put(`${managerURI}/update-profile`, formData, {
        withCredentials: true,
      });

      setIsEditing(false);
      fetchProfile();
      alert("Profile updated successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update profile");
    }
  };

  // ---------------- IMAGE UPLOAD ----------------
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoadingImage(true);
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", preset);
      data.append("folder", "manager_profiles");

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

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-100">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
      <p className="text-black font-medium">Verifying Manager Access...</p>
    </div>
  );

  if (error) return (
    <div className="max-w-4xl mx-auto mt-10 p-8 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-4 text-red-700">
      <AlertCircle size={32} />
      <div>
        <h3 className="font-bold text-lg">Access Denied</h3>
        <p>{error}</p>
        <p className="text-sm mt-1 opacity-80">Ensure you are logged in as a Manager.</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="bg-white rounded-4xl shadow-sm border border-slate-100 overflow-hidden">
        
        {/* HEADER - Increased padding to ensure text visibility */}
        <div className="bg-[#618DF4] p-10 pb-20 relative">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-3xl border-4 border-white/30 overflow-hidden shadow-2xl">
                {loadingImage ? (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                    <Loader2 className="animate-spin text-white" />
                  </div>
                ) : (
                  <img
                    src={profile.imageUrl || "https://via.placeholder.com/150"}
                    alt="profile"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              <button
                onClick={() => fileRef.current.click()}
                className="absolute -bottom-2 -right-2 bg-white p-2.5 rounded-xl shadow-lg text-blue-600 hover:scale-110 transition-transform"
              >
                <Camera size={18} />
              </button>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange}
              />
            </div>

            <div className="text-center sm:text-left text-white">
              <h2 className="text-4xl font-black  mb-1">{profile.userName}</h2>
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 items-center opacity-90">
                <span className="bg-white/20 px-3 py-1 rounded-lg text-sm font-bold backdrop-blur-md">
                   {profile.role}
                </span>
                <span className="text-blue-100 font-medium border-l border-white/30 pl-3">
                  {profile.department || "General Management"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="p-10 -mt-8 bg-white rounded-t-[3rem] relative z-10">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-black text-black ">Personal Information</h3>

            <button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className={`px-6 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-all active:scale-95 shadow-lg ${
                isEditing ? "bg-emerald-500 text-white shadow-emerald-200" : "bg-blue-600 text-white shadow-blue-200"
              }`}
            >
              {isEditing ? <Save size={18} /> : <Edit2 size={18} />}
              {isEditing ? "Save Changes" : "Edit Profile"}
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Field
                icon={<User size={18} className="text-blue-500" />}
                label="Full Name"
                editable={isEditing}
                value={formData.userName}
                onChange={(v) => setFormData({ ...formData, userName: v })}
              />

              <StaticField
                icon={<Mail size={18} className="text-blue-500" />}
                label="Email Address"
                value={profile.email}
              />

              <Field
                icon={<Phone size={18} className="text-blue-500" />}
                label="Phone"
                editable={isEditing}
                value={formData.phoneNumber}
                onChange={(v) => setFormData({ ...formData, phoneNumber: v })}
              />
            </div>

            <div className="space-y-6">
              <Field
                icon={<Building size={18} className="text-blue-500" />}
                label="Department"
                editable={isEditing}
                value={formData.department}
                onChange={(v) => setFormData({ ...formData, department: v })}
              />

              <div className="space-y-2">
                 <label className="text-[14px]  font-black text-black  ml-1">Account Status</label>
                 <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${profile.isActive ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}></span>
                    <span className="font-bold text-slate-500">{profile.isActive ? "Active Account" : "Inactive"}</span>
                 </div>
              </div>
            </div>
          </div>
          {/* BIO */}
          <div className="mt-10 border-t border-slate-50 pt-10">
            <label className="text-[14px]  font-black text-black  ml-1 mb-3 block">Professional Bio</label>
            {isEditing ? (
              <textarea
                className="w-full border-2 border-slate-100 rounded-2xl p-5 focus:border-blue-500 outline-none transition-all font-medium"
                rows={4}
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="Tell us about your professional background..."
              />
            ) : (
              <p className="bg-slate-50 p-6 rounded-2xl text-slate-600 font-medium leading-relaxed italic">
                {profile.bio || "No bio added yet. Click edit to add your professional summary."}
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
                    department: profile.department,
                    bio: profile.bio || "",
                  });
                }}
                className="flex items-center gap-2 px-6 py-2 text-black font-bold hover:text-black transition-colors"
              >
                <X size={18} /> Cancel Editing
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
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-[14px]  font-black text-black  ml-1">
      {icon} {label}
    </label>
    {editable ? (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-2 border-slate-100 p-4 rounded-xl focus:border-blue-600 outline-none font-bold text-black transition-all"
      />
    ) : (
      <p className="bg-slate-50/50 border border-slate-100 p-4 rounded-xl font-bold text-slate-600">{value || "Not Set"}</p>
    )}
  </div>
);

const StaticField = ({ icon, label, value }) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-[14px]  font-black text-black  ml-1">
      {icon} {label}
    </label>
    <p className="bg-slate-50/50 border border-slate-100 p-4 rounded-xl font-bold text-slate-600 italic">{value}</p>
  </div>
);

export default ManagerProfile;