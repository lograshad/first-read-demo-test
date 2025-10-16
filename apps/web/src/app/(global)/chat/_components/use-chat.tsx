"use client";

import { useParams, useRouter } from "next/navigation";
import { useChatStore } from "./chat-store";
import { useCallback, useEffect, useRef } from "react";
import { chatControllerStore } from "./chat-controller-store";
import { toast } from "sonner";
import { createHash } from "crypto";
import { ChatMessage } from "@/types/chat";
import { sendChat } from "@/app/services/chat/chat";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CHAT_HISTORY_QUERY_KEY,
  CHAT_MESSAGES_QUERY_KEY,
} from "@/lib/constants";
import { getChatThreadById } from "@/app/actions/chat";

export default function useChat() {
  const { id: chatId } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    threadHistory,
    setThreadHistory,
    setChatLoading,
    addMessage,
    setRetry,
    updateLastMessage,
    setMessage,
  } = useChatStore();

  const { data: chatThreadMessages, isLoading: loadingChatThreadMessages } =
    useQuery({
      queryKey: [...CHAT_MESSAGES_QUERY_KEY, chatId],
      queryFn: () => getChatThreadById({ id: chatId as string }),
      enabled: !!chatId,
    });

  useEffect(() => {
    if (chatThreadMessages?.data?.messages && chatId) {
      const parsedMessages = chatThreadMessages.data
        .messages as unknown as ChatMessage[];
      setThreadHistory(parsedMessages);
    }
  }, [chatThreadMessages, chatId, setThreadHistory]);

  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(
    null
  );
  const isCancelledRef = useRef(false);

  const cancelResponse = useCallback(async () => {
    isCancelledRef.current = true;

    if (chatId) {
      const controller = chatControllerStore.getController(chatId as string);

      if (controller) {
        controller.abort();
        setChatLoading(false);
      } else {
        toast.error("An error occurred: Controller not found");
      }
    } else {
      toast.error("An error occurred: No active chat to cancel");
    }
  }, [setChatLoading, chatId]);

  const onSend = async ({ prompt }: { prompt: string }) => {
    isCancelledRef.current = false;
    if (!prompt) return;
    const isNotNewChat = !!chatId;
    const currentChatId: string = isNotNewChat
      ? (chatId as string)
      : createHash("sha1")
          .update(new Date().getTime().toString())
          .digest("hex")
          .slice(0, 8);

    try {
      setChatLoading(true);
      const existingController =
        chatControllerStore.getController(currentChatId);

      if (existingController) {
        try {
          existingController.abort();
        } catch (e) {
          console.log("Error aborting existing controller:", e);
        }
        chatControllerStore.removeController(currentChatId);
      }

      const controller = new AbortController();
      chatControllerStore.setController({
        chatId: currentChatId,
        controller,
      });

      if (!isNotNewChat) {
        setThreadHistory([]);
      }

      const userMessage: ChatMessage = {
        role: "user",
        parts: [{ text: prompt }],
      };

      addMessage(userMessage);
      router.push(`/chat/${currentChatId}`);
      const modelMessage: ChatMessage = {
        role: "model",
        parts: [{ text: "" }],
      };
      addMessage(modelMessage);

      const res = await sendChat({
        message: prompt,
        chatId: currentChatId,
        signal: controller.signal,
      });

      if (res.status == 401) {
        toast.error("Session timed out");
        router.push("/login");
        return;
      }

      if (res.status == 422) {
        throw new Error(((await res.json()) as { message: string }).message);
      }

      if (res.status != 200) {
        throw new Error("We couldn't make that happen, please try again");
      }

      const reader = res.body?.getReader();
      readerRef.current = reader as ReadableStreamDefaultReader<
        Uint8Array<ArrayBufferLike>
      >;
      const decoder = new TextDecoder();
      let response = "";

      if (!reader) {
        throw new Error("Response stream not available");
      }

      while (true) {
        if (isCancelledRef.current) {
          break;
        }

        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        response += text;
        updateLastMessage(response);
      }
      setRetry(false);
      setMessage("");

      setTimeout(async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: CHAT_HISTORY_QUERY_KEY }),
        ]);
      }, 5000);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Response stream was canceled by user");
      } else {
        console.error("Error in useChat onSend:", error);
        toast.error("An error occurred");
        setChatLoading(false);
        setRetry(true);
        return;
      }
    } finally {
      setChatLoading(false);
      chatControllerStore.removeController(currentChatId);
    }
  };

  return {
    onSend,
    cancelResponse,
    history: threadHistory,
    chatThreadMessages,
    loadingChatThreadMessages,
    setHistory: setThreadHistory,
  };
}
