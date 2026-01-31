"use client";

import { useState, useMemo } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { DealKanbanColumn } from "./deal-kanban-column";
import { DealKanbanCard } from "./deal-kanban-card";
import { updateDealStage } from "@/actions/deal-actions";
import { DealStage } from "@/generated/prisma/client";
import { useRouter } from "next/navigation";

interface Deal {
  id: string;
  name: string;
  value: number;
  stage: DealStage;
  expectedCloseDate: Date | null;
  company: {
    name: string;
  };
  contact: {
    name: string;
  } | null;
}

interface DealKanbanBoardProps {
  deals: Deal[];
}

const stageOrder: DealStage[] = [
  "prospecting",
  "qualification",
  "proposal",
  "negotiation",
  "closed_won",
  "closed_lost",
];

const stageLabels: Record<DealStage, string> = {
  prospecting: "Prospecting",
  qualification: "Qualification",
  proposal: "Proposal",
  negotiation: "Negotiation",
  closed_won: "Closed Won",
  closed_lost: "Closed Lost",
};

export function DealKanbanBoard({ deals: initialDeals }: DealKanbanBoardProps) {
  const [deals, setDeals] = useState(initialDeals);
  const [activeDealId, setActiveDealId] = useState<string | null>(null);
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const dealsByStage = useMemo(() => {
    const grouped: Record<DealStage, Deal[]> = {
      prospecting: [],
      qualification: [],
      proposal: [],
      negotiation: [],
      closed_won: [],
      closed_lost: [],
    };

    deals.forEach((deal) => {
      grouped[deal.stage].push(deal);
    });

    return grouped;
  }, [deals]);

  const activeDeal = activeDealId
    ? deals.find((d) => d.id === activeDealId)
    : null;

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveDealId(null);

    if (!over || active.id === over.id) return;

    const dealId = active.id as string;
    const newStage = over.id as DealStage;

    const deal = deals.find((d) => d.id === dealId);
    if (!deal || deal.stage === newStage) return;

    // Optimistic update
    const oldStage = deal.stage;
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stage: newStage } : d))
    );

    try {
      await updateDealStage(dealId, newStage);
      router.refresh();
    } catch (error) {
      // Revert on error
      setDeals((prev) =>
        prev.map((d) => (d.id === dealId ? { ...d, stage: oldStage } : d))
      );
      console.error("Failed to update deal stage:", error);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={({ active }) => setActiveDealId(active.id as string)}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stageOrder.map((stage) => (
          <DealKanbanColumn
            key={stage}
            stage={stage}
            title={stageLabels[stage]}
            deals={dealsByStage[stage]}
          />
        ))}
      </div>

      <DragOverlay>
        {activeDeal && (
          <div className="rotate-3 scale-105">
            <DealKanbanCard deal={activeDeal} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
