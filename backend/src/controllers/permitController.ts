import { Request, Response } from "express";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { generateReference } from "../utils/referenceGenerator";
import { analyzeWithAI } from "../services/aiService";

const prisma = new PrismaClient();

// Validation schemas
const submitPermitSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  councilId: z.string().min(1, "Council ID is required"),
  permitTypeId: z.string().min(1, "Permit type ID is required"),
  data: z.record(z.any()),
});

const getPermitSchema = z.object({
  id: z.string().min(1, "Permit ID is required"),
});

/**
 * Submit a new permit application
 * @param req - Express request object
 * @param res - Express response object
 */
export const submitPermitApplication = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validate request body
    const validatedData = submitPermitSchema.parse(req.body);

    // Generate unique reference
    const reference = await generateReference();

    // Create application
    const application = await prisma.application.create({
      data: {
        reference,
        userId: validatedData.userId,
        councilId: validatedData.councilId,
        permitTypeId: validatedData.permitTypeId,
        data: validatedData.data,
        status: "SUBMITTED",
      },
      include: {
        user: true,
        council: true,
        permitType: true,
      },
    });

    // Analyze with AI (async, don't wait for response)
    analyzeWithAI(application.id, validatedData.data).catch(console.error);

    res.status(201).json({
      success: true,
      data: {
        id: application.id,
        reference: application.reference,
        status: application.status,
        submittedAt: application.submittedAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: {
          message: "Validation error",
          details: error.errors,
        },
      });
      return;
    }

    console.error("Error submitting permit application:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to submit permit application",
      },
    });
  }
};

/**
 * Get a specific permit application
 * @param req - Express request object
 * @param res - Express response object
 */
export const getPermitApplication = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validate request params
    const { id } = getPermitSchema.parse(req.params);

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        user: true,
        council: true,
        permitType: true,
      },
    });

    if (!application) {
      res.status(404).json({
        success: false,
        error: {
          message: "Permit application not found",
        },
      });
      return;
    }

    res.json({
      success: true,
      data: application,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: {
          message: "Validation error",
          details: error.errors,
        },
      });
      return;
    }

    console.error("Error getting permit application:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to get permit application",
      },
    });
  }
};

/**
 * Get available permit types
 * @param req - Express request object
 * @param res - Express response object
 */
export const getPermitTypes = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { councilId } = req.query;

    const where = councilId ? { councilId: String(councilId) } : {};

    const permitTypes = await prisma.permitType.findMany({
      where: {
        ...where,
        isActive: true,
      },
      include: {
        council: true,
      },
    });

    res.json({
      success: true,
      data: permitTypes,
    });
  } catch (error) {
    console.error("Error getting permit types:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to get permit types",
      },
    });
  }
};
