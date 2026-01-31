import { Building2, Users, Handshake, DollarSign } from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { formatCurrency } from "@/lib/utils";

interface MetricsRowProps {
  companies: number;
  contacts: number;
  openDeals: number;
  pipelineValue: number;
}

export function MetricsRow({
  companies,
  contacts,
  openDeals,
  pipelineValue,
}: MetricsRowProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        icon={Building2}
        label="Total Companies"
        value={companies}
        href="/companies"
      />
      <MetricCard
        icon={Users}
        label="Total Contacts"
        value={contacts}
        href="/contacts"
      />
      <MetricCard
        icon={Handshake}
        label="Open Deals"
        value={openDeals}
        href="/deals"
      />
      <MetricCard
        icon={DollarSign}
        label="Pipeline Value"
        value={formatCurrency(pipelineValue)}
        href="/deals"
      />
    </div>
  );
}
