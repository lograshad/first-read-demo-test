"use client";

import React, { useEffect, useRef, useState } from "react";
import useChat from "./use-chat";
import { useChatStore } from "./chat-store";
import { usePathname } from "next/navigation";
import {
  ArrowPathIcon,
  ArrowUpIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

export default function InputField() {
  const { onSend, cancelResponse } = useChat();
  const [inputMessage, setInputMessage] = useState("");
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const pathname = usePathname();

  const { prompt, retry, message, chatLoading, setMessage } = useChatStore();

  useEffect(() => {
    if (message && message.length > 0) {
      setInputMessage(message);
    } else {
      setInputMessage("");
    }
  }, [message, setInputMessage]);

  useEffect(() => {
    if (prompt) {
      setInputMessage(prompt);
    }
  }, [prompt, setMessage]);
  return (
    <div className="relative w-full transition-all duration-500 ease-in-out border-border-base border rounded-3xl p-3 bg-bg-light">
      <textarea
        ref={chatInputRef}
        value={inputMessage}
        onChange={(e) => {
          e.preventDefault();
          setInputMessage(prompt || e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
          }
        }}
        onKeyUp={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            void onSend({ prompt: inputMessage });
            setMessage(inputMessage);
            setInputMessage("");
          }
        }}
        disabled={chatLoading}
        placeholder="Type your prompt here..."
        className={`${pathname.includes("new") ? "min-h-[48px] md:min-h-[37px]" : "min-h-[100px] md:min-h-[89px]"} transition-all duration-500 ease-in-out dynamic-input max-h-[250px] placeholder:text-sm w-full resize-none border-none bg-transparent focus:outline-none focus:ring-0 text-sm text-text-title placeholder:text-text-caption`}
      />
      <div className="flex w-full items-center justify-between">
        {chatLoading ? (
          <div className="text-xs font-medium text-text-label">
            Generating...
          </div>
        ) : (
          <PlusIcon className="size-3.5 invisible stroke-[1.5px] text-icon-dark cursor-pointer" />
        )}
        <button
          disabled={!inputMessage}
          type="button"
          onClick={() => {
            if (chatLoading) {
              void cancelResponse();
            } else {
              void onSend({ prompt: inputMessage });
              setMessage(inputMessage);
              setInputMessage("");
            }
          }}
          className="group cursor-pointer disabled:cursor-not-allowed"
        >
          {chatLoading ? (
            <div className="relative size-10 rounded-full bg-lightPrimary">
              <div className="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-black dark:bg-white"></div>
            </div>
          ) : retry ? (
            <ArrowPathIcon className="size-3 text-icon-title md:size-5" />
          ) : (
            <span className="bg-bg-base-inv group-disabled:bg-bg-base rounded-full gap-1.5 h-9 px-3 flex items-center justify-center">
              <ArrowUpIcon className="size-4 stroke-[1.5px] text-icon-white-inv group-disabled:text-icon-caption" />
              <span className="text-sm text-text-white-inv group-disabled:text-text-caption font-medium">
                Generate
              </span>
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
