import { Routes, Route, Navigate } from "react-router-dom";
// import Chatbot from "./pages/Chatbot.jsx";
import { useLocation } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import HrDashboard from "./pages/HrDashBoard";
import ManagerDashboardPage from "./pages/ManagerDashBoard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import SuperAdminDashboard from "./pages/components/superAdmin/SuperAdmin.jsx";
import ProtectedRoute from "./protectedRoute";
import ResetPassword from "./pages/ResetPassword.jsx";
import ChatPage from "./pages/Chat/ChatPage.jsx";

function App() {
  const location = useLocation();
  const hideChat = ["/login", "/signup", "/forgot-password"].includes(
    location.pathname,
  );
  // ✅ GET USER SAFELY

  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <>
      {/* 🌍 GLOBAL CHATBOT */}
      {/* {!hideChat && <ChatPage user={user} />} */}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Super Admin */}
        <Route
          path="/superadmin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["SuperAdmin"]}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* HR */}
        <Route
          path="/hr/dashboard"
          element={
            <ProtectedRoute allowedRoles={["Hr"]}>
              <HrDashboard />
            </ProtectedRoute>
          }
        />

        {/* Manager */}
        <Route
          path="/manager/dashboard"
          element={
            <ProtectedRoute allowedRoles={["Manager"]}>
              <ManagerDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Employee */}
        <Route
          path="/employee/dashboard"
          element={
            <ProtectedRoute allowedRoles={["Employee"]}>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />

        {/* <Route
          path="/chat"
          element={
            <ProtectedRoute
              allowedRoles={["Employee", "Manager", "Hr", "SuperAdmin"]}
            >
              <ChatPage user={user} />
            </ProtectedRoute>
          }
        /> */}

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </>
  );
}

export default App;