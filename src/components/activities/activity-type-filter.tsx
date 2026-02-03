"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ActivityTypeFilterProps {
  currentType?: string;
}

export function ActivityTypeFilter({ currentType }: ActivityTypeFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("type");
    } else {
      params.set("type", value);
    }
    params.delete("page"); // Reset pagination on filter change
    const query = params.toString();
    router.push(`/activities${query ? `?${query}` : ""}`);
  };

  return (
    <Select
      defaultValue={currentType || "all"}
      onValueChange={handleChange}
    >
      <SelectTrigger aria-label="Filter by type">
        <SelectValue placeholder="All types" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All types</SelectItem>
        <SelectItem value="call">Call</SelectItem>
        <SelectItem value="email">Email</SelectItem>
        <SelectItem value="meeting">Meeting</SelectItem>
        <SelectItem value="note">Note</SelectItem>
      </SelectContent>
    </Select>
  );
}
