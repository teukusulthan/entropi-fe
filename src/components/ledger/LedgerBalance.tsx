import { Card, CardBody } from '../ui/Card';
import { formatCurrency } from '@/lib/utils';
import type { LedgerBalance as LedgerBalanceType } from '@/lib/types';

interface LedgerBalanceProps {
  balance: LedgerBalanceType | null;
}

export function LedgerBalanceCard({ balance }: LedgerBalanceProps) {
  if (!balance) return null;

  return (
    <Card>
      <CardBody>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--border)] bg-white/70 px-4 py-4">
              <p className="text-sm text-slate-500">Total Debits</p>
              <p className="mt-2 text-base font-semibold font-mono text-slate-900">
                {formatCurrency(balance.totalDebits)}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-white/70 px-4 py-4">
              <p className="text-sm text-slate-500">Total Credits</p>
              <p className="mt-2 text-base font-semibold font-mono text-slate-900">
                {formatCurrency(balance.totalCredits)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
            {balance.balanced ? (
              <>
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-medium text-emerald-700">
                  Balanced
                </span>
              </>
            ) : (
              <>
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-sm font-medium text-red-600">
                  Unbalanced
                </span>
              </>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
