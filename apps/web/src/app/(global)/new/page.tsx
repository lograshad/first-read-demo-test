"use client";

import useUserData from "@/hooks/use-user-data";
import React from "react";
import InputField from "../chat/_components/input-field";
import { useChatStore } from "../chat/_components/chat-store";
import { SparklesIcon } from "@heroicons/react/24/outline";

const suggestedPrompts = [
  {
    title: "E-commerce Store",
    prompt:
      "I run an online store selling handmade jewelry. Help me create terms and conditions.",
    icon: "🛍️",
  },
  {
    title: "SaaS Platform",
    prompt:
      "I'm building a SaaS platform for project management. Generate comprehensive terms and conditions.",
    icon: "💻",
  },
  {
    title: "Consulting Business",
    prompt:
      "I offer consulting services for small businesses. Create terms and conditions for my services.",
    icon: "💼",
  },
  {
    title: "Digital Products",
    prompt:
      "I sell digital downloads like templates and courses. I need terms and conditions for my business.",
    icon: "📱",
  },
];

export default function NewChat() {
  const { data: user } = useUserData();
  const { setMessage } = useChatStore();
  const firstName =
    user?.data?.full_name?.split(" ")[1] ?? user?.data?.full_name ?? "there";

  const handlePromptClick = (prompt: string) => {
    setMessage(prompt);
  };

  return (
    <div className="h-screen w-full flex flex-col items-center mt-12 md:mt-0 md:justify-center">
      <div className="flex flex-col items-center w-full h-auto pt-15 md:pt-0">
        <div className="text-text-title text-center flex-1 -tracking-[3%] text-2xl font-semibold mb-5">
          {`Hello ${firstName}`}
          <span className="text-text-label ml-4 text-sm block">
            Tell me about your business to generate terms and conditions
          </span>
        </div>

        {/* Suggested Prompts */}
        <div className="w-full max-w-[640px] mb-6">
          <div className="flex items-center gap-2 mb-3 px-2">
            <SparklesIcon className="size-4 text-text-label" />
            <span className="text-sm font-medium text-text-label">
              Try these examples
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suggestedPrompts.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handlePromptClick(suggestion.prompt)}
                className="group relative overflow-hidden rounded-xl border border-border-base bg-bg-light hover:bg-bg-base hover:border-border-hover transition-all duration-200 p-4 text-left shadow-sm hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl flex-shrink-0 mt-0.5">
                    {suggestion.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-text-title mb-1 group-hover:text-text-brand transition-colors">
                      {suggestion.title}
                    </div>
                    <div className="text-xs text-text-caption line-clamp-2">
                      {suggestion.prompt}
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-transparent group-hover:via-white/5 transition-all duration-300"></div>
              </button>
            ))}
          </div>
        </div>

        <div className="w-full max-w-[640px] min-w-2/5 space-y-4">
          <InputField />
        </div>
      </div>
    </div>
  );
}
