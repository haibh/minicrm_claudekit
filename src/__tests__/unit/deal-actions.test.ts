import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPrisma } from "@/__tests__/helpers/mock-prisma";
import { Prisma } from "@/generated/prisma/client";
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

const { createDeal, updateDeal, updateDealStage, deleteDeal } = await import("@/actions/deal-actions");
const { auth } = await import("@/lib/auth");
const { prisma } = await import("@/lib/prisma");
const { redirect } = await import("next/navigation");
const { revalidatePath } = await import("next/cache");

const mockPrisma = prisma as unknown as ReturnType<typeof createMockPrisma>;

describe("deal-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createDeal()", () => {
    it("TC-DA01: creates deal with Prisma.Decimal value", async () => {
      (auth.api.getSession as any).mockResolvedValue(mockAuthenticatedSession());
      mockPrisma.company.findFirst.mockResolvedValue({ id: "company-123" } as any);
      mockPrisma.deal.create.mockResolvedValue({ id: "deal-123" } as any);

      const formData = buildFormData({
        name: "Enterprise Deal",
        companyId: "company-123",
        value: "50000",
        stage: "proposal",
        probability: "75",
      });

      await expect(createDeal(formData)).rejects.toThrow("NEXT_REDIRECT");

      const createCall = mockPrisma.deal.create.mock.calls[0][0];
      expect(createCall.data.value).toBeInstanceOf(Prisma.Decimal);
      expect(createCall.data.value.toString()).toBe("50000");
      expect(redirect).toHaveBeenCalledWith("/deals/deal-123");
    });

    it("TC-DA02: throws error when name is missing", async () => {
      (auth.api.getSession as any).mockResolvedValue(mockAuthenticatedSession());

      const formData = buildFormData({
        name: "",
        companyId: "company-123",
      });

      await expect(createDeal(formData)).rejects.toThrow("Name and company are required");
    });

    it("TC-DA03: throws error when companyId is missing", async () => {
      (auth.api.getSession as any).mockResolvedValue(mockAuthenticatedSession());

      const formData = buildFormData({
        name: "Deal",
        companyId: "",
      });

      await expect(createDeal(formData)).rejects.toThrow("Name and company are required");
    });

    it("TC-DA04: defaults value to 0 when not provided", async () => {
      (auth.api.getSession as any).mockResolvedValue(mockAuthenticatedSession());
      mockPrisma.company.findFirst.mockResolvedValue({ id: "company-123" } as any);
      mockPrisma.deal.create.mockResolvedValue({ id: "deal-123" } as any);

      const formData = buildFormData({
        name: "Deal",
        companyId: "company-123",
      });

      await expect(createDeal(formData)).rejects.toThrow("NEXT_REDIRECT");

      const createCall = mockPrisma.deal.create.mock.calls[0][0];
      expect(createCall.data.value.toString()).toBe("0");
    });

    it("TC-DA05: defaults stage to prospecting when not provided", async () => {
      (auth.api.getSession as any).mockResolvedValue(mockAuthenticatedSession());
      mockPrisma.company.findFirst.mockResolvedValue({ id: "company-123" } as any);
      mockPrisma.deal.create.mockResolvedValue({ id: "deal-123" } as any);

      const formData = buildFormData({
        name: "Deal",
        companyId: "company-123",
      });

      await expect(createDeal(formData)).rejects.toThrow("NEXT_REDIRECT");

      expect(mockPrisma.deal.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          stage: "prospecting",
        }),
      });
    });

    it("TC-DA06: throws error when company not owned", async () => {
      (auth.api.getSession as any).mockResolvedValue(mockAuthenticatedSession());
      mockPrisma.company.findFirst.mockResolvedValue(null);

      const formData = buildFormData({
        name: "Deal",
        companyId: "company-999",
      });

      await expect(createDeal(formData)).rejects.toThrow("Company not found");
    });

    it("TC-DA07: throws error when contact not owned", async () => {
      (auth.api.getSession as any).mockResolvedValue(mockAuthenticatedSession());
      mockPrisma.company.findFirst.mockResolvedValue({ id: "company-123" } as any);
      mockPrisma.contact.findFirst.mockResolvedValue(null);

      const formData = buildFormData({
        name: "Deal",
        companyId: "company-123",
        contactId: "contact-999",
      });

      await expect(createDeal(formData)).rejects.toThrow("Contact not found");
    });

    it("TC-DA08: parses expectedCloseDate correctly", async () => {
      (auth.api.getSession as any).mockResolvedValue(mockAuthenticatedSession());
      mockPrisma.company.findFirst.mockResolvedValue({ id: "company-123" } as any);
      mockPrisma.deal.create.mockResolvedValue({ id: "deal-123" } as any);

      const formData = buildFormData({
        name: "Deal",
        companyId: "company-123",
        expectedCloseDate: "2025-03-15",
      });

      await expect(createDeal(formData)).rejects.toThrow("NEXT_REDIRECT");

      const createCall = mockPrisma.deal.create.mock.calls[0][0];
      expect(createCall.data.expectedCloseDate).toBeInstanceOf(Date);
    });
  });

  describe("updateDeal()", () => {
    it("TC-DA09: updates deal successfully", async () => {
      (auth.api.getSession as any).mockResolvedValue(mockAuthenticatedSession());
      mockPrisma.deal.findFirst.mockResolvedValue({ id: "deal-123" } as any);
      mockPrisma.deal.update.mockResolvedValue({ id: "deal-123" } as any);

      const formData = buildFormData({
        name: "Updated Deal",
        companyId: "company-123",
        value: "75000",
        stage: "negotiation",
      });

      await expect(updateDeal("deal-123", formData)).rejects.toThrow("NEXT_REDIRECT");

      expect(mockPrisma.deal.update).toHaveBeenCalledWith({
        where: { id: "deal-123" },
        data: expect.objectContaining({
          name: "Updated Deal",
          stage: "negotiation",
        }),
      });
      expect(revalidatePath).toHaveBeenCalledWith("/deals");
      expect(revalidatePath).toHaveBeenCalledWith("/deals/deal-123");
    });
  });

  describe("updateDealStage()", () => {
    it("TC-DA10: updates stage only and returns success", async () => {
      (auth.api.getSession as any).mockResolvedValue(mockAuthenticatedSession());
      mockPrisma.deal.findFirst.mockResolvedValue({ id: "deal-123" } as any);
      mockPrisma.deal.update.mockResolvedValue({ id: "deal-123" } as any);

      const result = await updateDealStage("deal-123", "closed_won");

      expect(mockPrisma.deal.update).toHaveBeenCalledWith({
        where: { id: "deal-123" },
        data: { stage: "closed_won" },
      });
      expect(result).toEqual({ success: true });
      expect(revalidatePath).toHaveBeenCalledWith("/deals");
    });

    it("TC-DA11: throws error when deal not owned", async () => {
      (auth.api.getSession as any).mockResolvedValue(mockAuthenticatedSession());
      mockPrisma.deal.findFirst.mockResolvedValue(null);

      await expect(updateDealStage("deal-999", "closed_won")).rejects.toThrow("Deal not found");
    });
  });

  describe("deleteDeal()", () => {
    it("TC-DA12: deletes deal successfully", async () => {
      (auth.api.getSession as any).mockResolvedValue(mockAuthenticatedSession());
      mockPrisma.deal.findFirst.mockResolvedValue({ id: "deal-123" } as any);
      mockPrisma.deal.delete.mockResolvedValue({ id: "deal-123" } as any);

      await expect(deleteDeal("deal-123")).rejects.toThrow("NEXT_REDIRECT");

      expect(mockPrisma.deal.delete).toHaveBeenCalledWith({
        where: { id: "deal-123" },
      });
      expect(redirect).toHaveBeenCalledWith("/deals");
    });
  });
});
