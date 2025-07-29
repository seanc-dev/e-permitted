import request from "supertest";
import app from "../../src/index";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

describe("User Profile Management", () => {
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
        phone: "+64 21 123 4567",
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

  describe("GET /api/users/profile", () => {
    it("should return user profile for authenticated user", async () => {
      const response = await request(app)
        .get("/api/users/profile")
        .set("Authorization", `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("user");
      expect(response.body.user).toHaveProperty("id", testUser.id);
      expect(response.body.user).toHaveProperty("email", testUser.email);
      expect(response.body.user).toHaveProperty(
        "firstName",
        testUser.firstName
      );
      expect(response.body.user).toHaveProperty("lastName", testUser.lastName);
      expect(response.body.user).not.toHaveProperty("password");
      expect(response.body.user).toHaveProperty("role");
      expect(response.body.user.role).toHaveProperty("name", "citizen");
    });

    it("should return 401 for unauthenticated user", async () => {
      const response = await request(app).get("/api/users/profile").expect(401);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("No token provided");
    });

    it("should return 404 for non-existent user", async () => {
      // Create a token for a non-existent user
      const invalidToken = jwt.sign(
        {
          userId: "non-existent-id",
          email: "nonexistent@example.com",
          role: "citizen",
        },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "24h" }
      );

      const response = await request(app)
        .get("/api/users/profile")
        .set("Authorization", `Bearer ${invalidToken}`)
        .expect(401);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("User not found or inactive");
    });
  });

  describe("PUT /api/users/profile", () => {
    it("should update user profile successfully", async () => {
      const updateData = {
        firstName: "Jane",
        lastName: "Smith",
        phone: "+64 21 987 6543",
        address: {
          street: "456 New Street",
          city: "Wellington",
          postalCode: "6011",
          region: "Wellington",
          country: "NZ",
        },
      };

      const response = await request(app)
        .put("/api/users/profile")
        .set("Authorization", `Bearer ${validToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("user");
      expect(response.body.user).toHaveProperty(
        "firstName",
        updateData.firstName
      );
      expect(response.body.user).toHaveProperty(
        "lastName",
        updateData.lastName
      );
      expect(response.body.user).toHaveProperty("phone", updateData.phone);
      expect(response.body.user).toHaveProperty("address");

      // Verify the update was saved to database
      const updatedUser = await prisma.user.findUnique({
        where: { id: testUser.id },
      });

      expect(updatedUser?.firstName).toBe(updateData.firstName);
      expect(updatedUser?.lastName).toBe(updateData.lastName);
      expect(updatedUser?.phone).toBe(updateData.phone);
    });

    it("should return 401 for unauthenticated user", async () => {
      const updateData = {
        firstName: "Jane",
        lastName: "Smith",
      };

      const response = await request(app)
        .put("/api/users/profile")
        .send(updateData)
        .expect(401);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("No token provided");
    });

    it("should return 400 for invalid data", async () => {
      const invalidData = {
        firstName: "", // Empty first name
        email: "invalid-email", // Invalid email
      };

      const response = await request(app)
        .put("/api/users/profile")
        .set("Authorization", `Bearer ${validToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("error");
    });

    it("should return 409 for duplicate email", async () => {
      // Create another user with a different email
      await prisma.user.create({
        data: {
          email: "another@example.com",
          password: await bcrypt.hash("password123", 12),
          firstName: "Another",
          lastName: "User",
          roleId: citizenRole.id,
        },
      });

      const updateData = {
        email: "another@example.com", // Try to use the other user's email
      };

      const response = await request(app)
        .put("/api/users/profile")
        .set("Authorization", `Bearer ${validToken}`)
        .send(updateData)
        .expect(409);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("Email already exists");
    });

    it("should allow updating only specific fields", async () => {
      const updateData = {
        firstName: "Jane",
        // Only update firstName, leave other fields unchanged
      };

      const response = await request(app)
        .put("/api/users/profile")
        .set("Authorization", `Bearer ${validToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body.user).toHaveProperty("firstName", "Jane");
      expect(response.body.user).toHaveProperty("lastName", testUser.lastName); // Unchanged
      expect(response.body.user).toHaveProperty("email", testUser.email); // Unchanged
    });

    it("should handle phone number updates", async () => {
      const updateData = {
        phone: "+64 21 555 1234",
      };

      const response = await request(app)
        .put("/api/users/profile")
        .set("Authorization", `Bearer ${validToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body.user).toHaveProperty("phone", updateData.phone);
    });

    it("should handle address updates", async () => {
      const updateData = {
        address: {
          street: "789 Test Street",
          city: "Auckland",
          postalCode: "1010",
          region: "Auckland",
          country: "NZ",
        },
      };

      const response = await request(app)
        .put("/api/users/profile")
        .set("Authorization", `Bearer ${validToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body.user).toHaveProperty("address");
      expect(response.body.user.address).toHaveProperty(
        "street",
        updateData.address.street
      );
      expect(response.body.user.address).toHaveProperty(
        "city",
        updateData.address.city
      );
    });
  });
});
