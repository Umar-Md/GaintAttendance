import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword.jsx";

import HrDashboard from "./pages/HrDashBoard";
import ManagerDashboardPage from "./pages/ManagerDashBoard";
import EmployeeDashboard from "./pages/EmployeeDashboard";

import SuperAdminDashboard from "./pages/components/superAdmin/SuperAdmin.jsx";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* ================= PUBLIC ROUTES ================= */}

      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />

      <Route path="/signup" element={<Signup />} />

      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ================= SUPER ADMIN ================= */}

      <Route
        path="/superadmin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["SuperAdmin"]}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* ================= HR ================= */}

      <Route
        path="/hr/dashboard"
        element={
          <ProtectedRoute allowedRoles={["Hr"]}>
            <HrDashboard />
          </ProtectedRoute>
        }
      />

      {/* ================= MANAGER ================= */}

      <Route
        path="/manager/dashboard"
        element={
          <ProtectedRoute allowedRoles={["Manager"]}>
            <ManagerDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* ================= EMPLOYEE ================= */}

      <Route
        path="/employee/dashboard"
        element={
          <ProtectedRoute allowedRoles={["Employee"]}>
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />

      {/* ================= FALLBACK ================= */}

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
