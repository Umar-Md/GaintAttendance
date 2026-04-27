import express from "express";
import {
  endAttendance,
  getPublicHolidays,
  login,
  logout,
  forgotPassword,
  resetPassword,
  register,
  seedHr,
  seedSuperAdmin,
  startAttendance,
  updateProfileImage,
} from "../controllers/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const userRoute = express.Router();

userRoute.post("/register", verifyToken, register);
userRoute.post("/login", login);
userRoute.post("/seedHr", seedHr);
userRoute.get("/logout", logout);
userRoute.get("/getPublicHolidays", verifyToken, getPublicHolidays);
userRoute.post("/start", verifyToken, startAttendance);
userRoute.post("/end", verifyToken, endAttendance);
userRoute.patch("/update-image", verifyToken, updateProfileImage);
userRoute.post("/forgotPassword", forgotPassword);
userRoute.post("/resetPassword", resetPassword);
userRoute.get("/seedSuperAdmin", seedSuperAdmin);


export default userRoute;
