"use client";

import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DealStageBadge } from "./deal-stage-badge";
import { DealStage } from "@/generated/prisma/client";

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
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Close Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Probability
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {deals.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  No deals found
                </td>
              </tr>
            ) : (
              deals.map((deal) => (
                <tr
                  key={deal.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/deals/${deal.id}`}
                      className="font-medium text-gray-900 hover:text-blue-600"
                    >
                      {deal.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-gray-900 font-medium">
                    {formatCurrency(deal.value)}
                  </td>
                  <td className="px-6 py-4">
                    <DealStageBadge stage={deal.stage} />
                  </td>
                  <td className="px-6 py-4 text-gray-600">{deal.company.name}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {deal.contact?.name || "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {deal.expectedCloseDate
                      ? formatDate(deal.expectedCloseDate)
                      : "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{deal.probability}%</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
