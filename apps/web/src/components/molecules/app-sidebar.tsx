"use client";

import {
  PencilSquareIcon,
  XMarkIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarHeader,
} from "@repo/ui/components/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import ChatHistory from "./chat-history";

export function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile, isMobile, open, toggleSidebar } = useSidebar();

  const menu = [
    {
      name: "New Chat",
      path: "/new",
      icon: PencilSquareIcon,
      hide: false,
    },
  ];

  const queryClient = useQueryClient();


  // todo: move this later
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

  return (
    <Sidebar
      collapsible="icon"
      className="z-50 group-data-[side=left]:border-0"
    >
      <SidebarContent className="">
        <SidebarHeader className="">
          <SidebarMenu>
            <SidebarMenuItem
              className={`flex items-center ${open || isMobile ? "justify-between" : "justify-center"}`}
            >
              <Bars3Icon
                className="cursor-pointer hidden md:block size-4 text-icon-label stroke-[1.5px]"
                onClick={() => {
                  toggleSidebar();
                }}
              />
              <XMarkIcon
                className="cursor-pointer block md:hidden size-4 text-icon-label stroke-[1.5px]"
                onClick={() => {
                  toggleSidebar();
                }}
              />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="mt-[5vh] max-h-[75vh]">
              {menu.map((item) => (
                <SidebarMenuItem
                  className={item.hide ? "hidden" : ""}
                  key={item.name}
                  onClick={() => {
                    if (isMobile) {
                      setOpenMobile(false);
                    }
                  }}
                >
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.includes(item.path)}
                    disabled={item.hide}
                    className={`transition-all rounded-xl text-text-body duration-200 ease-in-out hover:bg-bg-light2 hover:text-text-title ${pathname.includes(item.path) ? "" : ""}`}
                  >
                    <Link
                      href={item.path}
                      className={"h-9 text-sm -tracking-[1%]"}
                      data-cy={`${item.name.toLowerCase()}-nav-btn`}
                    >
                      {item.icon && (
                        <item.icon className="size-4 stroke-[1.5px]" />
                      )}
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {open && (
                <div className="text-text-label text-sm font-medium tracking-[0%]">
                  Chats
                </div>
              )}
              {open && <ChatHistory />}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
