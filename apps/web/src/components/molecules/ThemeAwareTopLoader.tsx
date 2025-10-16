"use client";

import NextTopLoader from "nextjs-toploader";
import { useTheme } from "next-themes";

export default function ThemeAwareTopLoader() {
  const { resolvedTheme } = useTheme();

  return (
    <NextTopLoader
      color={resolvedTheme === "dark" ? "#ffffff" : "#000000"}
      height={3}
      showSpinner={false}
      crawlSpeed={200}
      initialPosition={0.08}
    />
  );
}
