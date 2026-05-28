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
import { formatCurrency, formatDate } from '@/lib/utils';
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
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
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

  const SCALE = 10000;
  let runningBalanceScaled = 0;
  const entriesWithBalance = entries.map((entry) => {
    const debit = entry.debit ? Math.round(parseFloat(entry.debit) * SCALE) : 0;
    const credit = entry.credit ? Math.round(parseFloat(entry.credit) * SCALE) : 0;
    runningBalanceScaled += debit - credit;
    return { ...entry, runningBalance: runningBalanceScaled / SCALE };
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
                  entry.runningBalance >= 0
                    ? 'text-emerald-700'
                    : 'text-red-600'
                }`}
              >
                {formatCurrency(String(entry.runningBalance))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
