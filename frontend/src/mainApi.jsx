/* eslint-disable react-refresh/only-export-components */

// Detect environment
const isLocalHost =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);

// ✅ Backend base URL
const backendURI = isLocalHost
  ? "http://localhost:7000"
  : "/api"; // Nginx proxy in production

// ✅ API Routes
const userURI = `${backendURI}/user`;
const employeeURI = `${backendURI}/employee`;
const managerURI = `${backendURI}/manager`;
const hrURI = `${backendURI}/hr`;
const superAdminURI = `${backendURI}/superAdmin`;
const messageURI = `${backendURI}/messages`;
const managerTaskURI = `${backendURI}/managerTasks`;
const employeeTaskURI = `${backendURI}/employeeTasks`;

// ✅ Cloudinary
const CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "davofmwez";

const preset =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "nutrition-preset";

// ✅ Export all
export {
  backendURI,
  userURI,
  employeeURI,
  managerURI,
  hrURI,
  superAdminURI,
  messageURI,
  managerTaskURI,
  employeeTaskURI,
  CLOUD_NAME,
  preset,
};