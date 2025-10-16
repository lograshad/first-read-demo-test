import { describe, it, expect } from "vitest";
import { systemInstructions } from "../instructions";

describe("System Instructions", () => {
  it("should generate complete system instructions", async () => {
    const instructions = await systemInstructions();

    expect(instructions).toBeDefined();
    expect(typeof instructions).toBe("string");
    expect(instructions.length).toBeGreaterThan(100);
  });

  it("should include key sections", async () => {
    const instructions = await systemInstructions();

    // Check for essential instruction components
    expect(instructions).toContain("legal document generator");
    expect(instructions).toContain("Terms of Service");
    expect(instructions).toContain("MARKDOWN");
    expect(instructions).toContain("HTML");
  });

  it("should include dual-format requirements", async () => {
    const instructions = await systemInstructions();

    expect(instructions).toContain("[MARKDOWN]");
    expect(instructions).toContain("[HTML]");
    expect(instructions).toContain("inline styles");
  });

  it("should include document structure requirements", async () => {
    const instructions = await systemInstructions();

    expect(instructions).toContain("Section Numbering");
    expect(instructions).toContain("hierarchical");
    expect(instructions).toContain("Definitions");
  });

  it("should include jurisdiction-specific guidance", async () => {
    const instructions = await systemInstructions();

    expect(instructions).toContain("GDPR");
    expect(instructions).toContain("CCPA");
    expect(instructions).toContain("jurisdiction");
  });

  it("should specify minimum word count", async () => {
    const instructions = await systemInstructions();

    expect(instructions).toContain("3000");
    expect(instructions).toContain("5000");
  });

  it("should include HTML styling requirements", async () => {
    const instructions = await systemInstructions();

    expect(instructions).toContain("inline styles");
    expect(instructions).toContain("font-size");
    expect(instructions).toContain("margin");
  });
});
