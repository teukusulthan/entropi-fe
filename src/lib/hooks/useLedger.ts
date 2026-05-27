'use client';

import { useState, useEffect, useCallback } from 'react';
import { getOrderLedger } from '../api';
import type { LedgerEntry, LedgerBalance } from '../types';

interface UseLedgerReturn {
  data: { entries: LedgerEntry[]; balance: LedgerBalance } | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useLedger(orderId: string): UseLedgerReturn {
  const [data, setData] = useState<{
    entries: LedgerEntry[];
    balance: LedgerBalance;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const ledger = await getOrderLedger(orderId);
      setData(ledger);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch ledger'
      );
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
