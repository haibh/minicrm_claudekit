import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DealStageBadge } from "@/components/deals/deal-stage-badge";
import { formatCurrency } from "@/lib/utils";
import { PipelineOverviewItem } from "@/lib/dashboard-queries";

interface PipelineOverviewWidgetProps {
  data: PipelineOverviewItem[];
}

export function PipelineOverviewWidget({ data }: PipelineOverviewWidgetProps) {
  const totalValue = data.reduce((sum, item) => sum + item.totalValue, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline Overview</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-gray-500">No open deals in pipeline</p>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-medium text-gray-600">
                      Stage
                    </th>
                    <th className="text-right py-2 font-medium text-gray-600">
                      Count
                    </th>
                    <th className="text-right py-2 font-medium text-gray-600">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item) => {
                    const percentage =
                      totalValue > 0 ? (item.totalValue / totalValue) * 100 : 0;
                    return (
                      <tr key={item.stage} className="border-b border-gray-100">
                        <td className="py-3">
                          <DealStageBadge stage={item.stage} />
                        </td>
                        <td className="text-right py-3 text-gray-900">
                          {item.count}
                        </td>
                        <td className="py-3">
                          <div className="space-y-1">
                            <div className="text-right font-medium text-gray-900">
                              {formatCurrency(item.totalValue)}
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-gray-600">Total Pipeline</span>
                <span className="text-gray-900">
                  {formatCurrency(totalValue)}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
