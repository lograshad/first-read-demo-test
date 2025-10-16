import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { ChatMessage } from "@/types/chat";

interface StreamingCallbacks {
  handleLLMNewToken: (token: string) => void;
}

interface ChatResponse {
  response: string;
  billableTokens: {
    input: number;
    output: number;
    total: number;
  };
}

export const createGeminiModel = () => {
  return new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash-lite",
    maxOutputTokens: 50768,
    temperature: 0,
    apiKey: process.env.GEMINI_API_KEY,
  });
};

export async function geminiChatStream({
  systemPrompt,
  userMessage,
  streamingCallbacks,
  abortSignal,
  previousMessages = [],
}: {
  systemPrompt: string;
  userMessage: string;
  streamingCallbacks: StreamingCallbacks;
  abortSignal?: AbortSignal;
  previousMessages?: ChatMessage[];
}): Promise<ChatResponse> {
  const billableTokens = {
    input: 0,
    output: 0,
    total: 0,
  };

  const estimateTokens = (text: string) => Math.ceil(text.length / 4);

  const messageContent =
    previousMessages.length === 0
      ? `${systemPrompt}\n\n${userMessage}`
      : userMessage;
  const inputTokens = estimateTokens(messageContent);
  billableTokens.input += inputTokens;
  billableTokens.total += inputTokens;

  const streamingChatModel = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash-lite",
    maxOutputTokens: 32768,
    temperature: 0,
    streaming: true,
    apiKey: process.env.GEMINI_API_KEY,
    callbacks: [
      {
        handleLLMNewToken(token: string) {
          streamingCallbacks.handleLLMNewToken(token);
        },
      },
    ],
  });

  const convertedMessages: (HumanMessage | AIMessage)[] = [];
  for (const msg of previousMessages) {
    const content = msg.parts?.map((part) => part.text || "").join("") || "";
    if (msg.role === "user") {
      convertedMessages.push(new HumanMessage({ content }));
    } else if (msg.role === "model") {
      convertedMessages.push(new AIMessage({ content }));
    }
  }

  const messageContextLength = 10;
  const contextMessages =
    convertedMessages.length > messageContextLength
      ? convertedMessages.slice(-messageContextLength)
      : convertedMessages;

  const inputMessage =
    previousMessages.length === 0
      ? new HumanMessage({ content: `${systemPrompt}\n\n${userMessage}` })
      : new HumanMessage({ content: userMessage });

  const allMessages = [...contextMessages, inputMessage];

  try {
    let finalResponse = "";

    const stream = await streamingChatModel
      .stream(allMessages, {
        signal: abortSignal,
      })
      .catch((error: Error) => {
        console.error("[geminiChatStream] Error starting stream:", error);
        throw error;
      });

    if (abortSignal?.aborted) {
      return { response: finalResponse, billableTokens };
    }

    try {
      for await (const chunk of stream) {
        if (abortSignal?.aborted) {
          break;
        }

        if (typeof chunk.content === "string") {
          finalResponse += chunk.content;
          const outputTokens = estimateTokens(chunk.content);
          billableTokens.output += outputTokens;
          billableTokens.total += outputTokens;
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Stream was aborted during processing");
        return { response: finalResponse, billableTokens };
      }
      throw error;
    }

    return { response: finalResponse, billableTokens };
  } catch (error) {
    console.error("Error in geminiChatStream:", error);
    return {
      response:
        "I'm sorry, I couldn't understand that. Could you please rephrase?",
      billableTokens,
    };
  }
}
