import { describe, it, expect, vi, beforeEach } from "vitest";
import { Prisma } from "@/generated/prisma/client";
import { createMockPrisma } from "@/__tests__/helpers/mock-prisma";

// Mock prisma BEFORE importing dashboard-queries
vi.mock("@/lib/prisma", () => ({
  prisma: createMockPrisma(),
}));

const {
  getKeyMetrics,
  getPipelineOverview,
  getRecentActivities,
  getDealsClosingSoon,
  getActivitySummary,
} = await import("@/lib/dashboard-queries");

const { prisma } = await import("@/lib/prisma");
const mockPrisma = prisma as unknown as ReturnType<typeof createMockPrisma>;

describe("dashboard-queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getKeyMetrics()", () => {
    it("TC-DQ01: returns correct structure", async () => {
      mockPrisma.company.count.mockResolvedValue(10);
      mockPrisma.contact.count.mockResolvedValue(25);
      mockPrisma.deal.count.mockResolvedValue(5);
      mockPrisma.deal.aggregate.mockResolvedValue({
        _sum: { value: new Prisma.Decimal(50000) },
      });

      const result = await getKeyMetrics("user-123");

      expect(result).toEqual({
        companies: 10,
        contacts: 25,
        openDeals: 5,
        pipelineValue: 50000,
      });
    });

    it("TC-DQ02: filters open stages only", async () => {
      await getKeyMetrics("user-123");

      expect(mockPrisma.deal.count).toHaveBeenCalledWith({
        where: {
          userId: "user-123",
          stage: { notIn: ["closed_won", "closed_lost"] },
        },
      });
    });

    it("TC-DQ03: scopes by userId", async () => {
      await getKeyMetrics("user-456");

      expect(mockPrisma.company.count).toHaveBeenCalledWith({
        where: { userId: "user-456" },
      });
      expect(mockPrisma.contact.count).toHaveBeenCalledWith({
        where: { userId: "user-456" },
      });
    });
  });

  describe("getPipelineOverview()", () => {
    it("TC-DQ04: groups by stage", async () => {
      mockPrisma.deal.groupBy.mockResolvedValue([
        {
          stage: "prospecting",
          _count: { id: 3 },
          _sum: { value: new Prisma.Decimal(15000) },
        },
        {
          stage: "qualification",
          _count: { id: 2 },
          _sum: { value: new Prisma.Decimal(10000) },
        },
      ]);

      const result = await getPipelineOverview("user-123");

      expect(result).toEqual([
        { stage: "prospecting", count: 3, totalValue: 15000 },
        { stage: "qualification", count: 2, totalValue: 10000 },
      ]);
    });

    it("TC-DQ05: excludes closed deals", async () => {
      await getPipelineOverview("user-123");

      expect(mockPrisma.deal.groupBy).toHaveBeenCalledWith({
        by: ["stage"],
        where: {
          userId: "user-123",
          stage: { notIn: ["closed_won", "closed_lost"] },
        },
        _count: { id: true },
        _sum: { value: true },
      });
    });
  });

  describe("getRecentActivities()", () => {
    it("TC-DQ06: returns sorted by createdAt desc", async () => {
      await getRecentActivities("user-123", 10);

      expect(mockPrisma.activity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: "desc" },
        })
      );
    });

    it("TC-DQ07: respects limit parameter", async () => {
      await getRecentActivities("user-123", 5);

      expect(mockPrisma.activity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5,
        })
      );
    });
  });

  describe("getDealsClosingSoon()", () => {
    it("TC-DQ08: filters by date range", async () => {
      const now = new Date();
      const expected = new Date(now);
      expected.setDate(expected.getDate() + 30);

      await getDealsClosingSoon("user-123", 30);

      const call = mockPrisma.deal.findMany.mock.calls[0][0];
      expect(call.where.expectedCloseDate.gte).toBeInstanceOf(Date);
      expect(call.where.expectedCloseDate.lte).toBeInstanceOf(Date);
    });

    it("TC-DQ09: excludes closed deals", async () => {
      await getDealsClosingSoon("user-123", 30);

      expect(mockPrisma.deal.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            stage: { notIn: ["closed_won", "closed_lost"] },
          }),
        })
      );
    });
  });

  describe("getActivitySummary()", () => {
    it("TC-DQ10: returns week/month structure", async () => {
      mockPrisma.activity.groupBy
        .mockResolvedValueOnce([
          { type: "call", _count: { id: 3 } },
          { type: "email", _count: { id: 5 } },
        ])
        .mockResolvedValueOnce([
          { type: "call", _count: { id: 10 } },
          { type: "email", _count: { id: 15 } },
          { type: "meeting", _count: { id: 2 } },
        ]);

      const result = await getActivitySummary("user-123");

      expect(result).toEqual({
        thisWeek: { call: 3, email: 5, meeting: 0, note: 0 },
        thisMonth: { call: 10, email: 15, meeting: 2, note: 0 },
      });
    });
  });
});
