'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table, TableHead, TableBody, TableRow, TableHeader, TableCell,
} from '../ui/Table';
import { OrderStatusBadge } from './OrderStatusBadge';
import { Spinner } from '../ui/Spinner';
import { EmptyState } from '../ui/EmptyState';
import { formatCurrency, formatDate, truncateId } from '@/lib/utils';
import type { Order, OrderStatus } from '@/lib/types';

/* ── constants ─────────────────────────────────────────────────────── */

const PAGE_SIZE = 10;

const ALL_STATUSES: OrderStatus[] = [
  'PENDING', 'PAYMENT_PROCESSING', 'PAID', 'FEE_CALCULATED',
  'SHIPPED', 'DELIVERED', 'REFUNDED',
];

/* ── helpers ────────────────────────────────────────────────────────── */

function fmtStatus(s: string) {
  return s.split('_').map(w => w[0] + w.slice(1).toLowerCase()).join(' ');
}

function fmtCustomer(id: string) {
  if (id.startsWith('cust-'))
    return id.slice(5).split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
  return id;
}

/* ── FilterSelect ───────────────────────────────────────────────────── */

interface FilterSelectProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}

function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = value !== 'all' && value !== '';
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div ref={ref} className="relative flex flex-col gap-1">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-medium transition-all duration-150 ${
          active
            ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)]'
            : 'border-[var(--border-strong)] bg-white/90 text-slate-600 hover:border-slate-300 hover:bg-white'
        }`}
      >
        <span className="max-w-[120px] truncate">{selected?.label ?? label}</span>
        <svg
          className={`h-3.5 w-3.5 shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-1.5 min-w-[160px] overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.10)]">
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`flex w-full items-center justify-between px-3.5 py-2.5 text-left text-xs transition-colors hover:bg-slate-50 ${
                value === opt.value
                  ? 'bg-[var(--accent-soft)] font-semibold text-[var(--accent-strong)]'
                  : 'text-slate-700'
              }`}
            >
              {opt.label}
              {value === opt.value && (
                <svg className="h-3.5 w-3.5 text-[var(--accent)]" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Pagination ─────────────────────────────────────────────────────── */

function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  if (total <= 1) return null;

  const pages: (number | '…')[] = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('…');
    for (let i = Math.max(2, page - 1); i <= Math.min(total - 1, page + 1); i++) pages.push(i);
    if (page < total - 2) pages.push('…');
    pages.push(total);
  }

  const btn = 'flex h-8 min-w-[2rem] items-center justify-center rounded-lg px-2 text-xs font-medium transition-all duration-150';

  return (
    <div className="flex items-center gap-1 px-5 py-4">
      <button
        onClick={() => onChange(page - 1)} disabled={page === 1}
        className={`${btn} border border-[var(--border)] bg-white text-slate-600 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40`}
      >
        ← Prev
      </button>
      <div className="flex items-center gap-1 px-1">
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="px-1 text-xs text-slate-400">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p as number)}
              className={`${btn} ${
                p === page
                  ? 'bg-[var(--accent)] text-white shadow-[0_2px_8px_rgba(15,118,110,0.30)]'
                  : 'border border-[var(--border)] bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {p}
            </button>
          )
        )}
      </div>
      <button
        onClick={() => onChange(page + 1)} disabled={page === total}
        className={`${btn} border border-[var(--border)] bg-white text-slate-600 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40`}
      >
        Next →
      </button>
    </div>
  );
}

/* ── OrderTable ─────────────────────────────────────────────────────── */

interface OrderTableProps {
  orders: Order[] | null;
  loading: boolean;
  error: string | null;
  onCreateOrder: () => void;
}

export function OrderTable({ orders, loading, error, onCreateOrder }: OrderTableProps) {
  const router = useRouter();

  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [customerFilter, setCustomerFilter] = useState('all');
  const [dateFrom, setDateFrom]         = useState('');
  const [dateTo, setDateTo]             = useState('');
  const [page, setPage]                 = useState(1);

  const uniqueCustomers = useMemo(() => {
    if (!orders) return [];
    return Array.from(new Set(orders.map(o => o.customerId))).sort();
  }, [orders]);

  const statusOptions = [
    { value: 'all', label: 'All statuses' },
    ...ALL_STATUSES.map(s => ({ value: s, label: fmtStatus(s) })),
  ];

  const customerOptions = [
    { value: 'all', label: 'All customers' },
    ...uniqueCustomers.map(id => ({ value: id, label: fmtCustomer(id) })),
  ];

  const filtered = useMemo(() => {
    if (!orders) return null;
    const q = search.trim().toLowerCase();
    return orders.filter(o => {
      if (q && !o.id.toLowerCase().includes(q) && !fmtCustomer(o.customerId).toLowerCase().includes(q) && !o.customerId.toLowerCase().includes(q)) return false;
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (customerFilter !== 'all' && o.customerId !== customerFilter) return false;
      const created = new Date(o.createdAt);
      if (dateFrom && created < new Date(dateFrom)) return false;
      if (dateTo && created > new Date(dateTo + 'T23:59:59.999Z')) return false;
      return true;
    });
  }, [orders, search, statusFilter, customerFilter, dateFrom, dateTo]);

  const totalPages = Math.ceil((filtered?.length ?? 0) / PAGE_SIZE);
  const paginated  = filtered?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const isFiltered = search !== '' || statusFilter !== 'all' || customerFilter !== 'all' || dateFrom !== '' || dateTo !== '';

  useEffect(() => { setPage(1); }, [search, statusFilter, customerFilter, dateFrom, dateTo]);

  function clearFilters() {
    setSearch(''); setStatusFilter('all'); setCustomerFilter('all');
    setDateFrom(''); setDateTo('');
  }

  /* ── loading / error / empty ── */

  if (loading && !orders) {
    return <div className="flex items-center justify-center py-12"><Spinner size="lg" /></div>;
  }

  if (error) {
    return (
      <div className="py-12 px-4 text-center">
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
          <button onClick={onCreateOrder} className="inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">
            Create an order
          </button>
        }
      />
    );
  }

  /* ── render ── */

  return (
    <div>
      {/* Search */}
      <div className="border-b border-[var(--border)] px-5 pt-4 pb-3">
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8.5" cy="8.5" r="5.5" /><path d="M15 15l3 3" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search by order ID or customer…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-[var(--border-strong)] bg-white/90 py-2 pl-9 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600">
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 3l10 10M13 3L3 13" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-2.5 border-b border-[var(--border)] px-5 py-3">
        <FilterSelect label="Status"   value={statusFilter}   options={statusOptions}   onChange={setStatusFilter} />
        <FilterSelect label="Customer" value={customerFilter} options={customerOptions} onChange={setCustomerFilter} />

        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500">From</span>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className={`h-9 rounded-lg border px-3 text-xs outline-none transition-all duration-150 focus:border-[var(--accent)] ${dateFrom ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)]' : 'border-[var(--border-strong)] bg-white/90 text-slate-600'}`}
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500">To</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className={`h-9 rounded-lg border px-3 text-xs outline-none transition-all duration-150 focus:border-[var(--accent)] ${dateTo ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)]' : 'border-[var(--border-strong)] bg-white/90 text-slate-600'}`}
          />
        </div>

        <div className="ml-auto flex items-end gap-2.5">
          {isFiltered && (
            <span className="text-xs text-slate-400">
              {filtered?.length ?? 0} of {orders.length}
            </span>
          )}
          {isFiltered && (
            <button onClick={clearFilters} className="flex h-9 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-3 text-xs font-medium text-slate-500 transition hover:border-red-300 hover:text-red-500">
              <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M2 2l8 8M10 2l-8 8" />
              </svg>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Empty filter result */}
      {paginated && paginated.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-slate-500">No orders match your search or filters.</p>
          <button onClick={clearFilters} className="mt-2 text-xs font-medium text-[var(--accent)] hover:underline">
            Clear all
          </button>
        </div>
      ) : (
        <>
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
              {(paginated ?? []).map((order) => (
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
                    {fmtCustomer(order.customerId)}
                  </TableCell>
                  <TableCell align="right" className="font-mono font-medium text-slate-900">
                    {formatCurrency(order.amount)}
                  </TableCell>
                  <TableCell align="right" className="font-mono text-slate-400 transition-colors duration-200 group-hover:text-slate-600">
                    {parseFloat(order.feeAmount) > 0 ? formatCurrency(order.feeAmount) : '-'}
                  </TableCell>
                  <TableCell><OrderStatusBadge status={order.status} /></TableCell>
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

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-[var(--border)]">
            <p className="px-5 py-4 text-xs text-slate-400">
              {filtered && filtered.length > 0
                ? `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} of ${filtered.length} orders`
                : `${orders.length} orders`}
            </p>
            <Pagination page={page} total={totalPages} onChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}
