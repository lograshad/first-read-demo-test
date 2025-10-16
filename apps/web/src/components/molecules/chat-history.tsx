"use client";

import { getChatHistory } from "@/app/actions/chat";
import { CHAT_HISTORY_QUERY_KEY } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui/components/sidebar";

export default function ChatHistory() {
  const { id } = useParams();
  const {
    data: chatHistory,
    isLoading: isLoadingChatHistory,
    error: errorChatHistory,
  } = useQuery({
    queryKey: CHAT_HISTORY_QUERY_KEY,
    queryFn: () => getChatHistory(),
  });

  console.log({
    chatHistory,
    isLoadingChatHistory,
    errorChatHistory,
  });

  if (chatHistory?.length === 0) {
    return (
      <div className="text-xs text-text-label font-medium tracking-[0%]">
        No chats found
      </div>
    );
  }

  return chatHistory?.map((chat) => (
    <SidebarMenuItem key={chat.id}>
      <SidebarMenuButton asChild>
        <Link
          href={`/chat/${chat.id}`}
          className={cn(
            "hover:bg-bg-light2 block rounded-xl w-full p-3 transition-all duration-300 ease-in-out",
            id === chat.id && "bg-bg-light2 text-title"
          )}
        >
          <span className="group-hover:text-title text-text-body text-sm -tracking-[1%]">
            {chat.title ?? "Untitled"}
          </span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  ));
}
