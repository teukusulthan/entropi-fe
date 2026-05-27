'use client';

import { useState, useEffect, useCallback } from 'react';
import { getOrders } from '../api';
import type { Order } from '../types';

interface UseOrdersReturn {
  data: Order[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useOrders(): UseOrdersReturn {
  const [data, setData] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const orders = await getOrders();
      setData(orders);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
