import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { userURI } from "../mainApi";
import React from "react";
import {Mail } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit =async (e) => {
    e.preventDefault();
    // Later: API call to backend
    // console.log("Reset link sent to:", email);
    // alert("If this email exists, a reset link will be sent.");
    setMessage("");

    try {
      setLoading(true);
      const res = await axios.post(
        `${userURI}/forgotPassword`,
        { email },
        {
          withCredentials: true,
        }
      );
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  // };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-4">
          Forgot Password
        </h2>

        {message && (
          <p className="text-center text-sm mb-4 text-blue-600">{message}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <div className="flex items-center border rounded-lg px-3">
              <Mail size={16} className="text-gray-400" />
              <input
                type="email"
                className="w-full p-2 outline-none"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Remember your password?
          <Link to="/login" className="text-blue-600 ml-1">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
