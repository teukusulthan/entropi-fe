'use client';

import { useState } from 'react';
import { Card, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { useToast } from '../ui/Toast';
import { OrderStatusBadge } from './OrderStatusBadge';
import { formatCurrency, formatDate, truncateId, generateIdempotencyKey } from '@/lib/utils';
import {
  calculateOrderFees,
  deliverOrder,
  payOrder,
  refundOrder,
  shipOrder,
} from '@/lib/api';
import type { Order } from '@/lib/types';

interface OrderStatusCardProps {
  order: Order | null;
  loading: boolean;
  error: string | null;
  onRefetch: () => void;
}

export function OrderStatusCard({
  order,
  loading,
  error,
  onRefetch,
}: OrderStatusCardProps) {
  const { showToast } = useToast();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function runOrderAction(
    action: string,
    request: (id: string, idempotencyKey: string) => Promise<unknown>,
    successTitle: string,
    successDescription: string,
    failureTitle: string
  ) {
    if (!order) return;
    setActionLoading(action);
    setActionError(null);
    try {
      const key = generateIdempotencyKey();
      await request(order.id, key);
      onRefetch();
      showToast({
        title: successTitle,
        description: successDescription,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : `Failed to ${action}`;
      setActionError(message);
      showToast({
        variant: 'error',
        title: failureTitle,
        description: message,
      });
    } finally {
      setActionLoading(null);
    }
  }

  if (loading && !order) {
    return (
      <Card>
        <CardBody>
          <div className="flex items-center justify-center py-8">
            <Spinner size="lg" />
          </div>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardBody>
          <p className="text-sm text-red-500">{error}</p>
        </CardBody>
      </Card>
    );
  }

  if (!order) return null;

  const netAmount = parseFloat(order.amount) - parseFloat(order.feeAmount);

  const details = [
    { label: 'Amount', value: formatCurrency(order.amount), color: 'text-emerald-700' },
    {
      label: 'Payment Received',
      value: formatCurrency(order.paymentReceived),
      color: parseFloat(order.paymentReceived) > 0 ? 'text-emerald-700' : 'text-slate-900',
    },
    {
      label: 'Fee (3%)',
      value: parseFloat(order.feeAmount) > 0 ? formatCurrency(order.feeAmount) : '-',
      color: parseFloat(order.feeAmount) > 0 ? 'text-red-600' : 'text-slate-500',
    },
    {
      label: 'Net Amount',
      value: formatCurrency(String(netAmount)),
      color: 'text-slate-900',
    },
    { label: 'Payment Method', value: order.paymentMethod, color: 'text-slate-900' },
    { label: 'Created', value: formatDate(order.createdAt), color: 'text-slate-900' },
  ];

  return (
    <Card>
      <div className="flex flex-col gap-4 border-b border-[var(--border)] px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-semibold text-slate-900">
            Order #{truncateId(order.id)}
          </h2>
          <OrderStatusBadge status={order.status} />
        </div>
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Version {order.version}
        </span>
      </div>
      <CardBody>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {details.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-[var(--border)] bg-white/70 px-4 py-4"
            >
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className={`mt-2 text-base font-semibold ${item.color}`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {actionError && (
          <p className="mt-4 text-sm font-medium text-red-700" role="alert">
            {actionError}
          </p>
        )}

        {order.status !== 'DELIVERED' && order.status !== 'REFUNDED' && (
          <div className="mt-6 flex flex-wrap gap-3 border-t border-[var(--border)] pt-5">
            {order.status === 'PENDING' && (
              <Button
                onClick={() =>
                  runOrderAction(
                    'payment',
                    payOrder,
                    'Payment processed',
                    `Order ${truncateId(order.id)} moved to payment confirmed.`,
                    'Payment failed'
                  )
                }
                loading={actionLoading === 'payment'}
              >
                Process Payment
              </Button>
            )}
            {order.status === 'PAID' && (
              <Button
                onClick={() =>
                  runOrderAction(
                    'fees',
                    calculateOrderFees,
                    'Fees calculated',
                    `Order ${truncateId(order.id)} now has a 3% fee entry.`,
                    'Fee calculation failed'
                  )
                }
                loading={actionLoading === 'fees'}
              >
                Calculate Fees
              </Button>
            )}
            {order.status === 'FEE_CALCULATED' && (
              <Button
                onClick={() =>
                  runOrderAction(
                    'ship',
                    shipOrder,
                    'Order shipped',
                    `Order ${truncateId(order.id)} was marked as shipped.`,
                    'Shipping update failed'
                  )
                }
                loading={actionLoading === 'ship'}
              >
                Mark Shipped
              </Button>
            )}
            {order.status === 'SHIPPED' && (
              <Button
                onClick={() =>
                  runOrderAction(
                    'deliver',
                    deliverOrder,
                    'Order delivered',
                    `Order ${truncateId(order.id)} was marked as delivered.`,
                    'Delivery update failed'
                  )
                }
                loading={actionLoading === 'deliver'}
              >
                Mark Delivered
              </Button>
            )}
            {(order.status === 'PAID' || order.status === 'FEE_CALCULATED') && (
              <Button
                variant="secondary"
                onClick={() =>
                  runOrderAction(
                    'refund',
                    refundOrder,
                    'Order refunded',
                    `Order ${truncateId(order.id)} was refunded.`,
                    'Refund failed'
                  )
                }
                loading={actionLoading === 'refund'}
              >
                Refund
              </Button>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
