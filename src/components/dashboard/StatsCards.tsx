import { Card, CardBody } from '../ui/Card';
import { formatCurrency } from '@/lib/utils';
import type { Order } from '@/lib/types';

interface StatsCardsProps {
  orders: Order[] | null;
}

export function StatsCards({ orders }: StatsCardsProps) {
  const totalOrders = orders?.length ?? 0;

  const totalRevenue = orders
    ? orders.reduce((sum, o) => sum + parseFloat(o.amount), 0)
    : 0;

  const totalFees = orders
    ? orders.reduce((sum, o) => sum + parseFloat(o.feeAmount), 0)
    : 0;

  const netPayout = totalRevenue - totalFees;

  const stats = [
    {
      label: 'Total Orders',
      value: String(totalOrders),
      tone: 'text-slate-900',
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(String(totalRevenue)),
      tone: 'text-slate-900',
    },
    {
      label: 'Total Fees',
      value: formatCurrency(String(totalFees)),
      tone: 'text-slate-700',
    },
    {
      label: 'Net Payout',
      value: formatCurrency(String(netPayout)),
      tone: 'text-[var(--accent-strong)]',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => (
        <Card
          key={stat.label}
          className={index === stats.length - 1 ? 'border-[rgba(15,118,110,0.18)] bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(233,247,245,0.9))]' : ''}
        >
          <CardBody className="p-6">
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <p className={`mt-2 text-3xl font-semibold tracking-tight ${stat.tone}`}>
              {stat.value}
            </p>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
