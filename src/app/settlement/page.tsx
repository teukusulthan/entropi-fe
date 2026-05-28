'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSettlement } from '@/lib/hooks/useSettlement';
import { SettlementTrigger } from '@/components/settlement/SettlementTrigger';
import { SettlementCard } from '@/components/settlement/SettlementCard';
import { SettlementPreviewDialog } from '@/components/settlement/SettlementPreviewDialog';
import { SettlementHistory } from '@/components/settlement/SettlementHistory';
import { getOrders, getSettlements } from '@/lib/api';
import type { Order, Settlement } from '@/lib/types';

export default function SettlementPage() {
  const { data, loading, error, runSettlement } = useSettlement();

  const [previewOpen, setPreviewOpen]       = useState(false);
  const [previewOrders, setPreviewOrders]   = useState<Order[]>([]);
  const [pendingDate, setPendingDate]       = useState('');
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [history, setHistory]               = useState<Settlement[]>([]);

  useEffect(() => {
    getSettlements().then(setHistory).catch(() => {});
  }, []);

  // Refresh history after a new settlement completes
  useEffect(() => {
    if (data) getSettlements().then(setHistory).catch(() => {});
  }, [data]);

  async function handlePreview(date: string) {
    setLoadingPreview(true);
    setPendingDate(date);
    try {
      const allOrders = await getOrders();
      const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0);
      const dayEnd   = new Date(date); dayEnd.setHours(23, 59, 59, 999);
      setPreviewOrders(
        allOrders.filter(o =>
          o.status === 'DELIVERED' &&
          new Date(o.updatedAt) >= dayStart &&
          new Date(o.updatedAt) <= dayEnd
        )
      );
      setPreviewOpen(true);
    } finally {
      setLoadingPreview(false);
    }
  }

  async function handleConfirm() {
    await runSettlement(pendingDate);
    setPreviewOpen(false);
  }

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
        <SettlementTrigger loading={loadingPreview} error={error} onTrigger={handlePreview} />

        {data && (
          <SettlementCard
            settlement={data.settlement}
            processedOrders={data.processedOrders}
          />
        )}
      </div>

      <SettlementHistory settlements={history} />

      <SettlementPreviewDialog
        open={previewOpen}
        date={pendingDate}
        orders={previewOrders}
        settling={loading}
        onConfirm={handleConfirm}
        onCancel={() => setPreviewOpen(false)}
      />
    </div>
  );
}
