import { Request, Response } from "express";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Validation schemas
const getCouncilSchema = z.object({
  id: z.string().min(1, "Council ID is required"),
});

/**
 * Get all councils
 * @param req - Express request object
 * @param res - Express response object
 */
export const getCouncils = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const councils = await prisma.council.findMany({
      include: {
        permitTypes: {
          where: {
            isActive: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: councils,
    });
  } catch (error) {
    console.error("Error getting councils:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to get councils",
      },
    });
  }
};

/**
 * Get a specific council by ID
 * @param req - Express request object
 * @param res - Express response object
 */
export const getCouncilById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validate request params
    const { id } = getCouncilSchema.parse(req.params);

    const council = await prisma.council.findUnique({
      where: { id },
      include: {
        permitTypes: {
          where: {
            isActive: true,
          },
        },
      },
    });

    if (!council) {
      res.status(404).json({
        success: false,
        error: {
          message: "Council not found",
        },
      });
      return;
    }

    res.json({
      success: true,
      data: council,
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

    console.error("Error getting council:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to get council",
      },
    });
  }
};
