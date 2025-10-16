# Testing Guide

This document explains the testing setup and how to write tests for the AI Contract Generator.

## Testing Stack

- **Vitest** - Fast, modern test runner with ESM support
- **@vitest/ui** - Interactive UI for running and debugging tests
- **@vitest/coverage-v8** - Code coverage reporting
- **@vitejs/plugin-react** - React component testing support

## Running Tests

### Basic Commands

```bash
# Run tests in watch mode (interactive)
pnpm test

# Run tests once (CI mode)
pnpm test:run

# Run tests with UI
pnpm test:ui

# Run tests with coverage report
pnpm test:coverage
```

### Watch Mode Features

When running `pnpm test`, Vitest starts in watch mode with these features:
- **Auto-rerun** - Tests automatically rerun when files change
- **Filtered execution** - Press keys to filter which tests run
- **Interactive menu** - Press `h` for help menu

### Coverage Reports

After running `pnpm test:coverage`, open `coverage/index.html` in your browser to see:
- Line coverage percentages
- Uncovered code highlighted in red
- Detailed file-by-file breakdown

## Test Structure

Tests are organized using the `__tests__` directory pattern:

```
src/
├── lib/
│   ├── password.ts
│   └── __tests__/
│       └── password.test.ts
├── app/
│   ├── services/
│   │   └── chat/
│   │       ├── instructions.ts
│   │       ├── langchain.ts
│   │       └── __tests__/
│   │           ├── instructions.test.ts
│   │           └── langchain.test.ts
│   └── api/
│       └── chat/
│           ├── route.ts
│           └── __tests__/
│               └── route.test.ts
```

## Writing Tests

### Basic Test Template

```typescript
import { describe, it, expect } from "vitest";
import { functionToTest } from "../module";

describe("Module Name", () => {
  describe("functionToTest", () => {
    it("should do something specific", () => {
      const result = functionToTest(input);
      expect(result).toBe(expected);
    });
  });
});
```

### Testing Async Functions

```typescript
it("should handle async operations", async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});
```

### Using Mocks

```typescript
import { vi, beforeEach } from "vitest";

// Mock a module
vi.mock("@/lib/prisma", () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

// Clear mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});

// Use the mock
import prisma from "@/lib/prisma";

it("should use mocked prisma", async () => {
  vi.mocked(prisma.user.findUnique).mockResolvedValue({
    id: "test-id",
    email: "test@example.com",
  });

  const user = await prisma.user.findUnique({ where: { id: "test-id" } });
  expect(user).toBeDefined();
});
```

## Test Coverage

### Current Coverage

Run `pnpm test:coverage` to generate a coverage report. Aim for:
- **80%+** line coverage for services
- **70%+** line coverage for utilities
- **60%+** line coverage for API routes

### Excluded from Coverage

The following are automatically excluded from coverage reports:
- `node_modules/`
- `generated/` (Prisma client)
- `.next/` (Next.js build)
- Config files (`*.config.*`)
- Type definitions (`*.d.ts`, `/types/**`)

## Testing Best Practices

### 1. Test Naming

Use descriptive test names that explain the expected behavior:

```typescript
// ✅ Good
it("should return 401 when user is not authenticated", () => {});

// ❌ Bad
it("test authentication", () => {});
```

### 2. Arrange-Act-Assert Pattern

Structure tests with clear sections:

```typescript
it("should create new user", async () => {
  // Arrange
  const userData = { email: "test@example.com", name: "Test User" };

  // Act
  const user = await createUser(userData);

  // Assert
  expect(user).toBeDefined();
  expect(user.email).toBe(userData.email);
});
```

### 3. Test One Thing

Each test should verify a single behavior:

```typescript
// ✅ Good - Tests one specific case
it("should return empty array when no chats exist", () => {});
it("should return sorted chats by date", () => {});

// ❌ Bad - Tests multiple things
it("should handle chats", () => {});
```

### 4. Mock External Dependencies

Always mock external services, databases, and APIs:

```typescript
// Mock Prisma
vi.mock("@/lib/prisma");

// Mock environment variables
beforeAll(() => {
  process.env.GEMINI_API_KEY = "test-key";
});
```

### 5. Clean Up After Tests

```typescript
import { afterEach, afterAll } from "vitest";

afterEach(() => {
  vi.clearAllMocks(); // Clear mock call history
});

afterAll(() => {
  vi.restoreAllMocks(); // Restore original implementations
});
```

## Testing Different Types of Code

### Utility Functions

Simple pure functions are easiest to test:

```typescript
import { cn } from "../utils";

it("should merge class names", () => {
  expect(cn("text-red-500", "bg-blue-500")).toContain("text-red-500");
});
```

### Database Operations

Mock Prisma client:

```typescript
vi.mock("@/lib/prisma", () => ({
  default: {
    chat: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

it("should fetch chat by id", async () => {
  vi.mocked(prisma.chat.findUnique).mockResolvedValue(mockChat);
  const chat = await getChatById("test-id");
  expect(chat).toEqual(mockChat);
});
```

### API Routes

Test Next.js route handlers:

```typescript
import { POST } from "../route";

it("should return 400 for invalid input", async () => {
  const request = new Request("http://localhost/api/chat", {
    method: "POST",
    body: JSON.stringify({ invalid: "data" }),
  });

  const response = await POST(request);
  expect(response.status).toBe(400);
});
```

### Authentication

Mock NextAuth:

```typescript
vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

it("should reject unauthenticated requests", async () => {
  vi.mocked(auth).mockResolvedValue(null);
  // ... test logic
});
```

## Debugging Tests

### Using console.log

```typescript
it("should process data", () => {
  const result = processData(input);
  console.log("Result:", result); // Add temporary logging
  expect(result).toBe(expected);
});
```

### Using Vitest UI

Start the UI with `pnpm test:ui` to:
- See test results visually
- Inspect test execution time
- View console output
- Re-run specific tests

### Using VSCode Debugger

Add breakpoints and run tests with:
1. Set breakpoint in test file
2. Run `pnpm test` in terminal
3. VSCode will pause at breakpoint

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: "pnpm"
      - run: pnpm install
      - run: pnpm test:run
      - run: pnpm test:coverage
```

## Common Testing Scenarios

### Testing Error Handling

```typescript
it("should throw error when API key is missing", async () => {
  delete process.env.GEMINI_API_KEY;
  await expect(chatStream(params)).rejects.toThrow("No API key found");
});
```

### Testing Conditional Logic

```typescript
it("should use existing title when available", async () => {
  const chatWithTitle = { title: "Existing Title", messages: [] };
  vi.mocked(prisma.chat.findUnique).mockResolvedValue(chatWithTitle);

  await updateChatTableInDb(params);

  // Assert that existing title was preserved
});
```

### Testing Data Transformations

```typescript
it("should convert messages to JSONB format", () => {
  const messages = [{ role: "user", parts: [{ text: "Hello" }] }];
  const jsonb = JSON.stringify(messages);

  expect(jsonb).toContain("user");
  expect(jsonb).toContain("Hello");
});
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://vitest.dev/guide/best-practices.html)
- [Mocking Guide](https://vitest.dev/guide/mocking.html)
- [Coverage Configuration](https://vitest.dev/guide/coverage.html)

