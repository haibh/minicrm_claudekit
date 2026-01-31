import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DealStageBadge } from "./deal-stage-badge";
import { Building2, User, Calendar, TrendingUp } from "lucide-react";
import { DealStage } from "@/generated/prisma/client";

interface DealDetailCardProps {
  deal: {
    id: string;
    name: string;
    value: number;
    stage: DealStage;
    probability: number;
    expectedCloseDate: Date | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    company: {
      id: string;
      name: string;
      industry: string | null;
    };
    contact: {
      id: string;
      name: string;
      email: string | null;
    } | null;
  };
}

export function DealDetailCard({ deal }: DealDetailCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{deal.name}</h1>
        <div className="mt-2">
          <DealStageBadge stage={deal.stage} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="text-sm text-gray-600 mb-1">Deal Value</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(deal.value)}
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-600 mb-1">Probability</div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gray-400" />
            <span className="text-2xl font-bold text-gray-900">
              {deal.probability}%
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <div className="text-sm text-gray-600">Company</div>
            <Link
              href={`/companies/${deal.company.id}`}
              className="font-medium text-blue-600 hover:underline"
            >
              {deal.company.name}
            </Link>
            {deal.company.industry && (
              <div className="text-sm text-gray-500">{deal.company.industry}</div>
            )}
          </div>
        </div>

        {deal.contact && (
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <div className="text-sm text-gray-600">Contact</div>
              <Link
                href={`/contacts/${deal.contact.id}`}
                className="font-medium text-blue-600 hover:underline"
              >
                {deal.contact.name}
              </Link>
              {deal.contact.email && (
                <div className="text-sm text-gray-500">{deal.contact.email}</div>
              )}
            </div>
          </div>
        )}

        {deal.expectedCloseDate && (
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <div className="text-sm text-gray-600">Expected Close Date</div>
              <div className="font-medium text-gray-900">
                {formatDate(deal.expectedCloseDate)}
              </div>
            </div>
          </div>
        )}
      </div>

      {deal.notes && (
        <div>
          <div className="text-sm font-medium text-gray-600 mb-2">Notes</div>
          <p className="text-gray-700 whitespace-pre-wrap">{deal.notes}</p>
        </div>
      )}

      <div className="pt-4 border-t border-gray-200 text-xs text-gray-500">
        <div>Created: {formatDate(deal.createdAt)}</div>
        <div>Last updated: {formatDate(deal.updatedAt)}</div>
      </div>
    </div>
  );
}
