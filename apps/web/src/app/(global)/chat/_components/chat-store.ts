"use client";

import { ChatMessage } from "@/types/chat";
import { create } from "zustand";


type State = {
  retry: boolean;
  chatLoading: boolean;
  message: string;
  prompt: string;
  threadHistory: ChatMessage[];
};

type Actions = {
  setMessage: (history: string) => void;
  setPrompt: (prompt: string) => void;
  setRetry: (retry: boolean) => void;
  setChatLoading: (chatLoading: boolean) => void;
  setThreadHistory: (history: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  updateLastMessage: (text: string) => void;
};

export const useChatStore = create<State & Actions>((set) => ({
  chatLoading: false,
  retry: false,
  message: "",
  prompt: "",
  threadHistory: [],
  setMessage: (message) => set((state) => ({ ...state, message })),
  setPrompt: (prompt) => set((state) => ({ ...state, prompt })),
  setChatLoading: (chatLoading: boolean) =>
    set((state) => ({ ...state, chatLoading })),
  setRetry: (retry: boolean) => set((state) => ({ ...state, retry })),
  setThreadHistory: (history) =>
    set((state) => ({ ...state, threadHistory: history })),
  addMessage: (message) =>
    set((state) => ({
      ...state,
      threadHistory: [...state.threadHistory, message],
    })),
  updateLastMessage: (text) =>
    set((state) => {
      if (state.threadHistory.length === 0) return state;

      const updatedHistory = [...state.threadHistory];
      const lastIndex = updatedHistory.length - 1;
      const lastMessage = updatedHistory[lastIndex];
      if (lastMessage && lastMessage.role === "model") {
        updatedHistory[lastIndex] = {
          role: "model",
          parts: [{ text }],
        };
      }

      return { ...state, threadHistory: updatedHistory };
    }),
}));
