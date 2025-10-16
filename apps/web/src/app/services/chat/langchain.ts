import prisma from "@/lib/prisma";
import { ChatMessage } from "@/types/chat";
import { createGeminiModel, geminiChatStream } from "./gemini";

interface ChatResponse {
  response: string;
  billableTokens: {
    input: number;
    output: number;
    total: number;
  };
}

interface StreamingCallbacks {
  handleLLMNewToken: (token: string) => void;
}

export const createChatModel = () => {
  return createGeminiModel();
};

export async function chatStream({
  systemPrompt,
  chatId,
  userMessage,
  streamingCallbacks,
  abortSignal,
}: {
  systemPrompt: string;
  chatId: string;
  userMessage: string;
  streamingCallbacks: StreamingCallbacks;
  abortSignal?: AbortSignal;
}): Promise<ChatResponse> {
  const googleApiKey = process.env.GEMINI_API_KEY;

  if (!googleApiKey) {
    throw new Error("No API key found for Google Gemini");
  }

  const previousChats = await prisma.chat.findUnique({
    where: {
      id: chatId,
    },
    select: {
      messages: true,
    },
  });

  const chatMessages = (previousChats?.messages ??
    []) as unknown as Array<ChatMessage>;

  return geminiChatStream({
    systemPrompt,
    userMessage,
    streamingCallbacks,
    abortSignal,
    previousMessages: chatMessages,
  });
}

export async function updateChatTableInDb({
  chatId,
  userId,
  prompt,
  response,
}: {
  chatId: string;
  userId: string;
  prompt: string;
  response: string;
}): Promise<void> {
  const previousChatThread = await prisma.chat.findUnique({
    where: {
      id: chatId,
      user_id: userId,
    },
  });

  const previousChatMessages = (previousChatThread?.messages ??
    []) as unknown as Array<ChatMessage>;

  const finalMessages = [
    ...previousChatMessages,
    {
      role: "user",
      parts: [{ text: prompt }],
    },
    {
      role: "model",
      parts: [{ text: response }],
    },
  ];

  const stringifiedFinalMessages = JSON.stringify(finalMessages);

  await prisma.$executeRaw`
    INSERT INTO chats (id, user_id, messages, title, updated_at)
    VALUES (
      ${chatId},
      ${userId},
      ${stringifiedFinalMessages}::jsonb,
      ${prompt},
      NOW()
    )
    ON CONFLICT (id)
    DO UPDATE SET
      title = CASE 
                WHEN (chats.title IS NULL OR chats.title = '') THEN ${prompt}
                ELSE chats.title
              END,
      messages = ${stringifiedFinalMessages}::jsonb,
      updated_at = NOW()
    WHERE chats.user_id = ${userId} AND chats.id = ${chatId};
  `;
}
