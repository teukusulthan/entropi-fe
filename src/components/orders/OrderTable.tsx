'use client';

import { useRouter } from 'next/navigation';
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
  const router = useRouter();

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
          <TableHeader />
        </tr>
      </TableHead>
      <TableBody>
        {orders.map((order) => (
          <TableRow
            key={order.id}
            className="group cursor-pointer transition-all duration-200 ease-in-out hover:bg-white hover:shadow-[0_2px_12px_rgba(15,23,42,0.06)]"
            onClick={() => router.push(`/orders/${order.id}`)}
          >
            <TableCell className="relative font-mono text-sm font-semibold text-slate-700">
              <span className="absolute inset-y-0 left-0 w-0.5 origin-center scale-y-0 rounded-full bg-[var(--accent)] transition-transform duration-200 group-hover:scale-y-100" />
              {truncateId(order.id)}
            </TableCell>
            <TableCell className="text-slate-600 transition-colors duration-200 group-hover:text-slate-900">
              {truncateId(order.customerId)}
            </TableCell>
            <TableCell align="right" className="font-mono font-medium text-slate-900">
              {formatCurrency(order.amount)}
            </TableCell>
            <TableCell align="right" className="font-mono text-slate-400 transition-colors duration-200 group-hover:text-slate-600">
              {parseFloat(order.feeAmount) > 0
                ? formatCurrency(order.feeAmount)
                : '-'}
            </TableCell>
            <TableCell>
              <OrderStatusBadge status={order.status} />
            </TableCell>
            <TableCell className="text-slate-400 transition-colors duration-200 group-hover:text-slate-500">
              {formatDate(order.createdAt)}
            </TableCell>
            <TableCell align="right">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 transition-all duration-200 group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white group-hover:shadow-[0_4px_12px_rgba(15,118,110,0.25)]">
                View
                <svg className="h-3 w-3 translate-x-0 transition-transform duration-200 group-hover:translate-x-0.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 6h8M6 2l4 4-4 4" />
                </svg>
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
