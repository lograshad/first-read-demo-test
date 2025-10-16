import { systemInstructions } from "@/app/services/chat/instructions";
import { chatStream, updateChatTableInDb } from "@/app/services/chat/langchain";
import { auth } from "@/auth";
import { activeChatControllers } from "@/lib/active-chat-controller";
import prisma from "@/lib/prisma";
import { z } from "zod";

const SUPPORTED_MODELS = ["gpt-4o-mini", "gemini-2.5-flash-lite"] as const;

const chatInputSchema = z.object({
  message: z.string(),
  chatId: z.string(),
  model: z.enum(SUPPORTED_MODELS),
});

export async function POST(request: Request) {
  const result = chatInputSchema.safeParse(await request.json());

  if (!result.success) {
    return Response.json(
      { error: "Validation error", errors: result.error.flatten() },
      { status: 400 }
    );
  }

  const { message, chatId, model } = result.data;
  console.log({ model });

  if (!message) {
    return Response.json({ error: "Message is required" }, { status: 400 });
  }

  const session = await auth();

  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findFirstOrThrow({
    where: { id: session.user.id },
  });

  async function buildSystemPrompt() {
    const systemPrompt = await systemInstructions();

    return `${systemPrompt}`;
  }

  const controller = new AbortController();
  const { signal } = controller;
  activeChatControllers.set(chatId, controller);

  try {
    request.signal.addEventListener("abort", () => {
      setTimeout(() => controller.abort(), 300);
    });

    const systemPrompt = await buildSystemPrompt();

    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    let fullResponse = "";

    const streamedResponse = new Response(stream.readable, {
      headers: {
        "Content-Type": "text/plain",
        "Transfer-Encoding": "chunked",
        Connection: "keep-alive",
        "Cache-Control": "no-cache, no-transform",
      },
    });

    chatStream({
      systemPrompt,
      chatId,
      userMessage: message,
      streamingCallbacks: {
        handleLLMNewToken: async (token) => {
          try {
            fullResponse += token;
            await writer.write(encoder.encode(token));
          } catch (error) {
            console.error("Error while streaming token:", error);
          }
        },
      },
      abortSignal: signal,
    })
      .then(async ({ billableTokens }) => {
        try {
          await writer.close();

          await updateChatTableInDb({
            chatId,
            userId: user.id,
            prompt: message,
            response: fullResponse,
          });

          console.log("billableTokens", billableTokens);
        } catch (error) {
          console.error("Error in streaming completion:", error);
        }
      })
      .catch(async (error) => {
        console.error("Streaming error:", error);
        try {
          await writer.write(
            encoder.encode(
              "\n\nI'm sorry, an error occurred. Please try again."
            )
          );
          await writer.close();
        } catch (writerError) {
          console.error("Error closing writer:", writerError);
        }
      });

    return streamedResponse;
  } catch (error) {
    console.error("Chat error:", error);
    activeChatControllers.delete(chatId);
    return Response.json({ message: "Something went wrong." }, { status: 500 });
  }
}
