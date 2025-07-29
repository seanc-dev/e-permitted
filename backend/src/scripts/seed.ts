import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

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

  // Create a test user
  const testUser = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      email: "test@example.com",
      firstName: "John",
      lastName: "Doe",
      phone: "+64 21 123 4567",
      address: {
        street: "123 Main Street",
        city: "Paraparaumu",
        postalCode: "5032",
        region: "Wellington",
        country: "NZ",
      },
    },
  });
  console.log("✅ Created test user:", testUser.email);

  // Create a sample application
  const sampleApplication = await prisma.application.create({
    data: {
      reference: "KCDC-2024-00001",
      status: "SUBMITTED",
      userId: testUser.id,
      councilId: council.id,
      permitTypeId: permitTypes[0].id, // Building consent
      data: {
        applicant: {
          firstName: "John",
          lastName: "Doe",
          email: "test@example.com",
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
  console.log(`- Permit Types: ${permitTypes.length}`);
  console.log(`- Test User: ${testUser.email}`);
  console.log(`- Sample Application: ${sampleApplication.reference}`);
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
