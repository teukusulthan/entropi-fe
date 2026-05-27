'use client';

import { useState } from 'react';
import { useOrders } from '@/lib/hooks/useOrders';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { OrderTable } from '@/components/orders/OrderTable';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { CreateOrderModal } from '@/components/orders/CreateOrderModal';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  const { data: orders, loading, error, refetch } = useOrders();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-[28px] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(235,247,245,0.92))] px-6 py-6 shadow-[0_20px_45px_rgba(15,23,42,0.05)] sm:px-8 sm:py-7 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent)]">
            Overview
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            Seller operations at a glance
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Track order flow, payout impact, and recent activity from one clean workspace.
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)} size="sm">
          New Order
        </Button>
      </div>

      <StatsCards orders={orders} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,0.9fr)]">
        <div className="min-w-0">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">
                  Orders
                </h3>
                {orders && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {orders.length} {orders.length === 1 ? 'order' : 'orders'}
                  </span>
                )}
              </div>
            </CardHeader>
            <OrderTable
              orders={orders}
              loading={loading}
              error={error}
              onCreateOrder={() => setCreateModalOpen(true)}
            />
          </Card>
        </div>
        <div className="min-w-0">
          <RecentActivity orders={orders} />
        </div>
      </div>

      <CreateOrderModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={refetch}
      />
    </div>
  );
}
