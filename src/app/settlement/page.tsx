'use client';

import Link from 'next/link';
import { useSettlement } from '@/lib/hooks/useSettlement';
import { SettlementTrigger } from '@/components/settlement/SettlementTrigger';
import { SettlementCard } from '@/components/settlement/SettlementCard';

export default function SettlementPage() {
  const { data, loading, error, runSettlement } = useSettlement();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/" className="transition-colors hover:text-slate-900">Dashboard</Link>
        <span>/</span>
        <span className="text-slate-900">Settlement</span>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">Settlement</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Settlement workspace</h1>
        <p className="text-sm text-slate-500">Close the day and generate a formal payout report for all delivered orders.</p>
      </div>

      <div className="space-y-6">
        <SettlementTrigger loading={loading} error={error} onTrigger={runSettlement} />
        {data && (
          <SettlementCard
            settlement={data.settlement}
            processedOrders={data.processedOrders}
          />
        )}
      </div>
    </div>
  );
}
