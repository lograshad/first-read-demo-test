import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../route";

// Mock dependencies
vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    user: {
      findFirstOrThrow: vi.fn(),
    },
  },
}));

vi.mock("@/app/services/chat/langchain", () => ({
  chatStream: vi.fn(),
  updateChatTableInDb: vi.fn(),
}));

vi.mock("@/app/services/chat/instructions", () => ({
  systemInstructions: vi.fn(),
}));

vi.mock("@/lib/active-chat-controller", () => ({
  activeChatControllers: {
    set: vi.fn(),
    delete: vi.fn(),
  },
}));

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

describe("Chat API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/chat", () => {
    it("should return 401 when user is not authenticated", async () => {
      // Auth check happens AFTER validation, so we need to pass valid data first
      vi.mocked(auth).mockResolvedValue(null);

      const request = new Request("http://localhost:3000/api/chat", {
        method: "POST",
        body: JSON.stringify({
          message: "Test message",
          chatId: "test-id",
          model: "gemini-2.5-flash-lite",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 400 when validation fails", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "test-user", email: "test@example.com" },
      } as any);

      const request = new Request("http://localhost:3000/api/chat", {
        method: "POST",
        body: JSON.stringify({
          // Missing required fields
          message: "",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Validation error");
    });

    it("should validate model parameter", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "test-user", email: "test@example.com" },
      } as any);

      const request = new Request("http://localhost:3000/api/chat", {
        method: "POST",
        body: JSON.stringify({
          message: "Test",
          chatId: "test-id",
          model: "invalid-model",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Validation error");
    });

    it("should accept valid gemini-2.5-flash-lite model and pass validation", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "test-user", email: "test@example.com" },
      } as any);

      vi.mocked(prisma.user.findFirstOrThrow).mockResolvedValue({
        id: "test-user",
        email: "test@example.com",
        full_name: "Test User",
        password: "hashed",
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      });

      const request = new Request("http://localhost:3000/api/chat", {
        method: "POST",
        body: JSON.stringify({
          message: "Test message",
          chatId: "test-id",
          model: "gemini-2.5-flash-lite",
        }),
      });

      // Should not return validation error (proves model is accepted)
      const response = await POST(request);

      // It will fail during streaming setup since we haven't mocked everything,
      // but it should NOT be a validation error (status 400)
      expect(response.status).not.toBe(400);
    });
  });
});
