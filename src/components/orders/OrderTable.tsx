'use client';

import { useMemo, useState } from 'react';
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
import type { Order, OrderStatus } from '@/lib/types';

interface OrderTableProps {
  orders: Order[] | null;
  loading: boolean;
  error: string | null;
  onCreateOrder: () => void;
}

const ALL_STATUSES: OrderStatus[] = [
  'PENDING', 'PAYMENT_PROCESSING', 'PAID', 'FEE_CALCULATED',
  'SHIPPED', 'DELIVERED', 'REFUNDED',
];

function formatStatusLabel(s: string) {
  return s.split('_').map(w => w[0] + w.slice(1).toLowerCase()).join(' ');
}

function formatCustomerLabel(id: string) {
  if (id.startsWith('cust-')) {
    return id.slice(5).split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
  }
  return id;
}

export function OrderTable({ orders, loading, error, onCreateOrder }: OrderTableProps) {
  const router = useRouter();

  const [statusFilter, setStatusFilter]   = useState('all');
  const [customerFilter, setCustomerFilter] = useState('all');
  const [dateFrom, setDateFrom]           = useState('');
  const [dateTo, setDateTo]               = useState('');

  const uniqueCustomers = useMemo(() => {
    if (!orders) return [];
    return Array.from(new Set(orders.map(o => o.customerId))).sort();
  }, [orders]);

  const filtered = useMemo(() => {
    if (!orders) return null;
    return orders.filter(o => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (customerFilter !== 'all' && o.customerId !== customerFilter) return false;
      const created = new Date(o.createdAt);
      if (dateFrom && created < new Date(dateFrom)) return false;
      if (dateTo && created > new Date(dateTo + 'T23:59:59.999Z')) return false;
      return true;
    });
  }, [orders, statusFilter, customerFilter, dateFrom, dateTo]);

  const isFiltered = statusFilter !== 'all' || customerFilter !== 'all' || dateFrom !== '' || dateTo !== '';

  function clearFilters() {
    setStatusFilter('all');
    setCustomerFilter('all');
    setDateFrom('');
    setDateTo('');
  }

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
        <p className="mt-1 text-xs text-slate-500">Make sure the API server is running.</p>
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
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap items-end gap-3 border-b border-[var(--border)] px-5 py-4">
        {/* Status */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Status</label>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="h-9 appearance-none rounded-lg border border-[var(--border-strong)] bg-white/90 pl-3 pr-8 text-xs text-slate-700 outline-none transition focus:border-[var(--accent)]"
            >
              <option value="all">All statuses</option>
              {ALL_STATUSES.map(s => (
                <option key={s} value={s}>{formatStatusLabel(s)}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-slate-400">
              <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6l4 4 4-4" />
              </svg>
            </span>
          </div>
        </div>

        {/* Customer */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Customer</label>
          <div className="relative">
            <select
              value={customerFilter}
              onChange={e => setCustomerFilter(e.target.value)}
              className="h-9 appearance-none rounded-lg border border-[var(--border-strong)] bg-white/90 pl-3 pr-8 text-xs text-slate-700 outline-none transition focus:border-[var(--accent)]"
            >
              <option value="all">All customers</option>
              {uniqueCustomers.map(id => (
                <option key={id} value={id}>{formatCustomerLabel(id)}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-slate-400">
              <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6l4 4 4-4" />
              </svg>
            </span>
          </div>
        </div>

        {/* Date from */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="h-9 rounded-lg border border-[var(--border-strong)] bg-white/90 px-3 text-xs text-slate-700 outline-none transition focus:border-[var(--accent)]"
          />
        </div>

        {/* Date to */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="h-9 rounded-lg border border-[var(--border-strong)] bg-white/90 px-3 text-xs text-slate-700 outline-none transition focus:border-[var(--accent)]"
          />
        </div>

        {/* Clear + result count */}
        <div className="ml-auto flex items-end gap-3">
          {isFiltered && (
            <>
              <span className="text-xs text-slate-400">
                {filtered?.length ?? 0} of {orders.length}
              </span>
              <button
                onClick={clearFilters}
                className="flex h-9 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-3 text-xs font-medium text-slate-500 transition hover:border-red-300 hover:text-red-500"
              >
                <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M2 2l8 8M10 2l-8 8" />
                </svg>
                Clear
              </button>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      {filtered && filtered.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-slate-500">No orders match the current filters.</p>
          <button onClick={clearFilters} className="mt-2 text-xs font-medium text-[var(--accent)] hover:underline">
            Clear filters
          </button>
        </div>
      ) : (
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
            {(filtered ?? orders).map((order) => (
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
                  {formatCustomerLabel(order.customerId)}
                </TableCell>
                <TableCell align="right" className="font-mono font-medium text-slate-900">
                  {formatCurrency(order.amount)}
                </TableCell>
                <TableCell align="right" className="font-mono text-slate-400 transition-colors duration-200 group-hover:text-slate-600">
                  {parseFloat(order.feeAmount) > 0 ? formatCurrency(order.feeAmount) : '-'}
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
                    <svg className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 6h8M6 2l4 4-4 4" />
                    </svg>
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
