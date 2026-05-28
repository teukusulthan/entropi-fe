import { Card, CardHeader } from '../ui/Card';
import { OrderStatusBadge } from '../orders/OrderStatusBadge';
import { timeAgo, truncateId } from '@/lib/utils';
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
          <li key={order.id} className="flex items-center justify-between gap-3 px-5 py-3">
            <div className="min-w-0">
              <OrderStatusBadge status={order.status} />
              <p className="mt-1.5 font-mono text-xs text-slate-400">
                {truncateId(order.id)}
              </p>
            </div>
            <span className="shrink-0 text-xs text-slate-400">
              {timeAgo(order.updatedAt)}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
