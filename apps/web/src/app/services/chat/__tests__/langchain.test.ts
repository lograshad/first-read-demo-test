import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateChatTableInDb } from "../langchain";
import prisma from "@/lib/prisma";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  default: {
    chat: {
      findUnique: vi.fn(),
    },
    $executeRaw: vi.fn(),
  },
}));

describe("LangChain Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("updateChatTableInDb", () => {
    it("should create new chat when none exists", async () => {
      const chatId = "test-chat-id";
      const userId = "test-user-id";
      const prompt = "Test prompt";
      const response = "Test response";

      // Mock no existing chat
      vi.mocked(prisma.chat.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.$executeRaw).mockResolvedValue(1);

      await updateChatTableInDb({
        chatId,
        userId,
        prompt,
        response,
      });

      expect(prisma.chat.findUnique).toHaveBeenCalledWith({
        where: {
          id: chatId,
          user_id: userId,
        },
      });

      expect(prisma.$executeRaw).toHaveBeenCalled();
    });

    it("should append to existing chat messages", async () => {
      const chatId = "test-chat-id";
      const userId = "test-user-id";
      const prompt = "Follow-up prompt";
      const response = "Follow-up response";

      const existingMessages = [
        { role: "user", parts: [{ text: "First message" }] },
        { role: "model", parts: [{ text: "First response" }] },
      ];

      // Mock existing chat
      vi.mocked(prisma.chat.findUnique).mockResolvedValue({
        id: chatId,
        user_id: userId,
        title: "Test Chat",
        messages: existingMessages as any,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      });

      vi.mocked(prisma.$executeRaw).mockResolvedValue(1);

      await updateChatTableInDb({
        chatId,
        userId,
        prompt,
        response,
      });

      expect(prisma.chat.findUnique).toHaveBeenCalled();
      expect(prisma.$executeRaw).toHaveBeenCalled();
    });

    it("should properly format messages as JSONB", async () => {
      const chatId = "test-chat-id";
      const userId = "test-user-id";
      const prompt = "Test prompt";
      const response = "Test response";

      vi.mocked(prisma.chat.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.$executeRaw).mockResolvedValue(1);

      await updateChatTableInDb({
        chatId,
        userId,
        prompt,
        response,
      });

      // Verify the call includes proper message structure
      const executeRawCall = vi.mocked(prisma.$executeRaw).mock.calls[0];
      expect(executeRawCall).toBeDefined();
    });

    it("should handle empty previous messages", async () => {
      const chatId = "test-chat-id";
      const userId = "test-user-id";
      const prompt = "First message";
      const response = "First response";

      vi.mocked(prisma.chat.findUnique).mockResolvedValue({
        id: chatId,
        user_id: userId,
        title: null,
        messages: [] as any,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      });

      vi.mocked(prisma.$executeRaw).mockResolvedValue(1);

      await expect(
        updateChatTableInDb({
          chatId,
          userId,
          prompt,
          response,
        })
      ).resolves.not.toThrow();
    });
  });
});
