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

const { createActivity, updateActivity, deleteActivity } = await import("@/actions/activity-actions");
const { auth } = await import("@/lib/auth");
const { prisma } = await import("@/lib/prisma");
const { redirect } = await import("next/navigation");
const { revalidatePath } = await import("next/cache");

const mockPrisma = prisma as unknown as ReturnType<typeof createMockPrisma>;

describe("activity-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createActivity()", () => {
    it("TC-AC01: creates activity with valid data", async () => {
      (auth.api.getSession as any).mockResolvedValue(mockAuthenticatedSession());
      mockPrisma.activity.create.mockResolvedValue({ id: "activity-123" } as any);

      const formData = buildFormData({
        type: "call",
        subject: "Follow-up call",
        description: "Discussed pricing",
        date: "2025-02-01T10:00:00Z",
      });

      await expect(createActivity(formData)).rejects.toThrow("NEXT_REDIRECT");

      expect(mockPrisma.activity.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: "call",
          subject: "Follow-up call",
          description: "Discussed pricing",
          userId: "test-user-id-001",
        }),
      });
      expect(redirect).toHaveBeenCalledWith("/activities/activity-123");
    });

    it("TC-AC02: throws error when type is missing", async () => {
      (auth.api.getSession as any).mockResolvedValue(mockAuthenticatedSession());

      const formData = buildFormData({
        subject: "Follow-up call",
      });

      await expect(createActivity(formData)).rejects.toThrow("Type and subject are required");
    });

    it("TC-AC03: throws error when subject is missing", async () => {
      (auth.api.getSession as any).mockResolvedValue(mockAuthenticatedSession());

      const formData = buildFormData({
        type: "call",
        subject: "",
      });

      await expect(createActivity(formData)).rejects.toThrow("Type and subject are required");
    });

    it("TC-AC04: defaults date to now when not provided", async () => {
      (auth.api.getSession as any).mockResolvedValue(mockAuthenticatedSession());
      mockPrisma.activity.create.mockResolvedValue({ id: "activity-123" } as any);

      const formData = buildFormData({
        type: "note",
        subject: "Meeting notes",
      });

      await expect(createActivity(formData)).rejects.toThrow("NEXT_REDIRECT");

      const createCall = mockPrisma.activity.create.mock.calls[0][0];
      expect(createCall.data.date).toBeInstanceOf(Date);
    });

    it("TC-AC05: converts durationMinutes to integer", async () => {
      (auth.api.getSession as any).mockResolvedValue(mockAuthenticatedSession());
      mockPrisma.activity.create.mockResolvedValue({ id: "activity-123" } as any);

      const formData = buildFormData({
        type: "meeting",
        subject: "Quarterly review",
        durationMinutes: "45",
      });

      await expect(createActivity(formData)).rejects.toThrow("NEXT_REDIRECT");

      expect(mockPrisma.activity.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          durationMinutes: 45,
        }),
      });
    });

    it("TC-AC06: revalidates entity paths when links provided", async () => {
      (auth.api.getSession as any).mockResolvedValue(mockAuthenticatedSession());
      mockPrisma.activity.create.mockResolvedValue({ id: "activity-123" } as any);

      const formData = buildFormData({
        type: "email",
        subject: "Proposal sent",
        companyId: "company-123",
        contactId: "contact-456",
        dealId: "deal-789",
      });

      await expect(createActivity(formData)).rejects.toThrow("NEXT_REDIRECT");

      expect(revalidatePath).toHaveBeenCalledWith("/activities");
      expect(revalidatePath).toHaveBeenCalledWith("/companies/company-123");
      expect(revalidatePath).toHaveBeenCalledWith("/contacts/contact-456");
      expect(revalidatePath).toHaveBeenCalledWith("/deals/deal-789");
    });
  });

  describe("updateActivity()", () => {
    it("TC-AC07: updates activity successfully", async () => {
      (auth.api.getSession as any).mockResolvedValue(mockAuthenticatedSession());
      mockPrisma.activity.findUnique.mockResolvedValue({ id: "activity-123" } as any);
      mockPrisma.activity.update.mockResolvedValue({ id: "activity-123" } as any);

      const formData = buildFormData({
        type: "call",
        subject: "Updated subject",
        outcome: "Positive response",
      });

      await expect(updateActivity("activity-123", formData)).rejects.toThrow("NEXT_REDIRECT");

      expect(mockPrisma.activity.update).toHaveBeenCalledWith({
        where: { id: "activity-123" },
        data: expect.objectContaining({
          subject: "Updated subject",
          outcome: "Positive response",
        }),
      });
    });
  });

  describe("deleteActivity()", () => {
    it("TC-AC08: deletes activity successfully", async () => {
      (auth.api.getSession as any).mockResolvedValue(mockAuthenticatedSession());
      mockPrisma.activity.delete.mockResolvedValue({ id: "activity-123" } as any);

      await expect(deleteActivity("activity-123")).rejects.toThrow("NEXT_REDIRECT");

      expect(mockPrisma.activity.delete).toHaveBeenCalledWith({
        where: { id: "activity-123", userId: "test-user-id-001" },
      });
      expect(redirect).toHaveBeenCalledWith("/activities");
    });

    it("TC-AC09: throws error when deleting non-owned activity", async () => {
      (auth.api.getSession as any).mockResolvedValue(mockAuthenticatedSession());
      mockPrisma.activity.delete.mockRejectedValue(new Error("Record not found"));

      await expect(deleteActivity("activity-999")).rejects.toThrow();
    });
  });
});
