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
import { TagBadge } from "@/components/shared/tag-badge";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { deleteCompany } from "@/actions/company-actions";
import { formatDate } from "@/lib/utils";
import { Building2 } from "lucide-react";

interface Company {
  id: string;
  name: string;
  industry: string | null;
  size: string | null;
  createdAt: Date;
  _count: {
    contacts: number;
    deals: number;
  };
  tags: Array<{
    tag: {
      id: string;
      name: string;
      color: string;
    };
  }>;
}

interface CompanyListTableProps {
  companies: Company[];
}

export function CompanyListTable({ companies }: CompanyListTableProps) {
  const router = useRouter();

  if (companies.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No companies</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new company.</p>
      </div>
    );
  }

  const formatCompanySize = (size: string | null) => {
    if (!size) return "-";
    const sizeMap: Record<string, string> = {
      tiny_1_10: "1-10",
      small_11_50: "11-50",
      medium_51_200: "51-200",
      large_201_500: "201-500",
      enterprise_500_plus: "500+",
    };
    return sizeMap[size] || size;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Industry</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Contacts</TableHead>
            <TableHead>Deals</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <TableRow
              key={company.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => router.push(`/companies/${company.id}`)}
            >
              <TableCell className="font-medium">{company.name}</TableCell>
              <TableCell>{company.industry || "-"}</TableCell>
              <TableCell>{formatCompanySize(company.size)}</TableCell>
              <TableCell>{company._count.contacts}</TableCell>
              <TableCell>{company._count.deals}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {company.tags.slice(0, 3).map(({ tag }) => (
                    <TagBadge key={tag.id} name={tag.name} color={tag.color} />
                  ))}
                  {company.tags.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{company.tags.length - 3}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>{formatDate(company.createdAt)}</TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <ConfirmDeleteDialog
                  itemName={company.name}
                  onConfirm={async () => {
                    await deleteCompany(company.id);
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
