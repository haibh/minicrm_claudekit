"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DealStage } from "@/generated/prisma/client";

interface Deal {
  id: string;
  name: string;
  stage: DealStage;
  company?: {
    name: string;
  } | null;
}

interface DealSelectorProps {
  deals: Deal[];
  value?: string;
  onChange: (id: string) => void;
}

const STAGE_LABELS: Record<DealStage, string> = {
  prospecting: "Prospecting",
  qualification: "Qualification",
  proposal: "Proposal",
  negotiation: "Negotiation",
  closed_won: "Won",
  closed_lost: "Lost",
};

export function DealSelector({ deals, value, onChange }: DealSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select a deal" />
      </SelectTrigger>
      <SelectContent>
        {deals.map((deal) => (
          <SelectItem key={deal.id} value={deal.id}>
            <div className="flex flex-col">
              <span className="font-medium">{deal.name}</span>
              <div className="flex gap-2 text-xs text-gray-500">
                {deal.company && <span>{deal.company.name}</span>}
                <span>•</span>
                <span>{STAGE_LABELS[deal.stage]}</span>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
