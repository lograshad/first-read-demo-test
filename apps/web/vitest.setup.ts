import { beforeAll, afterAll, afterEach, vi } from "vitest";

// Mock environment variables
beforeAll(() => {
  process.env.GEMINI_API_KEY = "test-api-key";
  process.env.NEXTAUTH_SECRET = "test-secret";
  process.env.NEXTAUTH_URL = "http://localhost:3000";
  process.env.DATABASE_URL =
    "postgresql://test:test@localhost:5432/test?schema=public";
});

// Clean up mocks after each test
afterEach(() => {
  vi.clearAllMocks();
});

afterAll(() => {
  vi.restoreAllMocks();
});
