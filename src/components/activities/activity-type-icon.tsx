"use client";

import { ActivityType } from "@/generated/prisma/client";
import { Phone, Mail, Users, FileText, LucideIcon } from "lucide-react";

interface ActivityTypeIconProps {
  type: ActivityType;
  className?: string;
}

const ICON_MAP: Record<ActivityType, LucideIcon> = {
  call: Phone,
  email: Mail,
  meeting: Users,
  note: FileText,
};

const COLOR_MAP: Record<ActivityType, string> = {
  call: "text-green-600",
  email: "text-blue-600",
  meeting: "text-purple-600",
  note: "text-gray-600",
};

export function ActivityTypeIcon({ type, className = "" }: ActivityTypeIconProps) {
  const Icon = ICON_MAP[type];
  const colorClass = COLOR_MAP[type];

  return <Icon className={`${colorClass} ${className}`} />;
}
