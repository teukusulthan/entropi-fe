'use client';

import { useState } from 'react';
import { Card, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { formatCurrency } from '@/lib/utils';
import { verifyLedger } from '@/lib/api';
import { Skeleton } from '../ui/Skeleton';
import type { LedgerBalance as LedgerBalanceType } from '@/lib/types';

interface LedgerBalanceProps {
  balance: LedgerBalanceType | null;
  orderId: string;
}

export function LedgerBalanceCard({ balance, orderId }: LedgerBalanceProps) {
  const { showToast } = useToast();
  const [verifying, setVerifying] = useState(false);
  const [verifiedBalance, setVerifiedBalance] = useState<LedgerBalanceType | null>(null);

  const displayed = verifiedBalance ?? balance;

  async function handleVerify() {
    setVerifying(true);
    try {
      const result = await verifyLedger(orderId);
      setVerifiedBalance(result);
      showToast({
        variant: result.balanced ? 'success' : 'error',
        title: result.balanced ? 'Ledger balanced' : 'Ledger imbalanced',
        description: result.balanced
          ? `Debits and credits both equal ${formatCurrency(result.totalDebits)}`
          : `Debits ${formatCurrency(result.totalDebits)} ≠ credits ${formatCurrency(result.totalCredits)}`,
      });
    } catch (err) {
      showToast({
        variant: 'error',
        title: 'Verification failed',
        description: err instanceof Error ? err.message : 'Could not reach verify endpoint',
      });
    } finally {
      setVerifying(false);
    }
  }

  if (!displayed) return null;

  return (
    <Card>
      <CardBody>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--border)] bg-white/70 px-4 py-4">
              <p className="text-sm text-slate-500">Total Debits</p>
              <p className="mt-2 text-base font-semibold font-mono text-slate-900">
                {formatCurrency(displayed.totalDebits)}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-white/70 px-4 py-4">
              <p className="text-sm text-slate-500">Total Credits</p>
              <p className="mt-2 text-base font-semibold font-mono text-slate-900">
                {formatCurrency(displayed.totalCredits)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
              {displayed.balanced ? (
                <>
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-sm font-medium text-emerald-700">
                    {verifiedBalance ? 'Verified balanced' : 'Balanced'}
                  </span>
                </>
              ) : (
                <>
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-sm font-medium text-red-600">
                    {verifiedBalance ? 'Verified imbalanced' : 'Unbalanced'}
                  </span>
                </>
              )}
            </div>
            <Button variant="secondary" onClick={handleVerify} loading={verifying}>
              Verify Ledger
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
