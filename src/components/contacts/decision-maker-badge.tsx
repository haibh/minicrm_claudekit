"use client";

import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { AuthorityLevel } from "@/generated/prisma/client";

interface DecisionMakerBadgeProps {
  isDecisionMaker: boolean;
  authorityLevel?: AuthorityLevel | null;
}

export function DecisionMakerBadge({ isDecisionMaker, authorityLevel }: DecisionMakerBadgeProps) {
  if (!isDecisionMaker) {
    return <span className="text-gray-400">-</span>;
  }

  const getLevelConfig = (level: AuthorityLevel | null | undefined) => {
    switch (level) {
      case "primary":
        return { color: "bg-amber-100 text-amber-800", text: "Primary" };
      case "secondary":
        return { color: "bg-blue-100 text-blue-800", text: "Secondary" };
      case "influencer":
        return { color: "bg-gray-100 text-gray-800", text: "Influencer" };
      default:
        return { color: "bg-gray-100 text-gray-800", text: "Decision Maker" };
    }
  };

  const config = getLevelConfig(authorityLevel);

  return (
    <Badge className={`${config.color} flex items-center gap-1`} variant="outline">
      <Star className="h-3 w-3" />
      {config.text}
    </Badge>
  );
}
