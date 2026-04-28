

// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import connectDB from "./config/connectDB.js";
// import cookieParser from "cookie-parser";
// import { createServer } from "http"; // Required for Socket.io
// import { Server } from "socket.io"; 

// dotenv.config();
// const app = express();
// const httpServer = createServer(app); // Wrap the express app

// const io = new Server(httpServer, {
//   cors: {
//     origin: "http://localhost:5173",
//     credentials: true,
//   },
// });

// app.use(express.json());
// app.use(cookieParser());
// app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// connectDB();

// // Your existing routes
// import userRoute from "./routers/userRoute.js";
// import hrRoute from "./routers/hrRoute.js";
// import managerRoute from "./routers/managerRoute.js";
// import employeeRouter from "./routers/employeeRoutes.js";
// import superAdminRoute from "./routers/superAdminRoute.js";
// import chatRoutes from "./routers/chatRoutes.js";

// app.use("/user", userRoute);
// app.use("/hr", hrRoute);
// app.use("/manager", managerRoute);
// app.use("/employee", employeeRouter);
// app.use("/superAdmin", superAdminRoute);
// app.use("/chat", chatRoutes);

// // --- Chatbot Socket Logic ---
// io.on("connection", (socket) => {
//   console.log("A user connected:", socket.id);

//   // User joins their own room and a global team room
//   socket.on("join_team", (data) => {
//     socket.join("team_room");
//     if (data.role === "SuperAdmin") {
//         socket.join("gaint_admin_room"); // Gaint's special monitoring room
//     }
//     console.log(`${data.userName} joined the team chat`);
//   });

//   // Handle sending messages
//   socket.on("send_team_message", (data) => {
//     // data = { senderName: "John", text: "Hello Team", role: "Employee" }
    
//     // Broadcast to everyone in the team
//     io.to("team_room").emit("receive_team_message", data);

//     // Gaint (Super Admin) logs
//     console.log(`[Gaint Monitor] ${data.senderName}: ${data.text}`);
//   });

//   socket.on("disconnect", () => {
//     console.log("User disconnected");
//   });
// });

// // Use httpServer instead of app.listen
// httpServer.listen(process.env.PORT || 5000, () => {
//   console.log(`Server is running at ${process.env.PORT || 5000}`);
// });

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
const allowedOrigins = (
  process.env.CLIENT_URL ||
  process.env.FRONTEND_URL ||
  "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
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
    origin: allowedOrigins,
    credentials: true,
  },
});

initSocket(io);

/* ---------- START SERVER ---------- */
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
