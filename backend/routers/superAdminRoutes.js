import express from "express";
import {
  activateHR,
  createHR,
  deactivateHR,
  getAllHRs,
  getSuperAdminDetails,
  getSystemStats,
  permanentlyDeleteHR,
  updateSuperAdminProfile,
} from "../controllers/superAdminController.js";
import { superAdminOnly, verifyToken } from "../middleware/authMiddleware.js";

const superAdminRoute = express.Router();

superAdminRoute.get("/me", verifyToken, superAdminOnly, getSuperAdminDetails);
superAdminRoute.post("/create-hr", verifyToken, superAdminOnly, createHR);
superAdminRoute.get("/hrs", verifyToken, superAdminOnly, getAllHRs);
superAdminRoute.put(
  "/hr/deactivate/:id",
  verifyToken,
  superAdminOnly,
  deactivateHR
);
superAdminRoute.put(
  "/hr/activate/:id",
  verifyToken,
  superAdminOnly,
  activateHR
);
superAdminRoute.delete(
  "/hr/:id",
  verifyToken,
  superAdminOnly,
  permanentlyDeleteHR
);
superAdminRoute.put(
  "/update-profile",
  verifyToken,
  superAdminOnly,
  updateSuperAdminProfile
);

superAdminRoute.get("/stats", verifyToken, superAdminOnly, getSystemStats);

export default superAdminRoute;
