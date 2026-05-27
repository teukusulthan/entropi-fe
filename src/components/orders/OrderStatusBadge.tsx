import { Badge } from '../ui/Badge';
import { formatStatus } from '@/lib/utils';
import type { OrderStatus } from '@/lib/types';

const statusVariants: Record<
  OrderStatus,
  'default' | 'warning' | 'success' | 'info' | 'violet' | 'danger'
> = {
  PENDING: 'default',
  PAYMENT_PROCESSING: 'warning',
  PAID: 'success',
  FEE_CALCULATED: 'info',
  SHIPPED: 'violet',
  DELIVERED: 'success',
  REFUNDED: 'danger',
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return <Badge variant={statusVariants[status]}>{formatStatus(status)}</Badge>;
}
