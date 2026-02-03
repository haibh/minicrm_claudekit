import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPrisma } from "@/__tests__/helpers/mock-prisma";
import { mockAuthenticatedSession } from "@/__tests__/helpers/mock-auth";
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

const { createContact, updateContact, deleteContact } = await import("@/actions/contact-actions");
const { auth } = await import("@/lib/auth");
const { prisma } = await import("@/lib/prisma");
const { redirect } = await import("next/navigation");
const { revalidatePath } = await import("next/cache");

const mockPrisma = prisma as unknown as ReturnType<typeof createMockPrisma>;

describe("contact-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createContact()", () => {
    it("TC-CT01: creates contact with valid data", async () => {
      (auth.api.getSession as any).mockResolvedValue(mockAuthenticatedSession());
      mockPrisma.company.findFirst.mockResolvedValue({ id: "company-123" } as any);
      mockPrisma.contact.create.mockResolvedValue({ id: "contact-123" } as any);

      const formData = buildFormData({
        name: "John Doe",
        companyId: "company-123",
        email: "john@acme.com",
        jobTitle: "CTO",
      });

      await expect(createContact(formData)).rejects.toThrow("NEXT_REDIRECT");

      expect(mockPrisma.contact.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: "John Doe",
          email: "john@acme.com",
          jobTitle: "CTO",
          companyId: "company-123",
          userId: "test-user-id-001",
        }),
      });
      expect(redirect).toHaveBeenCalledWith("/contacts/contact-123");
    });

    it("TC-CT02: throws error when name is missing", async () => {
      (auth.api.getSession as any).mockResolvedValue(mockAuthenticatedSession());

      const formData = buildFormData({
        name: "",
        companyId: "company-123",
      });

      await expect(createContact(formData)).rejects.toThrow("Contact name is required");
    });

    it("TC-CT03: throws error when companyId is missing", async () => {
      (auth.api.getSession as any).mockResolvedValue(mockAuthenticatedSession());

      const formData = buildFormData({
        name: "John Doe",
        companyId: "",
      });

      await expect(createContact(formData)).rejects.toThrow("Company is required");
    });

    it("TC-CT04: throws error when company not owned", async () => {
      (auth.api.getSession as any).mockResolvedValue(mockAuthenticatedSession());
      mockPrisma.company.findFirst.mockResolvedValue(null);

      const formData = buildFormData({
        name: "John Doe",
        companyId: "company-999",
      });

      await expect(createContact(formData)).rejects.toThrow("Company not found or unauthorized");
    });

    it("TC-CT05: sets authorityLevel when decision maker", async () => {
      (auth.api.getSession as any).mockResolvedValue(mockAuthenticatedSession());
      mockPrisma.company.findFirst.mockResolvedValue({ id: "company-123" } as any);
      mockPrisma.contact.create.mockResolvedValue({ id: "contact-123" } as any);

      const formData = buildFormData({
        name: "John Doe",
        companyId: "company-123",
        isDecisionMaker: "true",
        authorityLevel: "high",
      });

      await expect(createContact(formData)).rejects.toThrow("NEXT_REDIRECT");

      expect(mockPrisma.contact.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          isDecisionMaker: true,
          authorityLevel: "high",
        }),
      });
    });

    it("TC-CT06: nullifies authorityLevel when not decision maker", async () => {
      (auth.api.getSession as any).mockResolvedValue(mockAuthenticatedSession());
      mockPrisma.company.findFirst.mockResolvedValue({ id: "company-123" } as any);
      mockPrisma.contact.create.mockResolvedValue({ id: "contact-123" } as any);

      const formData = buildFormData({
        name: "John Doe",
        companyId: "company-123",
        isDecisionMaker: "false",
        authorityLevel: "high",
      });

      await expect(createContact(formData)).rejects.toThrow("NEXT_REDIRECT");

      expect(mockPrisma.contact.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          isDecisionMaker: false,
          authorityLevel: null,
        }),
      });
    });
  });

  describe("updateContact()", () => {
    it("TC-CT07: updates contact successfully", async () => {
      (auth.api.getSession as any).mockResolvedValue(mockAuthenticatedSession());
      mockPrisma.company.findFirst.mockResolvedValue({ id: "company-123" } as any);
      mockPrisma.contact.update.mockResolvedValue({ id: "contact-123" } as any);

      const formData = buildFormData({
        name: "John Doe Updated",
        companyId: "company-123",
        email: "john.updated@acme.com",
      });

      await expect(updateContact("contact-123", formData)).rejects.toThrow("NEXT_REDIRECT");

      expect(mockPrisma.contact.update).toHaveBeenCalledWith({
        where: { id: "contact-123", userId: "test-user-id-001" },
        data: expect.objectContaining({
          name: "John Doe Updated",
          email: "john.updated@acme.com",
        }),
      });
      expect(revalidatePath).toHaveBeenCalledWith("/contacts/contact-123");
      expect(revalidatePath).toHaveBeenCalledWith("/contacts");
    });
  });

  describe("deleteContact()", () => {
    it("TC-CT08: deletes contact successfully", async () => {
      (auth.api.getSession as any).mockResolvedValue(mockAuthenticatedSession());
      mockPrisma.contact.delete.mockResolvedValue({ id: "contact-123" } as any);

      await expect(deleteContact("contact-123")).rejects.toThrow("NEXT_REDIRECT");

      expect(mockPrisma.contact.delete).toHaveBeenCalledWith({
        where: { id: "contact-123", userId: "test-user-id-001" },
      });
      expect(redirect).toHaveBeenCalledWith("/contacts");
    });

    it("TC-CT09: throws error when deleting non-owned contact", async () => {
      (auth.api.getSession as any).mockResolvedValue(mockAuthenticatedSession());
      mockPrisma.contact.delete.mockRejectedValue(new Error("Record not found"));

      await expect(deleteContact("contact-999")).rejects.toThrow();
    });
  });
});
