import { describe, it, expect } from "vitest";
import { cn, formatCurrency, formatDate, formatDateTime } from "@/lib/utils";

describe("utils", () => {
  describe("cn()", () => {
    it("TC-U01: merges class names", () => {
      const result = cn("text-red-500", "bg-blue-500");
      expect(result).toContain("text-red-500");
      expect(result).toContain("bg-blue-500");
    });

    it("TC-U02: resolves Tailwind conflicts (px-2 + px-4 → px-4)", () => {
      const result = cn("px-2", "px-4");
      expect(result).toBe("px-4");
      expect(result).not.toContain("px-2");
    });

    it("TC-U03: handles conditional classes", () => {
      const result = cn("visible", false && "hidden");
      expect(result).toBe("visible");
      expect(result).not.toContain("hidden");
    });
  });

  describe("formatCurrency()", () => {
    it("TC-U04: formats 1234567 to $1,234,567", () => {
      const result = formatCurrency(1234567);
      expect(result).toBe("$1,234,567");
    });

    it("TC-U05: formats 0 to $0", () => {
      const result = formatCurrency(0);
      expect(result).toBe("$0");
    });
  });

  describe("formatDate()", () => {
    it("TC-U06: formats Date object with month + year", () => {
      const date = new Date("2025-03-15");
      const result = formatDate(date);
      expect(result).toMatch(/Mar/);
      expect(result).toMatch(/2025/);
    });

    it("TC-U07: formats ISO string with month + year", () => {
      const result = formatDate("2025-03-15");
      expect(result).toMatch(/Mar/);
      expect(result).toMatch(/2025/);
    });
  });

  describe("formatDateTime()", () => {
    it("TC-U08: formats Date with date + time", () => {
      const date = new Date("2025-03-15T14:30:00");
      const result = formatDateTime(date);
      expect(result).toMatch(/Mar/);
      expect(result).toMatch(/2025/);
      expect(result).toMatch(/\d{1,2}:\d{2}/); // Time format
    });
  });
});
