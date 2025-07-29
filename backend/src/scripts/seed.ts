import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Create roles
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: "citizen" },
      update: {},
      create: {
        name: "citizen",
        description: "Regular citizen user",
        permissions: [
          "submit_applications",
          "view_own_applications",
          "edit_profile",
        ],
      },
    }),
    prisma.role.upsert({
      where: { name: "council_staff" },
      update: {},
      create: {
        name: "council_staff",
        description: "Council staff member",
        permissions: [
          "view_applications",
          "process_applications",
          "update_application_status",
          "view_reports",
        ],
      },
    }),
    prisma.role.upsert({
      where: { name: "admin" },
      update: {},
      create: {
        name: "admin",
        description: "System administrator",
        permissions: [
          "manage_users",
          "manage_roles",
          "view_all_applications",
          "system_configuration",
        ],
      },
    }),
  ]);

  console.log(
    "✅ Created roles:",
    roles.map((r) => r.name)
  );

  // Create Kapiti Coast District Council
  const council = await prisma.council.upsert({
    where: { code: "KCDC" },
    update: {},
    create: {
      name: "Kapiti Coast District Council",
      code: "KCDC",
      country: "NZ",
      region: "Wellington",
    },
  });
  console.log("✅ Created council:", council.name);

  // Create permit types for KCDC
  const permitTypes = await Promise.all([
    prisma.permitType.upsert({
      where: {
        councilId_code: {
          councilId: council.id,
          code: "BUILDING",
        },
      },
      update: {},
      create: {
        name: "Building Consent",
        code: "BUILDING",
        description: "Consent for new buildings, alterations, or additions",
        requirements: {
          sitePlan: true,
          floorPlan: true,
          structuralDetails: true,
          drainagePlan: true,
        },
        fees: {
          baseFee: 2500,
          perSquareMeter: 15,
          minimumFee: 2500,
        },
        councilId: council.id,
        isActive: true,
      },
    }),
    prisma.permitType.upsert({
      where: {
        councilId_code: {
          councilId: council.id,
          code: "RESOURCE",
        },
      },
      update: {},
      create: {
        name: "Resource Consent",
        code: "RESOURCE",
        description: "Consent for land use activities and developments",
        requirements: {
          sitePlan: true,
          environmentalAssessment: true,
          trafficImpact: true,
          noiseAssessment: false,
        },
        fees: {
          baseFee: 3000,
          perHectare: 500,
          minimumFee: 3000,
        },
        councilId: council.id,
        isActive: true,
      },
    }),
    prisma.permitType.upsert({
      where: {
        councilId_code: {
          councilId: council.id,
          code: "DEMOLITION",
        },
      },
      update: {},
      create: {
        name: "Demolition Consent",
        code: "DEMOLITION",
        description: "Consent for demolition of buildings or structures",
        requirements: {
          sitePlan: true,
          demolitionPlan: true,
          wasteManagement: true,
          safetyPlan: true,
        },
        fees: {
          baseFee: 1500,
          perSquareMeter: 5,
          minimumFee: 1500,
        },
        councilId: council.id,
        isActive: true,
      },
    }),
    prisma.permitType.upsert({
      where: {
        councilId_code: {
          councilId: council.id,
          code: "FENCE",
        },
      },
      update: {},
      create: {
        name: "Fence Consent",
        code: "FENCE",
        description: "Consent for fence construction or modification",
        requirements: {
          sitePlan: true,
          fenceSpecifications: true,
          neighborConsent: false,
        },
        fees: {
          baseFee: 800,
          perMeter: 25,
          minimumFee: 800,
        },
        councilId: council.id,
        isActive: true,
      },
    }),
  ]);

  console.log(
    "✅ Created permit types:",
    permitTypes.map((pt) => pt.name)
  );

  // Hash password for test users
  const hashedPassword = await bcrypt.hash("password123", 12);

  // Create test users
  const testUsers = await Promise.all([
    prisma.user.upsert({
      where: { email: "citizen@example.com" },
      update: {},
      create: {
        email: "citizen@example.com",
        password: hashedPassword,
        firstName: "John",
        lastName: "Citizen",
        phone: "+64 21 123 4567",
        address: {
          street: "123 Main Street",
          city: "Paraparaumu",
          postalCode: "5032",
          region: "Wellington",
          country: "NZ",
        },
        roleId: roles[0].id, // citizen role
        isActive: true,
        emailVerified: true,
      },
    }),
    prisma.user.upsert({
      where: { email: "staff@example.com" },
      update: {},
      create: {
        email: "staff@example.com",
        password: hashedPassword,
        firstName: "Jane",
        lastName: "Staff",
        phone: "+64 21 234 5678",
        address: {
          street: "456 Council Road",
          city: "Paraparaumu",
          postalCode: "5032",
          region: "Wellington",
          country: "NZ",
        },
        roleId: roles[1].id, // council_staff role
        isActive: true,
        emailVerified: true,
      },
    }),
    prisma.user.upsert({
      where: { email: "admin@example.com" },
      update: {},
      create: {
        email: "admin@example.com",
        password: hashedPassword,
        firstName: "Admin",
        lastName: "User",
        phone: "+64 21 345 6789",
        address: {
          street: "789 Admin Street",
          city: "Paraparaumu",
          postalCode: "5032",
          region: "Wellington",
          country: "NZ",
        },
        roleId: roles[2].id, // admin role
        isActive: true,
        emailVerified: true,
      },
    }),
  ]);

  console.log(
    "✅ Created test users:",
    testUsers.map((u) => u.email)
  );

  // Create a sample application
  const sampleApplication = await prisma.application.create({
    data: {
      reference: "KCDC-2024-00001",
      status: "SUBMITTED",
      userId: testUsers[0].id, // citizen user
      councilId: council.id,
      permitTypeId: permitTypes[0].id, // Building consent
      data: {
        applicant: {
          firstName: "John",
          lastName: "Citizen",
          email: "citizen@example.com",
          phone: "+64 21 123 4567",
        },
        property: {
          address: "123 Main Street, Paraparaumu",
          legalDescription: "Lot 1 DP 123456",
          zone: "Residential",
        },
        project: {
          type: "New dwelling",
          description: "Construction of a 3-bedroom house with attached garage",
          estimatedValue: 450000,
          floorArea: 180,
        },
        documents: [
          "site-plan.pdf",
          "floor-plan.pdf",
          "structural-details.pdf",
        ],
      },
      submittedAt: new Date(),
    },
  });
  console.log("✅ Created sample application:", sampleApplication.reference);

  console.log("🎉 Database seeding completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`- Council: ${council.name}`);
  console.log(`- Roles: ${roles.length}`);
  console.log(`- Permit Types: ${permitTypes.length}`);
  console.log(`- Test Users: ${testUsers.length}`);
  console.log(`- Sample Application: ${sampleApplication.reference}`);
  console.log("\n🔑 Test Credentials:");
  console.log("Citizen: citizen@example.com / password123");
  console.log("Staff: staff@example.com / password123");
  console.log("Admin: admin@example.com / password123");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
