'use client';

import { useState, useCallback } from 'react';
import { triggerSettlement } from '../api';
import type { Settlement } from '../types';
import { generateIdempotencyKey } from '../utils';
import { useToast } from '@/components/ui/Toast';

interface UseSettlementReturn {
  data: Settlement | null;
  loading: boolean;
  error: string | null;
  runSettlement: (date: string) => Promise<void>;
}

export function useSettlement(): UseSettlementReturn {
  const { showToast } = useToast();
  const [data, setData] = useState<Settlement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSettlement = useCallback(async (date: string) => {
    setLoading(true);
    setError(null);
    try {
      const key = generateIdempotencyKey();
      const settlement = await triggerSettlement(date, key);
      setData(settlement);
      showToast({
        title: 'Settlement completed',
        description: `Settlement for ${date} was processed successfully.`,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to process settlement';
      setError(message);
      showToast({
        variant: 'error',
        title: 'Settlement failed',
        description: message,
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  return { data, loading, error, runSettlement };
}
