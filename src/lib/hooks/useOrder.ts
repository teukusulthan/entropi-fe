'use client';

import { useState, useEffect, useCallback } from 'react';
import { getOrder } from '../api';
import type { Order } from '../types';

interface UseOrderReturn {
  data: Order | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useOrder(id: string): UseOrderReturn {
  const [data, setData] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const order = await getOrder(id);
      setData(order);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch order');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
