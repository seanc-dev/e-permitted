import { Router } from "express";
import {
  createUser,
  getUserById,
  updateUser,
  getUserProfile,
} from "../controllers/userController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

// POST /api/users - Create a new user
router.post("/", createUser);

// GET /api/users/profile - Get current user profile (authenticated)
router.get("/profile", authenticateToken, getUserProfile);

// GET /api/users/:id - Get a specific user
router.get("/:id", getUserById);

// PUT /api/users/:id - Update a user
router.put("/:id", updateUser);

export { router as userRoutes };
