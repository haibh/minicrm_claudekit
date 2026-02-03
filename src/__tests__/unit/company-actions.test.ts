import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPrisma } from "@/__tests__/helpers/mock-prisma";
import {
  mockAuthenticatedSession,
  mockUnauthenticatedSession,
} from "@/__tests__/helpers/mock-auth";
import { buildFormData } from "@/__tests__/helpers/form-data-builder";

// Mock dependencies BEFORE imports
vi.mock("@/lib/prisma", () => ({ prisma: createMockPrisma() }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn().mockImplementation((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/headers", () => ({ headers: vi.fn().mockResolvedValue(new Headers()) }));
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

const { createCompany, updateCompany, deleteCompany } = await import("@/actions/company-actions");
const { auth } = await import("@/lib/auth");
const { prisma } = await import("@/lib/prisma");
const { redirect } = await import("next/navigation");
const { revalidatePath } = await import("next/cache");

const mockPrisma = prisma as unknown as ReturnType<typeof createMockPrisma>;

describe("company-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createCompany()", () => {
    it("TC-CA01: creates company with valid data and redirects", async () => {
      (auth.api.getSession as any).mockResolvedValue(mockAuthenticatedSession());
      mockPrisma.company.create.mockResolvedValue({ id: "company-123" } as any);

      const formData = buildFormData({
        name: "Acme Corp",
        industry: "Tech",
        website: "https://acme.com",
      });

      await expect(createCompany(formData)).rejects.toThrow("NEXT_REDIRECT");

      expect(mockPrisma.company.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: "Acme Corp",
          industry: "Tech",
          website: "https://acme.com",
          userId: "test-user-id-001",
        }),
      });
      expect(redirect).toHaveBeenCalledWith("/companies/company-123");
    });

    it("TC-CA02: throws error when name is empty", async () => {
      (auth.api.getSession as any).mockResolvedValue(mockAuthenticatedSession());

      const formData = buildFormData({ name: "   " });

      await expect(createCompany(formData)).rejects.toThrow("Company name is required");
    });

    it("TC-CA03: throws error when unauthenticated", async () => {
      (auth.api.getSession as any).mockResolvedValue(mockUnauthenticatedSession());

      const formData = buildFormData({ name: "Acme Corp" });

      await expect(createCompany(formData)).rejects.toThrow("NEXT_REDIRECT");
      expect(redirect).toHaveBeenCalledWith("/login");
    });

    it("TC-CA04: creates company with tags", async () => {
      (auth.api.getSession as any).mockResolvedValue(mockAuthenticatedSession());
      mockPrisma.tag.upsert
        .mockResolvedValueOnce({ id: "tag-1", name: "vip" } as any)
        .mockResolvedValueOnce({ id: "tag-2", name: "enterprise" } as any);
      mockPrisma.company.create.mockResolvedValue({ id: "company-123" } as any);

      const formData = buildFormData({
        name: "Acme Corp",
        tags: "vip, enterprise",
      });

      await expect(createCompany(formData)).rejects.toThrow("NEXT_REDIRECT");

      expect(mockPrisma.tag.upsert).toHaveBeenCalledTimes(2);
      expect(mockPrisma.company.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tags: {
            create: [{ tagId: "tag-1" }, { tagId: "tag-2" }],
          },
        }),
      });
    });

    it("TC-CA05: handles empty tags gracefully", async () => {
      (auth.api.getSession as any).mockResolvedValue(mockAuthenticatedSession());
      mockPrisma.company.create.mockResolvedValue({ id: "company-123" } as any);

      const formData = buildFormData({
        name: "Acme Corp",
        tags: "",
      });

      await expect(createCompany(formData)).rejects.toThrow("NEXT_REDIRECT");

      expect(mockPrisma.tag.upsert).not.toHaveBeenCalled();
      expect(mockPrisma.company.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tags: { create: [] },
        }),
      });
    });
  });

  describe("updateCompany()", () => {
    it("TC-CA06: updates company and revalidates paths", async () => {
      (auth.api.getSession as any).mockResolvedValue(mockAuthenticatedSession());
      mockPrisma.company.update.mockResolvedValue({ id: "company-123" } as any);

      const formData = buildFormData({
        name: "Updated Corp",
        industry: "Finance",
      });

      await updateCompany("company-123", formData);

      expect(mockPrisma.company.update).toHaveBeenCalledWith({
        where: { id: "company-123", userId: "test-user-id-001" },
        data: expect.objectContaining({
          name: "Updated Corp",
          industry: "Finance",
        }),
      });
      expect(revalidatePath).toHaveBeenCalledWith("/companies/company-123");
      expect(revalidatePath).toHaveBeenCalledWith("/companies");
    });

    it("TC-CA07: throws error when updating non-owned company", async () => {
      (auth.api.getSession as any).mockResolvedValue(mockAuthenticatedSession());
      mockPrisma.company.update.mockRejectedValue(new Error("Record not found"));

      const formData = buildFormData({ name: "Hacked Corp" });

      await expect(updateCompany("company-999", formData)).rejects.toThrow();
    });
  });

  describe("deleteCompany()", () => {
    it("TC-CA08: deletes company and redirects", async () => {
      (auth.api.getSession as any).mockResolvedValue(mockAuthenticatedSession());
      mockPrisma.company.delete.mockResolvedValue({ id: "company-123" } as any);

      await expect(deleteCompany("company-123")).rejects.toThrow("NEXT_REDIRECT");

      expect(mockPrisma.company.delete).toHaveBeenCalledWith({
        where: { id: "company-123", userId: "test-user-id-001" },
      });
      expect(redirect).toHaveBeenCalledWith("/companies");
    });

    it("TC-CA09: throws error when deleting non-owned company", async () => {
      (auth.api.getSession as any).mockResolvedValue(mockAuthenticatedSession());
      mockPrisma.company.delete.mockRejectedValue(new Error("Record not found"));

      await expect(deleteCompany("company-999")).rejects.toThrow();
    });
  });
});
