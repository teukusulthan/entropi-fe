'use client';

import { useState } from 'react';
import { Badge } from '../ui/Badge';
import { SettlementCard } from './SettlementCard';
import { formatCurrency } from '@/lib/utils';
import type { Settlement } from '@/lib/types';

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
  });
}

interface SettlementHistoryProps {
  settlements: Settlement[];
}

export function SettlementHistory({ settlements }: SettlementHistoryProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (settlements.length === 0) {
    return (
      <div className="rounded-[28px] border border-[var(--border)] bg-white/60 px-7 py-8 text-center">
        <p className="text-sm text-slate-500">No settlements processed yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-slate-700">Settlement History</h2>
      <div className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-white">
        {settlements.map((s, i) => (
          <div key={s.id} className={i > 0 ? 'border-t border-[var(--border)]' : ''}>
            {/* Row */}
            <button
              type="button"
              onClick={() => setExpanded(expanded === s.id ? null : s.id)}
              className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition hover:bg-slate-50/80"
            >
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{fmtDate(s.settlementDate)}</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {s.orderCount} order{s.orderCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="hidden text-right sm:block">
                  <p className="text-xs text-slate-400">Net Payout</p>
                  <p className="font-mono text-sm font-semibold text-emerald-700">
                    {formatCurrency(s.netPayout)}
                  </p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-xs text-slate-400">Fees</p>
                  <p className="font-mono text-sm font-semibold text-red-500">
                    {formatCurrency(s.totalFees)}
                  </p>
                </div>
                <Badge variant={s.status === 'COMPLETED' ? 'success' : 'warning'}>
                  {s.status}
                </Badge>
                <svg
                  className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${expanded === s.id ? 'rotate-180' : ''}`}
                  viewBox="0 0 16 16" fill="none" stroke="currentColor"
                  strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="M4 6l4 4 4-4" />
                </svg>
              </div>
            </button>

            {/* Expanded detail */}
            {expanded === s.id && (
              <div className="border-t border-[var(--border)] px-4 pb-4 pt-2">
                <SettlementCard
                  settlement={s}
                  processedOrders={s.processedOrderIds ?? []}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
