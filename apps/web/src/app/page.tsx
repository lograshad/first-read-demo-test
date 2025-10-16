"use client";
import "@repo/ui/globals.css"
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.push("/login");
  }, [router]);
  return null;
}
 