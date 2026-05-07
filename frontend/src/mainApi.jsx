/* eslint-disable react-refresh/only-export-components */

const isLocalHost =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);

const trimTrailingSlash = (value) => value?.replace(/\/+$/, "");

const backendURI = trimTrailingSlash(
  import.meta.env.VITE_API_URL || (isLocalHost ? "http://localhost:7000" : "/api")
);

const socketURI = trimTrailingSlash(import.meta.env.VITE_SOCKET_URL || backendURI);

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
  socketURI,
  CLOUD_NAME,
  preset,
};
