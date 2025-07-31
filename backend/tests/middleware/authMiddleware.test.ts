import request from "supertest";
import app from "../../src/index";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

describe("JWT Authentication Middleware", () => {
  let testUser: any;
  let validToken: string;
  let citizenRole: any;

  beforeEach(async () => {
    // Clean up test data in correct order to avoid foreign key violations
    await prisma.userSession.deleteMany();
    await prisma.passwordReset.deleteMany();
    await prisma.application.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();

    // Create a role
    citizenRole = await prisma.role.create({
      data: {
        name: "citizen",
        description: "Regular citizen user",
        permissions: ["submit_applications"],
      },
    });

    // Create a test user
    const hashedPassword = await bcrypt.hash("password123", 12);
    testUser = await prisma.user.create({
      data: {
        email: "test@example.com",
        password: hashedPassword,
        firstName: "John",
        lastName: "Doe",
        roleId: citizenRole.id,
        isActive: true,
        emailVerified: true,
      },
    });

    // Generate a valid token
    validToken = jwt.sign(
      {
        userId: testUser.id,
        email: testUser.email,
        role: "citizen",
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("Protected Routes", () => {
    it("should allow access with valid token", async () => {
      const response = await request(app)
        .get("/api/users/profile")
        .set("Authorization", `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("user");
      expect(response.body.user).toHaveProperty("id", testUser.id);
    });

    it("should deny access without token", async () => {
      const response = await request(app).get("/api/users/profile").expect(401);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("No token provided");
    });

    it("should deny access with invalid token", async () => {
      const response = await request(app)
        .get("/api/users/profile")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("Invalid token");
    });

    it("should deny access with expired token", async () => {
      // Create an expired token
      const expiredToken = jwt.sign(
        {
          userId: testUser.id,
          email: testUser.email,
          role: "citizen",
        },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "0s" } // Expired immediately
      );

      const response = await request(app)
        .get("/api/users/profile")
        .set("Authorization", `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("Token expired");
    });

    it("should extract user from token", async () => {
      const response = await request(app)
        .get("/api/users/profile")
        .set("Authorization", `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body.user).toHaveProperty("email", testUser.email);
      expect(response.body.user).toHaveProperty(
        "firstName",
        testUser.firstName
      );
      expect(response.body.user).toHaveProperty("lastName", testUser.lastName);
    });

    it("should handle malformed authorization header", async () => {
      const response = await request(app)
        .get("/api/users/profile")
        .set("Authorization", "MalformedHeader")
        .expect(401);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("Invalid token format");
    });

    it("should handle missing Bearer prefix", async () => {
      const response = await request(app)
        .get("/api/users/profile")
        .set("Authorization", validToken) // No "Bearer " prefix
        .expect(401);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("Invalid token format");
    });
  });
});
