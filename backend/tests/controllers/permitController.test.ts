import request from "supertest";
import { PrismaClient } from "@prisma/client";
import app from "../../src/index";

const prisma = new PrismaClient();

describe("Permit Submission", () => {
  beforeAll(async () => {
    // Set up test database
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up test data
    await prisma.application.deleteMany();
    await prisma.user.deleteMany();
    await prisma.permitType.deleteMany();
    await prisma.council.deleteMany();
  });

  describe("POST /api/permits/submit", () => {
    it("should create application with valid data", async () => {
      // Arrange - Create test data
      const council = await prisma.council.create({
        data: {
          name: "Kapiti Coast District Council",
          code: "KCDC",
          country: "NZ",
        },
      });

      const permitType = await prisma.permitType.create({
        data: {
          name: "Building Permit",
          code: "BUILDING",
          description: "For new construction or major renovations",
          councilId: council.id,
        },
      });

      const user = await prisma.user.create({
        data: {
          email: "test@example.com",
          firstName: "John",
          lastName: "Doe",
          phone: "021123456",
        },
      });

      const validData = {
        userId: user.id,
        councilId: council.id,
        permitTypeId: permitType.id,
        data: {
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          phone: "021123456",
          address: {
            street: "123 Main St",
            city: "Paraparaumu",
            postalCode: "5032",
          },
          permitType: "building",
          description: "New residential building construction",
        },
      };

      // Act
      const response = await request(app)
        .post("/api/permits/submit")
        .send(validData)
        .expect(201);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data).toHaveProperty("reference");
      expect(response.body.data.reference).toMatch(/^KCDC-\d{4}-\d{5}$/);
      expect(response.body.data.status).toBe("SUBMITTED");

      // Verify application was created in database
      const application = await prisma.application.findUnique({
        where: { id: response.body.data.id },
        include: { user: true, council: true, permitType: true },
      });

      expect(application).toBeTruthy();
      expect(application?.user.id).toBe(user.id);
      expect(application?.council.id).toBe(council.id);
      expect(application?.permitType.id).toBe(permitType.id);
    });

    it("should return 400 for invalid data", async () => {
      // Arrange
      const invalidData = {
        userId: "",
        councilId: "",
        permitTypeId: "",
        data: {},
      };

      // Act & Assert
      const response = await request(app)
        .post("/api/permits/submit")
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe("Validation error");
      expect(response.body.error.details).toBeDefined();
    });

    it("should generate unique reference number", async () => {
      // Arrange - Create test data
      const council = await prisma.council.create({
        data: {
          name: "Kapiti Coast District Council",
          code: "KCDC",
          country: "NZ",
        },
      });

      const permitType = await prisma.permitType.create({
        data: {
          name: "Building Permit",
          code: "BUILDING",
          description: "For new construction or major renovations",
          councilId: council.id,
        },
      });

      const user = await prisma.user.create({
        data: {
          email: "test@example.com",
          firstName: "John",
          lastName: "Doe",
          phone: "021123456",
        },
      });

      const validData = {
        userId: user.id,
        councilId: council.id,
        permitTypeId: permitType.id,
        data: {
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          phone: "021123456",
          address: {
            street: "123 Main St",
            city: "Paraparaumu",
            postalCode: "5032",
          },
          permitType: "building",
          description: "New residential building construction",
        },
      };

      // Act - Submit multiple applications
      const response1 = await request(app)
        .post("/api/permits/submit")
        .send(validData)
        .expect(201);

      const response2 = await request(app)
        .post("/api/permits/submit")
        .send(validData)
        .expect(201);

      // Assert - References should be unique
      expect(response1.body.data.reference).not.toBe(
        response2.body.data.reference
      );
      expect(response1.body.data.reference).toMatch(/^KCDC-\d{4}-\d{5}$/);
      expect(response2.body.data.reference).toMatch(/^KCDC-\d{4}-\d{5}$/);
    });

    it("should handle database errors gracefully", async () => {
      // Arrange - Try to submit with non-existent IDs
      const invalidData = {
        userId: "non-existent-user-id",
        councilId: "non-existent-council-id",
        permitTypeId: "non-existent-permit-type-id",
        data: {
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          phone: "021123456",
          address: {
            street: "123 Main St",
            city: "Paraparaumu",
            postalCode: "5032",
          },
          permitType: "building",
          description: "New residential building construction",
        },
      };

      // Act & Assert
      const response = await request(app)
        .post("/api/permits/submit")
        .send(invalidData)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe(
        "Failed to submit permit application"
      );
    });
  });

  describe("GET /api/permits/types", () => {
    it("should return active permit types", async () => {
      // Arrange - Create test data
      const council = await prisma.council.create({
        data: {
          name: "Kapiti Coast District Council",
          code: "KCDC",
          country: "NZ",
        },
      });

      await prisma.permitType.createMany({
        data: [
          {
            name: "Building Permit",
            code: "BUILDING",
            description: "For new construction or major renovations",
            councilId: council.id,
            isActive: true,
          },
          {
            name: "Resource Consent",
            code: "RESOURCE",
            description: "For land use activities",
            councilId: council.id,
            isActive: true,
          },
          {
            name: "Inactive Permit",
            code: "INACTIVE",
            description: "This should not appear",
            councilId: council.id,
            isActive: false,
          },
        ],
      });

      // Act
      const response = await request(app).get("/api/permits/types").expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].name).toBe("Building Permit");
      expect(response.body.data[1].name).toBe("Resource Consent");
    });

    it("should filter by council when councilId is provided", async () => {
      // Arrange - Create multiple councils
      const council1 = await prisma.council.create({
        data: {
          name: "Kapiti Coast District Council",
          code: "KCDC",
          country: "NZ",
        },
      });

      const council2 = await prisma.council.create({
        data: {
          name: "Wellington City Council",
          code: "WCC",
          country: "NZ",
        },
      });

      await prisma.permitType.createMany({
        data: [
          {
            name: "KCDC Building Permit",
            code: "BUILDING",
            description: "KCDC building permit",
            councilId: council1.id,
            isActive: true,
          },
          {
            name: "WCC Building Permit",
            code: "BUILDING",
            description: "WCC building permit",
            councilId: council2.id,
            isActive: true,
          },
        ],
      });

      // Act
      const response = await request(app)
        .get(`/api/permits/types?councilId=${council1.id}`)
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe("KCDC Building Permit");
    });

    it("should handle empty results", async () => {
      // Act
      const response = await request(app).get("/api/permits/types").expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });
  });

  describe("GET /api/permits/:id", () => {
    it("should return application by ID", async () => {
      // Arrange - Create test data
      const council = await prisma.council.create({
        data: {
          name: "Kapiti Coast District Council",
          code: "KCDC",
          country: "NZ",
        },
      });

      const permitType = await prisma.permitType.create({
        data: {
          name: "Building Permit",
          code: "BUILDING",
          description: "For new construction or major renovations",
          councilId: council.id,
        },
      });

      const user = await prisma.user.create({
        data: {
          email: "test@example.com",
          firstName: "John",
          lastName: "Doe",
          phone: "021123456",
        },
      });

      const application = await prisma.application.create({
        data: {
          reference: "KCDC-2024-00001",
          userId: user.id,
          councilId: council.id,
          permitTypeId: permitType.id,
          data: {
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            phone: "021123456",
            address: {
              street: "123 Main St",
              city: "Paraparaumu",
              postalCode: "5032",
            },
            permitType: "building",
            description: "New residential building construction",
          },
          status: "SUBMITTED",
        },
      });

      // Act
      const response = await request(app)
        .get(`/api/permits/${application.id}`)
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(application.id);
      expect(response.body.data.reference).toBe("KCDC-2024-00001");
      expect(response.body.data.user.id).toBe(user.id);
      expect(response.body.data.council.id).toBe(council.id);
      expect(response.body.data.permitType.id).toBe(permitType.id);
    });

    it("should return 404 for non-existent application", async () => {
      // Act & Assert
      const response = await request(app)
        .get("/api/permits/non-existent-id")
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe("Permit application not found");
    });

    it("should return 404 for invalid route", async () => {
      // Act & Assert
      const response = await request(app).get("/api/permits/").expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe("Route /api/permits/ not found");
    });
  });
});
