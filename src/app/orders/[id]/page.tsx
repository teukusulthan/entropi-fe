'use client';

import Link from 'next/link';
import { useOrder } from '@/lib/hooks/useOrder';
import { useLedger } from '@/lib/hooks/useLedger';
import { OrderStatusCard } from '@/components/orders/OrderStatusCard';
import { LedgerTable } from '@/components/ledger/LedgerTable';
import { LedgerBalanceCard } from '@/components/ledger/LedgerBalance';

export default function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const {
    data: order,
    loading: orderLoading,
    error: orderError,
    refetch: refetchOrder,
  } = useOrder(id);
  const {
    data: ledger,
    loading: ledgerLoading,
    error: ledgerError,
  } = useLedger(id);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/" className="transition-colors hover:text-slate-900">
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-slate-900">Order Detail</span>
      </div>

      <OrderStatusCard
        order={order}
        loading={orderLoading}
        error={orderError}
        onRefetch={refetchOrder}
      />

      <LedgerTable
        entries={ledger?.entries ?? null}
        loading={ledgerLoading}
        error={ledgerError}
      />

      <LedgerBalanceCard balance={ledger?.balance ?? null} orderId={id} />
    </div>
  );
}
