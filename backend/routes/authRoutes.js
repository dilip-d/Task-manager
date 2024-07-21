import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import AuthController from "../controllers/authController.js";

const router = express.Router();

router.post("/register", AuthController.register);

router.post("/login", AuthController.login);

// Google OAuth login route
router.post("/google", AuthController.googleLogin);

// Protect route example
router.get("/protected", protect, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});

export default router;
