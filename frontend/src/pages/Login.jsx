import GaintLogo from "../assets/Gaint_logo.png";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { userURI } from "../mainApi";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      return alert("Email and Password are required");
    }
    setLoading(true);

    try {
      const res = await axios.post(`${userURI}/login`, form, {
        withCredentials: true,
      });

      const userData = res.data?.data; 
      const role = userData?.role;

      if (!role) {
        alert("Role not found in server response");
        return;
      }

      localStorage.setItem("user", JSON.stringify(userData)); 
      localStorage.setItem("role", role);

      if (role === "SuperAdmin") {
        navigate("/superadmin/dashboard");
      } else if (role === "Hr") {
        navigate("/hr/dashboard");
      } else if (role === "Manager") {
        navigate("/manager/dashboard");
      } else if (role === "Employee") {
        navigate("/employee/dashboard");
      } else {
        alert("Unknown role: " + role);
      }
    } catch (err) {
      console.error("LOGIN ERROR 👉", err);
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-xl border-t-4 border-blue-600 overflow-hidden">
        <div className="p-8 pt-10">
          <img
            src={GaintLogo}
            alt="Gaint Logo"
            className="h-12 w-36 mx-auto mb-6 object-contain"
          />

          <h2 className="text-2xl font-black text-center text-gray-800 mb-6">
            Gaint Attendance System Login
          </h2>

          <form className="space-y-6" onSubmit={handleLogin}>
            {/* Email Input */}
            <div className="relative">
              <input
                type="email"
                name="email"
                id="email"
                value={form.email}
                onChange={handleChange}
                placeholder=" "
                className="peer w-full px-4 py-2.5 border rounded-xl bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 placeholder-transparent"
              />
              <label
                htmlFor="email"
                className="absolute left-4 px-1 -top-2.5 text-sm font-bold text-gray-600 bg-white transition-all 
                peer-placeholder-shown:text-base peer-placeholder-shown:font-normal peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2.5 
                peer-focus:-top-2.5 peer-focus:text-sm peer-focus:font-bold peer-focus:text-blue-600 pointer-events-none"
              >
                Email
              </label>
            </div>

            {/* Password Input */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                value={form.password}
                onChange={handleChange}
                placeholder=" "
                className="peer w-full px-4 py-2.5 border rounded-xl bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 placeholder-transparent"
              />
              <label
                htmlFor="password"
                className="absolute left-4 px-1 -top-2.5 text-sm font-bold text-gray-600 bg-white transition-all 
                peer-placeholder-shown:text-base peer-placeholder-shown:font-normal peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2.5 
                peer-focus:-top-2.5 peer-focus:text-sm peer-focus:font-bold peer-focus:text-blue-600 pointer-events-none"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 font-bold hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition active:scale-95 disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;