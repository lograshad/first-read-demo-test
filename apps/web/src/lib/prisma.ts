import { PrismaClient } from "@prisma/client";

declare global {
  // Prevent multiple instances of Prisma Client in development
  var __prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  // For Vercel deployments, use optimized configuration
  prisma = new PrismaClient({
    log: ["error"],
    // Configure for serverless environments
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
} else {
  if (!globalThis.__prisma) {
    globalThis.__prisma = new PrismaClient({
      log: ["error", "warn"],
    });
  }
  prisma = globalThis.__prisma;
}

export default prisma;
