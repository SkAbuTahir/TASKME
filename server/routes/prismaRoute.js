import express from "express";
import { getUsers, getTasks, createTask } from "../controllers/prismaController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/users", protectRoute, getUsers);
router.get("/tasks", protectRoute, getTasks);
router.post("/tasks", protectRoute, createTask);

export default router;