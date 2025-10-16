/**
 * Prisma Database Seed Script
 *
 * This script seeds the database with:
 * 1. Test users (based on environment argument)
 *
 * Usage:
 *   pnpm seed                    # Default: development environment
 *   pnpm seed:dev                # Development environment
 *   pnpm seed:test               # Test environment
 *   pnpm seed:prod               # Production environment
 *
 * Direct usage:
 *   tsx prisma/seed.ts --environment=development
 *   tsx prisma/seed.ts --environment=test
 *   tsx prisma/seed.ts --environment=production
 *
 * Environment Arguments:
 *   --environment=production   - Seeds only test users
 *   --environment=development  - Seeds test users
 *   --environment=test         - Seeds test users
 *
 * Test Users Created (development/test only):
 *   - test@example.com (password: password123, individual)
 *   - business@example.com (password: password123, business)
 *   - inactive@example.com (password: password123, individual, inactive)
 *   - admin@example.com (password: admin123, business)
 *   - demo@example.com (password: demo123, individual)
 */

import { randomUUID } from "crypto";
import { parseArgs } from "node:util";
import * as bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

// Function to seed test users (based on environment argument)
async function seedTestUsers(environment: string) {
  if (environment === "production") {
    console.log("🚫 Skipping test user seeding in production environment");
    return;
  }

  console.log(
    `👥 Starting to seed test users for ${environment} environment...`
  );

  const testUsers = [
    {
      id: randomUUID(),
      email: "test@example.com",
      full_name: "Adam Smith",
      password: await bcrypt.hash("password123", 10),
    },
    {
      id: randomUUID(),
      email: "business@example.com",
      full_name: "John Doe",
      password: await bcrypt.hash("password123", 10),
    },
    {
      id: randomUUID(),
      email: "inactive@example.com",
      full_name: "Jane Doe",
      password: await bcrypt.hash("password123", 10),
    },
    {
      id: randomUUID(),
      email: "admin@example.com",
      full_name: "Admin User",
      password: await bcrypt.hash("admin123", 10),
    },
    {
      id: randomUUID(),
      email: "demo@example.com",
      full_name: "Demo User",
      password: await bcrypt.hash("demo123", 10),
    },
  ];

  for (const user of testUsers) {
    try {
      await prisma.user.create({
        data: user,
      });
      console.log(`✅ Created test user: ${user.email}`);
    } catch {
      console.log(`⚠️  User ${user.email} already exists, skipping...`);
    }
  }

  console.log("✅ Test user seeding completed");
}

async function main() {
  const options = {
    environment: { type: "string" as const },
  };

  const {
    values: { environment },
  } = parseArgs({ options });

  if (!environment) {
    console.error(
      "❌ Environment argument is required. Use --environment=development|test|production"
    );
    process.exit(1);
  }

  if (!["development", "test", "production"].includes(environment)) {
    console.error(
      "❌ Invalid environment. Use: development, test, or production"
    );
    process.exit(1);
  }

  try {
    console.log(
      `🚀 Starting database seeding for ${environment} environment...`
    );

    // Seed test users based on environment
    await seedTestUsers(environment);

    console.log("🎉 Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
