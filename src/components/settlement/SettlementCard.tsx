'use client';

import { useRef } from 'react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatCurrency, subtractDecimalStrings } from '@/lib/utils';
import type { Settlement } from '@/lib/types';

interface SettlementCardProps {
  settlement: Settlement;
  processedOrders: string[];
}

function formatSettlementDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  });
}

function refId(id: string) {
  return 'ENT-' + id.replace(/-/g, '').slice(0, 10).toUpperCase();
}

function RevenueBar({ total, fees, net }: { total: string; fees: string; net: string }) {
  const totalNum = parseFloat(total);
  if (totalNum === 0) return null;
  const feePct  = Math.round((parseFloat(fees) / totalNum) * 100);
  const netPct  = 100 - feePct;
  return (
    <div className="mt-2 overflow-hidden rounded-full h-2 flex bg-slate-100">
      <div className="bg-emerald-400 transition-all duration-500" style={{ width: `${netPct}%` }} title={`Net payout ${netPct}%`} />
      <div className="bg-red-400 transition-all duration-500" style={{ width: `${feePct}%` }} title={`Fees ${feePct}%`} />
    </div>
  );
}

export function SettlementCard({ settlement, processedOrders }: SettlementCardProps) {
  const printRef = useRef<HTMLDivElement>(null);

  function handleExportPDF() {
    window.print();
  }

  const feeRate = parseFloat(settlement.totalAmount) > 0
    ? ((parseFloat(settlement.totalFees) / parseFloat(settlement.totalAmount)) * 100).toFixed(2)
    : '3.00';

  const avgOrderValue = settlement.orderCount > 0
    ? (parseFloat(settlement.totalAmount) / settlement.orderCount).toFixed(4)
    : '0.0000';

  return (
    <>
      {/* Print-only stylesheet */}
      <style>{`
        @page { margin: 0; }
        @media print {
          body * { visibility: hidden !important; }
          #settlement-report, #settlement-report * { visibility: visible !important; }
          #settlement-report { position: fixed; inset: 0; padding: 2rem; background: white; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div id="settlement-report" ref={printRef} className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-white shadow-sm">

        {/* Header */}
        <div className="border-b border-[var(--border)] bg-gradient-to-r from-slate-50 to-white px-7 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent)]">
                Entropi · Settlement Report
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                {formatSettlementDate(settlement.settlementDate)}
              </h2>
              <p className="mt-1 font-mono text-xs text-slate-400">
                Ref: {refId(settlement.id)}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant={settlement.status === 'COMPLETED' ? 'success' : 'warning'}>
                {settlement.status}
              </Badge>
              <button
                onClick={handleExportPDF}
                className="no-print flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12h10M8 2v8M5 7l3 3 3-3" />
                </svg>
                Export PDF
              </button>
            </div>
          </div>
        </div>

        {/* Stat grid */}
        <div className="grid grid-cols-2 gap-px border-b border-[var(--border)] bg-[var(--border)] sm:grid-cols-4">
          {[
            { label: 'Gross Revenue',    value: formatCurrency(settlement.totalAmount), color: 'text-slate-900' },
            { label: 'Platform Fees (3%)', value: formatCurrency(settlement.totalFees),  color: 'text-red-600' },
            { label: 'Net Payout',       value: formatCurrency(settlement.netPayout),   color: 'text-emerald-700 font-bold' },
            { label: 'Orders Settled',   value: String(settlement.orderCount),          color: 'text-slate-900' },
          ].map(stat => (
            <div key={stat.label} className="flex flex-col gap-1 bg-white px-6 py-5">
              <p className="text-xs font-medium text-slate-500">{stat.label}</p>
              <p className={`font-mono text-lg font-semibold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Breakdown */}
        <div className="border-b border-[var(--border)] px-7 py-5">
          <p className="text-sm font-semibold text-slate-900">Revenue Breakdown</p>
          <RevenueBar total={settlement.totalAmount} fees={settlement.totalFees} net={settlement.netPayout} />
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Net payout</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-400" /> Platform fees</span>
          </div>

          <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { label: 'Fee rate applied',   value: `${feeRate}%` },
              { label: 'Avg. order value',   value: formatCurrency(avgOrderValue) },
              { label: 'Total deducted',     value: formatCurrency(settlement.totalFees) },
            ].map(item => (
              <div key={item.label} className="rounded-xl border border-[var(--border)] bg-slate-50/60 px-4 py-3">
                <dt className="text-xs text-slate-500">{item.label}</dt>
                <dd className="mt-1 font-mono text-sm font-semibold text-slate-900">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Processed orders */}
        {processedOrders.length > 0 && (
          <div className="border-b border-[var(--border)] px-7 py-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">Processed Orders</p>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
                {processedOrders.length}
              </span>
            </div>
            <div className="mt-3 max-h-40 overflow-y-auto rounded-xl border border-[var(--border)] bg-slate-50/60">
              {processedOrders.map((id, i) => (
                <div key={id} className={`flex items-center gap-3 px-4 py-2.5 ${i > 0 ? 'border-t border-[var(--border)]' : ''}`}>
                  <span className="w-6 text-right font-mono text-xs text-slate-400">{i + 1}</span>
                  <span className="font-mono text-xs text-slate-700">{id}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col gap-1 px-7 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400">Generated {formatTimestamp(settlement.createdAt)}</p>
          <p className="text-xs text-slate-400">Settlement ID: <span className="font-mono">{settlement.id}</span></p>
        </div>
      </div>
    </>
  );
}
