import request from "supertest";
import app from "../../src/index";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

describe("User Registration", () => {
  beforeEach(async () => {
    // Clean up test data
    await prisma.userSession.deleteMany();
    await prisma.passwordReset.deleteMany();
    await prisma.application.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("POST /api/auth/register", () => {
    it("should register new user successfully", async () => {
      // First create a role for the user
      const citizenRole = await prisma.role.create({
        data: {
          name: "citizen",
          description: "Regular citizen user",
          permissions: ["submit_applications", "view_own_applications"],
        },
      });

      const userData = {
        email: "test@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
        phone: "+64 21 123 4567",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("user");
      expect(response.body.user).toHaveProperty("id");
      expect(response.body.user).toHaveProperty("email", userData.email);
      expect(response.body.user).toHaveProperty(
        "firstName",
        userData.firstName
      );
      expect(response.body.user).toHaveProperty("lastName", userData.lastName);
      expect(response.body.user).not.toHaveProperty("password"); // Password should not be returned
      expect(response.body.user).toHaveProperty("roleId", citizenRole.id);

      // Verify user was created in database
      const createdUser = await prisma.user.findUnique({
        where: { email: userData.email },
        include: { role: true },
      });

      expect(createdUser).toBeTruthy();
      expect(createdUser?.email).toBe(userData.email);
      expect(createdUser?.role.name).toBe("citizen");
      expect(createdUser?.isActive).toBe(true);
      expect(createdUser?.emailVerified).toBe(false);

      // Verify password was hashed
      const isPasswordValid = await bcrypt.compare(
        userData.password,
        createdUser!.password
      );
      expect(isPasswordValid).toBe(true);
    });

    it("should return 400 for duplicate email", async () => {
      // Create a role first
      const citizenRole = await prisma.role.create({
        data: {
          name: "citizen",
          description: "Regular citizen user",
          permissions: ["submit_applications"],
        },
      });

      // Create an existing user
      await prisma.user.create({
        data: {
          email: "existing@example.com",
          password: await bcrypt.hash("password123", 12),
          firstName: "Existing",
          lastName: "User",
          roleId: citizenRole.id,
        },
      });

      const userData = {
        email: "existing@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("email already exists");
    });

    it("should return 400 for invalid data", async () => {
      const invalidData = {
        email: "invalid-email",
        password: "123", // Too short
        firstName: "", // Empty
        lastName: "Doe",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("errors");
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it("should return 500 for server errors", async () => {
      // Test with invalid role ID to trigger database error
      const userData = {
        email: "test@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
        roleId: "invalid-role-id",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(500);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("error");
    });
  });
});

describe("User Login", () => {
  beforeEach(async () => {
    // Clean up test data
    await prisma.userSession.deleteMany();
    await prisma.passwordReset.deleteMany();
    await prisma.application.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
  });

  describe("POST /api/auth/login", () => {
    it("should login user successfully", async () => {
      // Create a role first
      const citizenRole = await prisma.role.create({
        data: {
          name: "citizen",
          description: "Regular citizen user",
          permissions: ["submit_applications"],
        },
      });

      // Create a test user
      const hashedPassword = await bcrypt.hash("password123", 12);
      const testUser = await prisma.user.create({
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

      const loginData = {
        email: "test@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user).toHaveProperty("id", testUser.id);
      expect(response.body.user).toHaveProperty("email", testUser.email);
      expect(response.body.user).not.toHaveProperty("password");

      // Verify token is a valid JWT
      expect(typeof response.body.token).toBe("string");
      expect(response.body.token.split(".")).toHaveLength(3);
    });

    it("should return 401 for invalid credentials", async () => {
      // Create a role first
      const citizenRole = await prisma.role.create({
        data: {
          name: "citizen",
          description: "Regular citizen user",
          permissions: ["submit_applications"],
        },
      });

      // Create a test user
      const hashedPassword = await bcrypt.hash("password123", 12);
      await prisma.user.create({
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

      const loginData = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("Invalid credentials");
    });

    it("should return 401 for non-existent user", async () => {
      const loginData = {
        email: "nonexistent@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("Invalid credentials");
    });

    it("should return 401 for inactive user", async () => {
      // Create a role first
      const citizenRole = await prisma.role.create({
        data: {
          name: "citizen",
          description: "Regular citizen user",
          permissions: ["submit_applications"],
        },
      });

      // Create an inactive user
      const hashedPassword = await bcrypt.hash("password123", 12);
      await prisma.user.create({
        data: {
          email: "inactive@example.com",
          password: hashedPassword,
          firstName: "Inactive",
          lastName: "User",
          roleId: citizenRole.id,
          isActive: false,
          emailVerified: true,
        },
      });

      const loginData = {
        email: "inactive@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("Account is inactive");
    });

    it("should return 400 for missing fields", async () => {
      const loginData = {
        email: "test@example.com",
        // Missing password
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("error");
    });
  });
});
