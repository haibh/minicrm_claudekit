import { Badge } from "@/components/ui/badge";

interface TagBadgeProps {
  name: string;
  color?: string;
}

export function TagBadge({ name, color = "#6B7280" }: TagBadgeProps) {
  return (
    <Badge
      variant="secondary"
      style={{
        backgroundColor: `${color}20`,
        color: color,
        borderColor: color,
      }}
      className="border"
    >
      {name}
    </Badge>
  );
}
