import { Router } from "express";
import AuthRoutes from "./authRoutes.js";
import TaskRoutes from "./taskRoutes.js";
import { protect } from "../middlewares/authMiddleware.js";
const router = Router();

router.use("/api/auth", AuthRoutes);
router.use("/api/task", protect, TaskRoutes);

export default router;
