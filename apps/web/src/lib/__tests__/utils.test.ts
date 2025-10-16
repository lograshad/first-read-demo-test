import { describe, it, expect } from "vitest";
import { cn } from "../utils";

describe("Utility Functions", () => {
  describe("cn (className merger)", () => {
    it("should merge class names", () => {
      const result = cn("text-red-500", "bg-blue-500");
      expect(result).toContain("text-red-500");
      expect(result).toContain("bg-blue-500");
    });

    it("should handle conditional classes", () => {
      const isActive = true;
      const result = cn("base-class", isActive && "active-class");
      expect(result).toContain("base-class");
      expect(result).toContain("active-class");
    });

    it("should filter out falsy values", () => {
      const result = cn("base", false && "hidden", null, undefined, "visible");
      expect(result).toContain("base");
      expect(result).toContain("visible");
      expect(result).not.toContain("false");
      expect(result).not.toContain("null");
    });

    it("should handle Tailwind conflicts", () => {
      // tailwind-merge should resolve conflicts
      const result = cn("p-4", "p-8");
      // Should only include the last padding value
      expect(result).toBe("p-8");
    });

    it("should handle empty input", () => {
      const result = cn();
      expect(result).toBe("");
    });

    it("should handle arrays of classes", () => {
      const result = cn(["text-sm", "font-bold"], "text-blue-500");
      expect(result).toContain("text-sm");
      expect(result).toContain("font-bold");
      expect(result).toContain("text-blue-500");
    });
  });
});
