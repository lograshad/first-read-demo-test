import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@repo/ui/globals.css";
import { ThemeProvider } from "next-themes";
import Providers from "./providers";
import { Toaster } from "@repo/ui/components/sonner";
import ThemeAwareTopLoader from "../components/molecules/ThemeAwareTopLoader";

const fontLink = {
  rel: "stylesheet",
  href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Wix+Madefor+Display:wght@400..800&display=swap",
};

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: "First Read",
  description:
    "First Read is a platform for generating terms and conditions for your business",
  icons: "/logo.png",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <link {...fontLink} />
      </head>
      <body className={`${inter.variable} h-full`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ThemeAwareTopLoader />
          <Providers>
            {children}
            <Toaster richColors closeButton position="top-center" />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
