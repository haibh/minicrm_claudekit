import { DealStage } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

interface DealStageBadgeProps {
  stage: DealStage;
  className?: string;
}

const stageConfig: Record<DealStage, { label: string; className: string }> = {
  prospecting: {
    label: "Prospecting",
    className: "bg-gray-100 text-gray-700 border-gray-300",
  },
  qualification: {
    label: "Qualification",
    className: "bg-blue-100 text-blue-700 border-blue-300",
  },
  proposal: {
    label: "Proposal",
    className: "bg-yellow-100 text-yellow-700 border-yellow-300",
  },
  negotiation: {
    label: "Negotiation",
    className: "bg-orange-100 text-orange-700 border-orange-300",
  },
  closed_won: {
    label: "Closed Won",
    className: "bg-green-100 text-green-700 border-green-300",
  },
  closed_lost: {
    label: "Closed Lost",
    className: "bg-red-100 text-red-700 border-red-300",
  },
};

export function DealStageBadge({ stage, className }: DealStageBadgeProps) {
  const config = stageConfig[stage];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
