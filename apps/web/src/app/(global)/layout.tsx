import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SidebarProvider } from "@repo/ui/components/sidebar";
import { AppSidebar } from "@/components/molecules/app-sidebar";
import { TopBar } from "@/components/molecules/top-bar";

export default async function GlobalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";

  if (!session) {
    redirect("/login");
  }

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <div className="relative flex h-screen w-full flex-col items-start justify-start">
        <TopBar />
        <div className="h-full w-full overflow-auto bg-bg-base px-4 md:px-2">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
