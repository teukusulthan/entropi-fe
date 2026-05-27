import { Card, CardBody, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Settlement } from '@/lib/types';

interface SettlementCardProps {
  settlement: Settlement;
}

export function SettlementCard({ settlement }: SettlementCardProps) {
  const rows = [
    {
      label: 'Settlement Date',
      value: new Date(settlement.settlementDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    },
    {
      label: 'Orders Processed',
      value: String(settlement.orderCount ?? 0),
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(settlement.totalAmount),
      color: 'text-slate-900',
    },
    {
      label: 'Total Fees (3%)',
      value: formatCurrency(settlement.totalFees),
      color: 'text-red-600',
    },
    {
      label: 'Net Payout',
      value: formatCurrency(settlement.netPayout),
      color: 'text-emerald-700',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">
            Settlement Result
          </h3>
          <Badge
            variant={
              settlement.status === 'COMPLETED' ? 'success' : 'warning'
            }
          >
            {settlement.status}
          </Badge>
        </div>
      </CardHeader>
      <CardBody>
        <dl className="space-y-3">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-white/70 px-4 py-3"
            >
              <dt className="text-sm text-slate-500">{row.label}</dt>
              <dd
                className={`text-sm font-medium font-mono ${row.color || 'text-slate-900'}`}
              >
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-5 border-t border-[var(--border)] pt-4">
          <p className="text-xs text-slate-500">
            Created {formatDate(settlement.createdAt)}
          </p>
        </div>
      </CardBody>
    </Card>
  );
}
