import { Card, CardHeader, CardBody } from '../ui/Card';
import { OrderStatusBadge } from '../orders/OrderStatusBadge';
import { formatCurrency, formatDate, truncateId } from '@/lib/utils';
import { EmptyState } from '../ui/EmptyState';
import type { Order } from '@/lib/types';

interface RecentActivityProps {
  orders: Order[] | null;
}

export function RecentActivity({ orders }: RecentActivityProps) {
  if (!orders || orders.length === 0) {
    return null;
  }

  const recent = [...orders]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 5);

  if (recent.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-base font-semibold text-slate-900">
            Recent Activity
          </h3>
        </CardHeader>
        <EmptyState
          title="No recent activity"
          description="Activity will appear here as orders are processed."
        />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-base font-semibold text-slate-900">
          Recent Activity
        </h3>
      </CardHeader>
      <ul className="divide-y divide-[var(--border)]">
        {recent.map((order) => (
          <li key={order.id} className="flex items-center justify-between gap-4 px-6 py-4 sm:px-7">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-slate-900">
                <span className="font-mono text-slate-500">
                  {truncateId(order.id)}
                </span>
                {' - '}
                {formatCurrency(order.amount)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {formatDate(order.updatedAt)}
              </p>
            </div>
            <OrderStatusBadge status={order.status} />
          </li>
        ))}
      </ul>
    </Card>
  );
}
