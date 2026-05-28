'use client';

import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { formatCurrency, truncateId, sumDecimalStrings, subtractDecimalStrings } from '@/lib/utils';
import type { Order } from '@/lib/types';

function fmtCustomer(id: string) {
  if (id.startsWith('cust-'))
    return id.slice(5).split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
  return id;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

interface SettlementPreviewDialogProps {
  open: boolean;
  date: string;
  orders: Order[];
  settling: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SettlementPreviewDialog({
  open, date, orders, settling, onConfirm, onCancel,
}: SettlementPreviewDialogProps) {
  const totalAmount  = sumDecimalStrings(orders.map(o => o.paymentReceived));
  const totalFees    = sumDecimalStrings(orders.map(o => o.feeAmount));
  const netPayout    = subtractDecimalStrings(totalAmount, totalFees);
  const hasOrders    = orders.length > 0;

  return (
    <Modal open={open} onClose={onCancel} title="Settlement Preview" size="lg">
      <div className="space-y-5">

        {/* Date + count */}
        <div className="rounded-xl border border-[var(--border)] bg-slate-50/60 px-4 py-3">
          <p className="text-xs font-medium text-slate-500">Settlement date</p>
          <p className="mt-0.5 text-sm font-semibold text-slate-900">{fmtDate(date)}</p>
          <p className="mt-1 text-xs text-slate-500">
            {hasOrders
              ? <><span className="font-semibold text-slate-700">{orders.length}</span> delivered order{orders.length !== 1 ? 's' : ''} eligible for settlement</>
              : 'No delivered orders found for this date.'}
          </p>
        </div>

        {/* Order list */}
        {hasOrders && (
          <div className="overflow-hidden rounded-xl border border-[var(--border)]">
            <div className="max-h-64 overflow-y-auto">
              <table className="min-w-full divide-y divide-[var(--border)]">
                <thead className="sticky top-0 bg-slate-50/95">
                  <tr>
                    {['Order ID', 'Customer', 'Payment', 'Fee (3%)', 'Net Payout'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] bg-white">
                  {orders.map((order, i) => {
                    const net = subtractDecimalStrings(order.paymentReceived, order.feeAmount);
                    return (
                      <tr key={order.id} className={i % 2 === 1 ? 'bg-slate-50/40' : ''}>
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-700">
                          {truncateId(order.id)}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-700">
                          {fmtCustomer(order.customerId)}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-900">
                          {formatCurrency(order.paymentReceived)}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-red-500">
                          −{formatCurrency(order.feeAmount)}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-emerald-700">
                          {formatCurrency(net)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Totals row */}
            <div className="grid grid-cols-3 divide-x divide-[var(--border)] border-t border-[var(--border)] bg-slate-50">
              <div className="px-4 py-3">
                <p className="text-xs text-slate-500">Total payment</p>
                <p className="mt-0.5 font-mono text-sm font-semibold text-slate-900">{formatCurrency(totalAmount)}</p>
              </div>
              <div className="px-4 py-3">
                <p className="text-xs text-slate-500">Total fees</p>
                <p className="mt-0.5 font-mono text-sm font-semibold text-red-500">−{formatCurrency(totalFees)}</p>
              </div>
              <div className="px-4 py-3">
                <p className="text-xs text-slate-500">Net payout</p>
                <p className="mt-0.5 font-mono text-sm font-semibold text-emerald-700">{formatCurrency(netPayout)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t border-[var(--border)] pt-4">
          <Button variant="secondary" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            loading={settling}
            disabled={!hasOrders}
          >
            {hasOrders ? `Settle ${orders.length} order${orders.length !== 1 ? 's' : ''}` : 'No orders to settle'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
