import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Mail,
  Phone,
  Building,
  Edit2,
  Save,
  Camera,
  Fingerprint,
} from "lucide-react";
import axios from "axios";
import {
  CLOUD_NAME,
  employeeURI,
  preset,
  userURI,
} from "../../../mainApi";

const EmployeeProfile = () => {
  const fileRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);

  const [formData, setFormData] = useState({
    userName: "",
    phoneNumber: "",
    department: "",
    bio: "",
  });

  const [profile, setProfile] = useState(null);

  /* FETCH PROFILE */
  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${employeeURI}/profile`, {
        withCredentials: true,
      });

      setProfile(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  /* SET FORM DATA */
  useEffect(() => {
    if (!profile) return;

    setFormData({
      userName: profile.userName || "",
      phoneNumber: profile.phoneNumber || "",
      department: profile.department || "",
      bio: profile.bio || "",
    });
  }, [profile]);

  /* SAVE PROFILE */
  const handleSave = async () => {
    try {
      await axios.put(`${employeeURI}/update-profile`, formData, {
        withCredentials: true,
      });

      setIsEditing(false);
      fetchProfile();
    } catch {
      alert("Failed to update profile");
    }
  };

  /* IMAGE CHANGE */
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
        {
          imageUrl: cloudRes.data.secure_url,
        },
        {
          withCredentials: true,
        }
      );

      fetchProfile();
    } catch {
      alert("Image update failed");
    } finally {
      setLoadingImage(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-5 lg:px-8 py-5 sm:py-8">
      <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-200">
        
        {/* HERO SECTION */}
        <div className="relative bg-linear-to-br from-indigo-600 to-blue-700 h-44 sm:h-52 md:h-60 lg:h-72">
          
          <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

          {/* PROFILE AREA */}
          <div className="absolute left-1/2 -translate-x-1/2 sm:left-8 sm:translate-x-0 -bottom-20 sm:-bottom-14 flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 w-full sm:w-auto px-4">
            
            {/* PROFILE IMAGE */}
            <div className="relative shrink-0">
              <div
                className={`w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-3xl border-4 sm:border-8 border-white overflow-hidden shadow-2xl bg-slate-100 ${
                  loadingImage ? "animate-pulse" : ""
                }`}
              >
                <img
                  src={
                    profile.imageUrl ||
                    "https://via.placeholder.com/150"
                  }
                  alt="profile"
                  className="w-full h-full object-cover"
                />

                {loadingImage && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {/* CAMERA BUTTON */}
              <button
                onClick={() => fileRef.current.click()}
                className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition"
              >
                <Camera size={18} />
              </button>

              <input
                ref={fileRef}
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>

            {/* USER INFO */}
            <div className="text-center sm:text-left sm:pb-5 w-full sm:w-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 sm:text-white wrap-break-word">
                {profile.userName}
              </h2>

              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                
                <span className="bg-blue-100 sm:bg-white/20 text-blue-700 sm:text-white px-4 py-1.5 rounded-full text-xs font-bold border border-blue-200 sm:border-white/10">
                  {profile.department || "General Staff"}
                </span>

                <span className="flex items-center gap-1 text-slate-600 sm:text-blue-100 text-xs sm:text-sm font-medium">
                  <Fingerprint size={14} />
                  ID: {profile._id.slice(-8)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SPACING */}
        <div className="h-28 sm:h-20"></div>

        {/* MAIN CONTENT */}
        <div className="px-4 sm:px-6 md:px-10 pb-8">
          
          {/* HEADER */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">
            
            <div>
              <h3 className="text-2xl font-bold text-slate-800">
                Profile Essence
              </h3>

              <p className="text-slate-500 text-sm sm:text-base mt-1">
                Manage your professional digital identity
              </p>
            </div>

            {/* EDIT BUTTON */}
            <button
              onClick={() =>
                isEditing
                  ? handleSave()
                  : setIsEditing(true)
              }
              className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                isEditing
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-900 text-white"
              }`}
            >
              {isEditing ? (
                <Save size={20} />
              ) : (
                <Edit2 size={20} />
              )}

              {isEditing
                ? "Save Changes"
                : "Edit Profile"}
            </button>
          </div>

          {/* FIELDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-7">
            
            <Field
              icon={<User className="text-blue-500" size={20} />}
              label="Public Identity"
              editable={isEditing}
              value={formData.userName}
              onChange={(v) =>
                setFormData({
                  ...formData,
                  userName: v,
                })
              }
            />

            <StaticField
              icon={<Mail className="text-indigo-500" size={20} />}
              label="Official Email"
              value={profile.email}
            />

            <Field
              icon={<Phone className="text-emerald-500" size={20} />}
              label="Contact Channel"
              editable={isEditing}
              value={formData.phoneNumber}
              onChange={(v) =>
                setFormData({
                  ...formData,
                  phoneNumber: v,
                })
              }
            />

            <Field
              icon={<Building className="text-amber-500" size={20} />}
              label="Department Unit"
              editable={isEditing}
              value={formData.department}
              onChange={(v) =>
                setFormData({
                  ...formData,
                  department: v,
                })
              }
            />
          </div>

          {/* BIO */}
          <div className="mt-8">
            
            <label className="block text-sm font-bold text-slate-400 mb-3">
              Professional Narrative
            </label>

            {isEditing ? (
              <textarea
                rows={5}
                value={formData.bio}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bio: e.target.value,
                  })
                }
                className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 resize-none text-slate-700"
              />
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-7 text-slate-600 leading-relaxed">
                {profile.bio ||
                  "No narrative provided. Update your profile to include your expertise."}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* REUSABLE FIELD */
const Field = ({
  icon,
  label,
  editable,
  value,
  onChange,
}) => (
  <div className="space-y-2">
    
    <label className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-400 ml-1 tracking-wide">
      {icon}
      <span>{label}</span>
    </label>

    {editable ? (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-50 border-2 border-slate-200 p-4 rounded-xl outline-none focus:border-blue-500 font-semibold text-slate-700 transition-all"
      />
    ) : (
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl font-semibold text-slate-700 wrap-break-word">
        {value || "Unspecified"}
      </div>
    )}
  </div>
);

/* STATIC FIELD */
const StaticField = ({
  icon,
  label,
  value,
}) => (
  <div className="space-y-2">
    
    <label className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-400 ml-1 tracking-wide">
      {icon}
      <span>{label}</span>
    </label>

    <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl text-slate-500 font-semibold wrap-break-word">
      {value}
    </div>
  </div>
);

export default EmployeeProfile;