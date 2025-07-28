import { Router } from "express";
import {
  submitPermitApplication,
  getPermitApplication,
  getPermitTypes,
} from "../controllers/permitController";

const router = Router();

// GET /api/permits/types - Get available permit types
router.get("/types", getPermitTypes);

// POST /api/permits/submit - Submit a new permit application
router.post("/submit", submitPermitApplication);

// GET /api/permits/:id - Get a specific permit application
router.get("/:id", getPermitApplication);

export { router as permitRoutes };
