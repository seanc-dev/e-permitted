import { Router } from "express";
import {
  createUser,
  getUserById,
  updateUser,
} from "../controllers/userController";

const router = Router();

// POST /api/users - Create a new user
router.post("/", createUser);

// GET /api/users/:id - Get a specific user
router.get("/:id", getUserById);

// PUT /api/users/:id - Update a user
router.put("/:id", updateUser);

export { router as userRoutes };
