import React, { useState } from "react";
import axios from "axios";
import { Lock, Key, Eye, EyeOff, XCircle } from "lucide-react";
import { userURI } from "../mainApi";
import { Link } from "react-router-dom";

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Function to clear all input values
  const clearForm = () => {
    setFormData({
      email: "",
      otp: "",
      password: "",
      confirmPassword: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setMessage({ text: "Passwords do not match", type: "error" });
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${userURI}/resetPassword`, formData, {
        withCredentials: true,
      });
      setMessage({ text: res.data.message, type: "success" });
      clearForm(); // Clear fields on success
    } catch (err) {
      setMessage({ 
        text: err.response?.data?.message || "Something went wrong", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-blue-50 p-3 rounded-full mb-3">
            <Lock className="text-blue-600" size={28} />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Reset Password</h2>
          <p className="text-gray-500 text-sm font-medium">Secure your account access</p>
        </div>

        {message.text && (
          <div className={`p-3 rounded-lg text-sm mb-4 text-center font-bold ${
            message.type === "success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-black text-gray-400 uppercase ml-1">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="example@company.com"
              className="w-full border border-gray-200 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-medium"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-gray-400 uppercase ml-1">Verification OTP</label>
            <input
              type="text"
              name="otp"
              placeholder="Enter 6-digit code"
              className="w-full border border-gray-200 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-bold tracking-widest text-center"
              value={formData.otp}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-gray-400 uppercase ml-1">New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                className="w-full border border-gray-200 p-3 pl-11 pr-11 rounded-xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-medium"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-gray-400 uppercase ml-1">Confirm New Password</label>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="••••••••"
                className="w-full border border-gray-200 p-3 pl-11 pr-11 rounded-xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-medium"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 active:scale-[0.98] transition-all disabled:opacity-70"
            >
              {loading ? "Updating..." : "Reset Password"}
            </button>
            
            <button
              type="button"
              onClick={clearForm}
              className="w-full bg-gray-50 text-gray-500 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
            >
              <XCircle size={18} /> Clear Values
            </button>
          </div>

          <p className="text-sm text-center mt-4 font-medium text-gray-500">
            Remembered your password?
            <Link to="/login" className="text-blue-600 ml-1 font-bold hover:underline">
              Back to Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;