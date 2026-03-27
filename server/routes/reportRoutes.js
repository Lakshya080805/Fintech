import express from "express";
import protect from "../middleware/authMiddleware.js";
import { exportReport } from "../controllers/reportController.js";

const router = express.Router();

router.get("/export", protect, exportReport);

export default router;
