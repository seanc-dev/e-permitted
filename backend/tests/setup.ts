import { PrismaClient } from "@prisma/client";

// Global test setup
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = "test";
  process.env.DATABASE_URL =
    process.env.TEST_DATABASE_URL ||
    "postgresql://test:test@localhost:5432/e_permitted_test";
});

// Global test teardown
afterAll(async () => {
  // Clean up any global resources
});

// Mock OpenAI for tests
jest.mock("openai", () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: "Mock AI analysis response",
              },
            },
          ],
        }),
      },
    },
  })),
}));
