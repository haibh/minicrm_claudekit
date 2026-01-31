"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { DealKanbanCard } from "./deal-kanban-card";
import { DealStage } from "@/generated/prisma/client";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Deal {
  id: string;
  name: string;
  value: number;
  expectedCloseDate: Date | null;
  company: {
    name: string;
  };
  contact: {
    name: string;
  } | null;
}

interface DealKanbanColumnProps {
  stage: DealStage;
  title: string;
  deals: Deal[];
}

export function DealKanbanColumn({ stage, title, deals }: DealKanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
  });

  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);

  return (
    <div className="flex flex-col min-w-[320px] w-[320px] bg-gray-50 rounded-lg">
      <div className="p-4 border-b border-gray-200 bg-white rounded-t-lg">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-sm text-gray-600">{deals.length} deals</span>
          <span className="text-sm font-medium text-gray-900">
            {formatCurrency(totalValue)}
          </span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 p-3 space-y-3 min-h-[200px] transition-colors",
          isOver && "bg-blue-50"
        )}
      >
        <SortableContext
          items={deals.map((d) => d.id)}
          strategy={verticalListSortingStrategy}
        >
          {deals.map((deal) => (
            <DealKanbanCard key={deal.id} deal={deal} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
