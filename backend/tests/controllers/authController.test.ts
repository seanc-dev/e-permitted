import request from "supertest";
import app from "../../src/index";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

describe("User Registration", () => {
  let citizenRole: any;

  beforeEach(async () => {
    // Clean up test data in correct order to avoid foreign key violations
    await prisma.userSession.deleteMany();
    await prisma.passwordReset.deleteMany();
    await prisma.application.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();

    // Create a default role for new users
    citizenRole = await prisma.role.create({
      data: {
        name: "citizen",
        description: "Regular citizen user",
        permissions: ["submit_applications"],
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should register new user successfully", async () => {
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
    expect(response.body.user).toHaveProperty("email", userData.email);
    expect(response.body.user).toHaveProperty("firstName", userData.firstName);
    expect(response.body.user).toHaveProperty("lastName", userData.lastName);
    expect(response.body.user).not.toHaveProperty("password");
    expect(response.body.user).toHaveProperty("roleId", citizenRole.id);

    // Verify user was created in database
    const createdUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    expect(createdUser).toBeTruthy();
    expect(createdUser?.email).toBe(userData.email);
    expect(createdUser?.isActive).toBe(true);
    expect(createdUser?.emailVerified).toBe(false);
  });

  it("should return 400 for duplicate email", async () => {
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
    expect(response.body.error).toContain("Email already exists");
  });

  it("should return 400 for invalid data", async () => {
    const invalidData = {
      email: "invalid-email",
      password: "123", // Too short
      firstName: "", // Empty
    };

    const response = await request(app)
      .post("/api/auth/register")
      .send(invalidData)
      .expect(400);

    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("error");
  });

  it("should return 500 for server error", async () => {
    // Mock a database error by trying to create user without required fields
    const invalidData = {
      email: "test@example.com",
      // Missing required fields
    };

    const response = await request(app)
      .post("/api/auth/register")
      .send(invalidData)
      .expect(500);

    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("error");
  });
});

describe("User Login", () => {
  let citizenRole: any;

  beforeEach(async () => {
    // Clean up test data in correct order to avoid foreign key violations
    await prisma.userSession.deleteMany();
    await prisma.passwordReset.deleteMany();
    await prisma.application.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();

    // Create a default role
    citizenRole = await prisma.role.create({
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
  });

  it("should login user successfully", async () => {
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
    expect(response.body.user).toHaveProperty("email", loginData.email);
    expect(response.body.user).not.toHaveProperty("password");

    // Verify token is valid JWT
    const token = response.body.token;
    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3); // JWT has 3 parts
  });

  it("should return 401 for invalid credentials", async () => {
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
    // Create an inactive user
    await prisma.user.create({
      data: {
        email: "inactive@example.com",
        password: await bcrypt.hash("password123", 12),
        firstName: "Inactive",
        lastName: "User",
        roleId: citizenRole.id,
        isActive: false,
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
