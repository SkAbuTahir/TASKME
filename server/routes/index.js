import express from "express";
import userRoutes from "./userRoute.js";
import taskRoutes from "./taskRoute.js";

const router = express.Router();

// Test route
router.get("/", (req, res) => {
  res.json({ message: "API is working!", routes: ["/user", "/task"] });
});

router.use("/user", userRoutes);
router.use("/task", taskRoutes);

export default router;
