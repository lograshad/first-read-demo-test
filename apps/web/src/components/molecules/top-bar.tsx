"use client";

import { signOut } from "next-auth/react";
import { ThemeToggle } from "./theme-toggle";
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import useUserData from "@/hooks/use-user-data";

export function TopBar() {
  const { data: user } = useUserData();
  const queryClient = useQueryClient();

  const handleSignOut = async () => {
    toast.loading("Signing out...");
    await signOut({
      redirect: true,
      callbackUrl: "/login",
    });
    queryClient.clear();
    localStorage.clear();
    toast.success("Signed out successfully");
    toast.dismiss();
  };

  const firstName = user?.data?.full_name?.split(" ")[0];
  const lastName = user?.data?.full_name?.split(" ")[1];

  return (
    <div className="absolute left-0 right-0 top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border-light bg-bg-base px-6">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold text-text-title tracking-tight">
          FirstRead
          <span className="ml-1 text-lg text-primary">.</span>
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center justify-center rounded-full outline-none ring-offset-2 ring-offset-bg-base focus-visible:ring-2 focus-visible:ring-ring transition-all">
              <Avatar className="h-9 w-9 cursor-pointer">
                <AvatarFallback className="bg-bg-primary text-text-primary text-sm font-medium">
                  {firstName?.charAt(0) ?? "U"}
                  {lastName?.charAt(0) ?? ""}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-text-title">
                  {user?.data?.full_name ?? "User"}
                </p>
                <p className="text-xs text-text-label">
                  {user?.data?.email ?? "User"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              variant="destructive"
              className="cursor-pointer"
            >
              <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
