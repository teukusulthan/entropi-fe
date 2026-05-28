import { Card, CardHeader } from '../ui/Card';
import { OrderStatusBadge } from '../orders/OrderStatusBadge';
import { timeAgo, formatCurrency } from '@/lib/utils';
import type { Order } from '@/lib/types';

interface RecentActivityProps {
  orders: Order[] | null;
}

export function RecentActivity({ orders }: RecentActivityProps) {
  if (!orders || orders.length === 0) return null;

  const recent = [...orders]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 8);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Activity</h3>
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
        </div>
      </CardHeader>
      <ul className="divide-y divide-[var(--border)]">
        {recent.map((order) => (
          <li key={order.id} className="px-5 py-3">
            <OrderStatusBadge status={order.status} />
            <div className="mt-1.5 flex items-center justify-between gap-2">
              <span className="pl-1 font-mono text-xs font-semibold text-slate-700">
                {formatCurrency(order.amount)}
              </span>
              <span className="shrink-0 text-xs text-slate-400">
                {timeAgo(order.updatedAt)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
