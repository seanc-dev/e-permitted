// Global test setup
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = "test";
  process.env.DATABASE_URL =
    process.env.TEST_DATABASE_URL ||
    "postgresql://epermitted:supersecret@localhost:5432/epermitted_dev";
});

// Mock OpenAI for tests
jest.mock("openai", () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
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
  };
});
