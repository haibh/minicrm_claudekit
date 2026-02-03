import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { differenceInDays } from "date-fns";

interface Deal {
  id: string;
  name: string;
  value: number | { toNumber: () => number }; // Prisma Decimal or number
  expectedCloseDate: Date | null;
  company: { id: string; name: string } | null;
}

interface DealsClosingSoonWidgetProps {
  deals: Deal[];
}

export function DealsClosingSoonWidget({ deals }: DealsClosingSoonWidgetProps) {
  const getDaysUntilClose = (closeDate: Date | null) => {
    if (!closeDate) return 999;
    return differenceInDays(new Date(closeDate), new Date());
  };

  const getUrgencyColor = (days: number) => {
    if (days < 7) return "text-red-600 font-semibold";
    if (days < 14) return "text-orange-600 font-medium";
    return "text-gray-600";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Deals Closing Soon</CardTitle>
        <Button asChild variant="outline" size="sm">
          <Link href="/deals">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {deals.length === 0 ? (
          <p className="text-sm text-gray-500">
            No deals closing in the next 30 days
          </p>
        ) : (
          <div className="space-y-4">
            {deals.map((deal) => {
              const daysUntilClose = getDaysUntilClose(deal.expectedCloseDate);
              const urgencyColor = getUrgencyColor(daysUntilClose);

              return (
                <div
                  key={deal.id}
                  className="flex items-start justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/deals/${deal.id}`}
                      className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate block"
                    >
                      {deal.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(Number(deal.value))}
                      </span>
                      {deal.company && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span className="text-xs text-gray-500">
                            {deal.company.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <p className={`text-xs ${urgencyColor}`}>
                      {daysUntilClose === 0
                        ? "Today"
                        : daysUntilClose === 1
                          ? "Tomorrow"
                          : `${daysUntilClose}d`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
