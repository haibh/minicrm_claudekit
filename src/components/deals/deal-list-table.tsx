"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { DealStageBadge } from "./deal-stage-badge";
import { deleteDeal } from "@/actions/deal-actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DealStage } from "@/generated/prisma/client";
import { Briefcase } from "lucide-react";

interface Deal {
  id: string;
  name: string;
  value: number;
  stage: DealStage;
  probability: number;
  expectedCloseDate: Date | null;
  company: {
    name: string;
  };
  contact: {
    name: string;
  } | null;
}

interface DealListTableProps {
  deals: Deal[];
}

export function DealListTable({ deals }: DealListTableProps) {
  const router = useRouter();

  if (deals.length === 0) {
    return (
      <div className="text-center py-12">
        <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No deals</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new deal.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Close Date</TableHead>
            <TableHead>Probability</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deals.map((deal) => (
            <TableRow
              key={deal.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => router.push(`/deals/${deal.id}`)}
            >
              <TableCell className="font-medium">{deal.name}</TableCell>
              <TableCell className="font-medium">
                {formatCurrency(deal.value)}
              </TableCell>
              <TableCell>
                <DealStageBadge stage={deal.stage} />
              </TableCell>
              <TableCell>{deal.company.name}</TableCell>
              <TableCell>{deal.contact?.name || "-"}</TableCell>
              <TableCell>
                {deal.expectedCloseDate
                  ? formatDate(deal.expectedCloseDate)
                  : "-"}
              </TableCell>
              <TableCell>{deal.probability}%</TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <ConfirmDeleteDialog
                  itemName={deal.name}
                  onConfirm={async () => {
                    await deleteDeal(deal.id);
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
