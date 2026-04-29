const localBackendURI = "http://localhost:7000";
const isLocalHost =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);
const configuredBackendURI = import.meta.env.VITE_API_URL;
const configuredBackendIsLocal =
  configuredBackendURI &&
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(
    configuredBackendURI.replace(/\/$/, "")
  );

const backendURI = (
  (configuredBackendIsLocal && !isLocalHost ? "" : configuredBackendURI) ||
  (isLocalHost ? localBackendURI : window.location.origin)
).replace(/\/$/, "");

const userURI = `${backendURI}/user`;
const employeeURI = `${backendURI}/employee`;
const managerURI = `${backendURI}/manager`;
const hrURI = `${backendURI}/hr`;
const superAdminURI = `${backendURI}/superAdmin`;
const messageURI = `${backendURI}/messages`;
const managerTaskURI = `${backendURI}/managerTasks`;
const employeeTaskURI = `${backendURI}/employeeTasks`;

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "davofmwez";
const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "nutrition-preset";

export {
  backendURI,
  userURI,
  employeeURI,
  managerURI,
  hrURI,
  CLOUD_NAME,
  preset,
  superAdminURI,
  messageURI,
  managerTaskURI,
  employeeTaskURI,
};
