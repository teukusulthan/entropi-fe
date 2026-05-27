'use client';

import Link from 'next/link';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from '../ui/Table';
import { OrderStatusBadge } from './OrderStatusBadge';
import { Spinner } from '../ui/Spinner';
import { EmptyState } from '../ui/EmptyState';
import { formatCurrency, formatDate, truncateId } from '@/lib/utils';
import type { Order } from '@/lib/types';

interface OrderTableProps {
  orders: Order[] | null;
  loading: boolean;
  error: string | null;
  onCreateOrder: () => void;
}

export function OrderTable({
  orders,
  loading,
  error,
  onCreateOrder,
}: OrderTableProps) {
  if (loading && !orders) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 px-4">
        <p className="text-sm text-red-500">{error}</p>
        <p className="mt-1 text-xs text-slate-500">
          Make sure the API server is running.
        </p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <EmptyState
        title="No orders yet"
        description="Create your first order to get started."
        action={
          <button
            onClick={onCreateOrder}
            className="inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]"
          >
            Create an order
          </button>
        }
      />
    );
  }

  return (
    <Table>
      <TableHead>
        <tr>
          <TableHeader>Order ID</TableHeader>
          <TableHeader>Customer</TableHeader>
          <TableHeader align="right">Amount</TableHeader>
          <TableHeader align="right">Fee</TableHeader>
          <TableHeader>Status</TableHeader>
          <TableHeader>Date</TableHeader>
        </tr>
      </TableHead>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-mono text-slate-600">
              <Link
                href={`/orders/${order.id}`}
                className="inline-flex min-h-11 cursor-pointer items-center rounded-lg px-1 font-semibold text-[var(--accent-strong)] underline-offset-4 hover:text-[var(--accent)] hover:underline"
              >
                {truncateId(order.id)}
              </Link>
            </TableCell>
            <TableCell className="text-slate-900">
              {truncateId(order.customerId)}
            </TableCell>
            <TableCell align="right" className="font-mono font-medium text-slate-900">
              {formatCurrency(order.amount)}
            </TableCell>
            <TableCell align="right" className="font-mono text-slate-500">
              {parseFloat(order.feeAmount) > 0
                ? formatCurrency(order.feeAmount)
                : '-'}
            </TableCell>
            <TableCell>
              <OrderStatusBadge status={order.status} />
            </TableCell>
            <TableCell className="text-slate-500">
              {formatDate(order.createdAt)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
