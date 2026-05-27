'use client';

import { useState } from 'react';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface SettlementTriggerProps {
  loading: boolean;
  error: string | null;
  onTrigger: (date: string) => void;
}

export function SettlementTrigger({
  loading,
  error,
  onTrigger,
}: SettlementTriggerProps) {
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (date) {
      onTrigger(date);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-slate-900">
            Run Settlement
          </h3>
          <p className="text-sm text-slate-500">
            Close the day with a controlled payout summary.
          </p>
        </div>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="w-full sm:max-w-xs">
            <Input
              id="settlementDate"
              label="Settlement Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <Button type="submit" loading={loading}>
            Run Settlement
          </Button>
        </form>
        {error && (
          <p className="mt-3 text-sm font-medium text-red-700" role="alert">
            {error}
          </p>
        )}
      </CardBody>
    </Card>
  );
}
