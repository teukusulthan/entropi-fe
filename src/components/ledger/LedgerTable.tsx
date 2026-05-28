'use client';

import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from '../ui/Table';
import { Spinner } from '../ui/Spinner';
import { EmptyState } from '../ui/EmptyState';
import { Card, CardHeader } from '../ui/Card';
import {
  decimalStringToScaledBigInt,
  formatCurrency,
  formatDate,
  scaledBigIntToDecimalString,
} from '@/lib/utils';
import { Skeleton } from '../ui/Skeleton';
import type { LedgerEntry } from '@/lib/types';

interface LedgerTableProps {
  entries: LedgerEntry[] | null;
  loading: boolean;
  error: string | null;
}

export function LedgerTable({ entries, loading, error }: LedgerTableProps) {
  if (loading && !entries) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-16" />
          </div>
        </CardHeader>
        <div className="divide-y divide-[var(--border)]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="grid grid-cols-6 gap-4 px-5 py-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16 ml-auto" />
              <Skeleton className="h-3 w-16 ml-auto" />
              <Skeleton className="h-3 w-32 col-span-1" />
              <Skeleton className="h-3 w-14 ml-auto" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="px-6 py-8 text-center">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      </Card>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <Card>
      <EmptyState
        title="No ledger entries"
        description="Ledger entries will appear as the order progresses."
      />
      </Card>
    );
  }

  let runningBalanceScaled = BigInt(0);
  const entriesWithBalance = entries.map((entry) => {
    const debit = decimalStringToScaledBigInt(entry.debit);
    const credit = decimalStringToScaledBigInt(entry.credit);
    runningBalanceScaled += debit - credit;
    return { ...entry, runningBalance: scaledBigIntToDecimalString(runningBalanceScaled) };
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">
            Ledger Audit Trail
          </h3>
          <span className="text-sm text-slate-500">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>
      </CardHeader>
      <Table>
        <TableHead>
          <tr>
            <TableHeader>Timestamp</TableHeader>
            <TableHeader>Account</TableHeader>
            <TableHeader align="right">Debit</TableHeader>
            <TableHeader align="right">Credit</TableHeader>
            <TableHeader>Description</TableHeader>
            <TableHeader align="right">Balance</TableHeader>
          </tr>
        </TableHead>
        <TableBody>
          {entriesWithBalance.map((entry, idx) => (
            <TableRow
              key={entry.id}
              className={idx % 2 === 1 ? 'bg-slate-50/40' : ''}
            >
              <TableCell className="text-slate-500 whitespace-nowrap">
                {formatDate(entry.timestamp)}
              </TableCell>
              <TableCell className="font-mono text-xs text-slate-700">
                {entry.account}
              </TableCell>
              <TableCell align="right" className="font-mono text-slate-900">
                {entry.debit ? formatCurrency(entry.debit) : '-'}
              </TableCell>
              <TableCell align="right" className="font-mono text-slate-900">
                {entry.credit ? formatCurrency(entry.credit) : '-'}
              </TableCell>
              <TableCell className="text-slate-600 max-w-xs truncate">
                {entry.description}
              </TableCell>
              <TableCell
                align="right"
                className={`font-mono font-medium ${
                  decimalStringToScaledBigInt(entry.runningBalance) >= BigInt(0)
                    ? 'text-emerald-700'
                    : 'text-red-600'
                }`}
              >
                {formatCurrency(entry.runningBalance)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
