import { prisma } from "@/lib/prisma";
import { DealStage, ActivityType } from "@/generated/prisma/client";

export interface KeyMetrics {
  companies: number;
  contacts: number;
  openDeals: number;
  pipelineValue: number;
}

export interface PipelineOverviewItem {
  stage: DealStage;
  count: number;
  totalValue: number;
}

export interface ActivitySummary {
  thisWeek: Record<ActivityType, number>;
  thisMonth: Record<ActivityType, number>;
}

export async function getKeyMetrics(userId: string): Promise<KeyMetrics> {
  const [companies, contacts, openDeals, pipelineSum] = await Promise.all([
    prisma.company.count({ where: { userId } }),
    prisma.contact.count({ where: { userId } }),
    prisma.deal.count({
      where: {
        userId,
        stage: {
          notIn: ["closed_won", "closed_lost"],
        },
      },
    }),
    prisma.deal.aggregate({
      where: {
        userId,
        stage: {
          notIn: ["closed_won", "closed_lost"],
        },
      },
      _sum: {
        value: true,
      },
    }),
  ]);

  return {
    companies,
    contacts,
    openDeals,
    pipelineValue: pipelineSum._sum.value
      ? Number(pipelineSum._sum.value)
      : 0,
  };
}

export async function getPipelineOverview(
  userId: string
): Promise<PipelineOverviewItem[]> {
  const groupedDeals = await prisma.deal.groupBy({
    by: ["stage"],
    where: {
      userId,
      stage: {
        notIn: ["closed_won", "closed_lost"],
      },
    },
    _count: {
      id: true,
    },
    _sum: {
      value: true,
    },
  });

  return groupedDeals.map((item) => ({
    stage: item.stage,
    count: item._count.id,
    totalValue: item._sum.value ? Number(item._sum.value) : 0,
  }));
}

export async function getRecentActivities(userId: string, limit = 10) {
  return prisma.activity.findMany({
    where: { userId },
    include: {
      company: {
        select: {
          id: true,
          name: true,
        },
      },
      contact: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getDealsClosingSoon(userId: string, days = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() + days);

  return prisma.deal.findMany({
    where: {
      userId,
      stage: {
        notIn: ["closed_won", "closed_lost"],
      },
      expectedCloseDate: {
        lte: cutoffDate,
        gte: new Date(),
      },
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { expectedCloseDate: "asc" },
  });
}

export async function getActivitySummary(
  userId: string
): Promise<ActivitySummary> {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [weekActivities, monthActivities] = await Promise.all([
    prisma.activity.groupBy({
      by: ["type"],
      where: {
        userId,
        createdAt: { gte: weekAgo },
      },
      _count: {
        id: true,
      },
    }),
    prisma.activity.groupBy({
      by: ["type"],
      where: {
        userId,
        createdAt: { gte: monthAgo },
      },
      _count: {
        id: true,
      },
    }),
  ]);

  const emptyRecord = (): Record<ActivityType, number> => ({
    call: 0,
    email: 0,
    meeting: 0,
    note: 0,
  });

  const thisWeek = emptyRecord();
  const thisMonth = emptyRecord();

  weekActivities.forEach((item) => {
    thisWeek[item.type] = item._count.id;
  });

  monthActivities.forEach((item) => {
    thisMonth[item.type] = item._count.id;
  });

  return { thisWeek, thisMonth };
}
