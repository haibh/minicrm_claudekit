"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Building2, User, Calendar } from "lucide-react";

interface DealKanbanCardProps {
  deal: {
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
  };
}

export function DealKanbanCard({ deal }: DealKanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
    >
      <Link href={`/deals/${deal.id}`} className="block space-y-2">
        <h4 className="font-medium text-sm text-gray-900 line-clamp-2">
          {deal.name}
        </h4>

        <div className="text-lg font-semibold text-gray-900">
          {formatCurrency(deal.value)}
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Building2 className="w-3.5 h-3.5" />
            <span className="truncate">{deal.company.name}</span>
          </div>

          {deal.contact && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <User className="w-3.5 h-3.5" />
              <span className="truncate">{deal.contact.name}</span>
            </div>
          )}

          {deal.expectedCloseDate && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(deal.expectedCloseDate)}</span>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
