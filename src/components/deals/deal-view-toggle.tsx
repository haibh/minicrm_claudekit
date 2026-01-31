"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, Table } from "lucide-react";
import { cn } from "@/lib/utils";

export function DealViewToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view") || "kanban";

  const handleViewChange = (view: "kanban" | "list") => {
    const params = new URLSearchParams(searchParams);
    params.set("view", view);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
      <button
        onClick={() => handleViewChange("kanban")}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
          currentView === "kanban"
            ? "bg-gray-100 text-gray-900"
            : "text-gray-600 hover:text-gray-900"
        )}
      >
        <LayoutGrid className="w-4 h-4" />
        Kanban
      </button>
      <button
        onClick={() => handleViewChange("list")}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
          currentView === "list"
            ? "bg-gray-100 text-gray-900"
            : "text-gray-600 hover:text-gray-900"
        )}
      >
        <Table className="w-4 h-4" />
        List
      </button>
    </div>
  );
}
