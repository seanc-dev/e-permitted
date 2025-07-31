import { Request, Response } from "express";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Validation schemas
const createUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  address: z.record(z.any()).optional(),
});

const updateUserSchema = z.object({
  email: z.string().email("Invalid email address").optional(),
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  phone: z.string().optional(),
  address: z.record(z.any()).optional(),
});

const getUserSchema = z.object({
  id: z.string().min(1, "User ID is required"),
});

// Validation schema for profile updates
const updateProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  email: z.string().email("Invalid email format").optional(),
  phone: z.string().optional(),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      postalCode: z.string().optional(),
      region: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
});

/**
 * Get the profile of the authenticated user
 */
export const getUserProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        applications: {
          select: {
            id: true,
            reference: true,
            status: true,
            submittedAt: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/**
 * Update the profile of the authenticated user
 */
export const updateUserProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const updateData = req.body;

    // Validate input data
    const validationResult = updateProfileSchema.safeParse(updateData);
    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        error: "Invalid data provided",
        details: validationResult.error.errors,
      });
      return;
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    // If email is being updated, check for duplicates
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: updateData.email },
      });

      if (emailExists) {
        res.status(409).json({
          success: false,
          error: "Email already exists",
        });
        return;
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        email: updateData.email,
        phone: updateData.phone,
        address: updateData.address,
      },
      include: {
        role: true,
      },
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;

    res.status(200).json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/**
 * Create a new user
 * @param req - Express request object
 * @param res - Express response object
 */
export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validate request body
    const validatedData = createUserSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        error: {
          message: "User with this email already exists",
        },
      });
      return;
    }

    // Create user
    const userData: any = {
      ...validatedData,
      phone: validatedData.phone ?? null,
    };
    if (typeof validatedData.address !== "undefined") {
      userData.address = validatedData.address;
    }
    const user = await prisma.user.create({
      data: userData,
    });

    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
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

    console.error("Error creating user:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to create user",
      },
    });
  }
};

/**
 * Get a specific user by ID
 * @param req - Express request object
 * @param res - Express response object
 */
export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validate request params
    const { id } = getUserSchema.parse(req.params);

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        applications: {
          include: {
            council: true,
            permitType: true,
          },
          orderBy: {
            submittedAt: "desc",
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: {
          message: "User not found",
        },
      });
      return;
    }

    res.json({
      success: true,
      data: user,
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

    console.error("Error getting user:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to get user",
      },
    });
  }
};

/**
 * Update a user
 * @param req - Express request object
 * @param res - Express response object
 */
export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validate request params and body
    const { id } = getUserSchema.parse(req.params);
    const validatedData = updateUserSchema.parse(req.body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      res.status(404).json({
        success: false,
        error: {
          message: "User not found",
        },
      });
      return;
    }

    // Check if email is being updated and if it's already taken
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (emailExists) {
        res.status(409).json({
          success: false,
          error: {
            message: "Email already exists",
          },
        });
        return;
      }
    }

    // Update user
    const updateData: any = {
      ...validatedData,
      phone: validatedData.phone ?? null,
    };
    if (typeof validatedData.address !== "undefined") {
      updateData.address = validatedData.address;
    }
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        updatedAt: user.updatedAt,
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

    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to update user",
      },
    });
  }
};
