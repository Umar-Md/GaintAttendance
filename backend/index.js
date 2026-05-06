
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./config/connectDB.js";
import { initSocket } from "./socket/socket.js";

// Routes
import userRoute from "./routers/userRoute.js";
import hrRoute from "./routers/hrRoute.js";
import managerRoute from "./routers/managerRoute.js";
import employeeRouter from "./routers/employeeRoutes.js";
import superAdminRoute from "./routers/superAdminRoutes.js";
import messageRouter from "./routers/messageRoutes.js";
import managerTaskrouter from "./routers/managerTaskRoutes.js";
import employeeTaskRouter from "./routers/EmployeeTaskRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 7000;
const isProduction = process.env.ENVI === "production";
const defaultOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "https://attendance.gaintclout.com",
];

const allowedOrigins = [
  ...defaultOrigins,
  ...`${process.env.CLIENT_URL || ""},${process.env.FRONTEND_URL || ""},${
    process.env.CORS_ORIGIN || ""
  },${process.env.CORS_ORIGINS || ""}`
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
].filter((origin, index, origins) => origins.indexOf(origin) === index);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;

  try {
    const { hostname, protocol } = new URL(origin);
    const isLocalDevOrigin =
      !isProduction &&
      ["localhost", "127.0.0.1"].includes(hostname) &&
      ["http:", "https:"].includes(protocol);
    const isGaintSubdomain =
      protocol === "https:" &&
      (hostname === "gaintclout.com" || hostname.endsWith(".gaintclout.com"));

    return isLocalDevOrigin || isGaintSubdomain;
  } catch {
    return false;
  }
};

const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    console.warn(`CORS blocked origin: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
  optionsSuccessStatus: 204,
};

/* ---------- MIDDLEWARE ---------- */
// Parse JSON (also tolerates Postman sending JSON as text/plain)
app.use(
  express.json({
    type: ["application/json", "application/*+json", "text/plain"],
  })
);
// Allow Postman/HTML form submissions (x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));

/* ---------- DATABASE ---------- */
connectDB();

/* ---------- ROUTES ---------- */
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/user", userRoute);
app.use("/hr", hrRoute);
app.use("/manager", managerRoute);
app.use("/employee", employeeRouter);
app.use("/superAdmin", superAdminRoute);
app.use("/messages", messageRouter);
app.use("/managerTasks", managerTaskrouter);
app.use("/employeeTasks", employeeTaskRouter);

/* ---------- SOCKET SETUP ---------- */
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      console.warn(`Socket CORS blocked origin: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
  },
});

initSocket(io);

/* ---------- START SERVER ---------- */
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
