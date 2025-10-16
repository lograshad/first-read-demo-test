import { describe, it, expect } from "vitest";
import * as bcrypt from "bcryptjs";
import { hashPassword, comparePassword } from "../password";

describe("Password Utilities", () => {
  describe("hashPassword", () => {
    it("should hash a password", async () => {
      const password = "testPassword123";
      const hashed = await hashPassword(password);

      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(0);
    });

    it("should generate different hashes for the same password", async () => {
      const password = "testPassword123";
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it("should create valid bcrypt hashes", async () => {
      const password = "testPassword123";
      const hashed = await hashPassword(password);

      // bcrypt hashes start with $2a$, $2b$, or $2y$
      expect(hashed).toMatch(/^\$2[aby]\$/);
    });
  });

  describe("comparePassword", () => {
    it("should return true for matching passwords", async () => {
      const password = "testPassword123";
      const hashed = await hashPassword(password);
      const isMatch = await comparePassword(password, hashed);

      expect(isMatch).toBe(true);
    });

    it("should return false for non-matching passwords", async () => {
      const password = "testPassword123";
      const wrongPassword = "wrongPassword456";
      const hashed = await hashPassword(password);
      const isMatch = await comparePassword(wrongPassword, hashed);

      expect(isMatch).toBe(false);
    });

    it("should handle empty passwords", async () => {
      const hashed = await hashPassword("test");
      const isMatch = await comparePassword("", hashed);

      expect(isMatch).toBe(false);
    });
  });
});
