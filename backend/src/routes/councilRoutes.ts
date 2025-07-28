import { Router } from "express";
import { getCouncils, getCouncilById } from "../controllers/councilController";

const router = Router();

// GET /api/councils - Get all councils
router.get("/", getCouncils);

// GET /api/councils/:id - Get a specific council
router.get("/:id", getCouncilById);

export { router as councilRoutes };
