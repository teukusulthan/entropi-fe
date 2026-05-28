import type {
  Order,
  LedgerEntry,
  LedgerBalance,
  Settlement,
  EventLogEntry,
  CreateOrderInput,
} from './types';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    let message = `API error ${res.status}`;
    try {
      const json = JSON.parse(body);
      message = json.error || json.message || message;
    } catch {
    }
    throw new ApiError(message, res.status);
  }

  return res.json() as Promise<T>;
}

export async function getOrders(): Promise<Order[]> {
  return request<Order[]>('/orders');
}

export async function getOrder(id: string): Promise<Order> {
  return request<Order>(`/orders/${id}`);
}

export async function createOrder(
  data: CreateOrderInput
): Promise<{ order: Order; event: EventLogEntry }> {
  return request<{ order: Order; event: EventLogEntry }>('/orders', {
    method: 'POST',
    body: JSON.stringify({
      ...data,
      idempotencyKey: crypto.randomUUID(),
    }),
  });
}

export async function payOrder(
  id: string,
  idempotencyKey: string
): Promise<{ order: Order; event: EventLogEntry }> {
  return request<{ order: Order; event: EventLogEntry }>(
    `/orders/${id}/pay`,
    {
      method: 'POST',
      body: JSON.stringify({ idempotencyKey }),
    }
  );
}

export async function calculateOrderFees(
  id: string,
  idempotencyKey: string
): Promise<{ order: Order; event: EventLogEntry }> {
  return request<{ order: Order; event: EventLogEntry }>(
    `/orders/${id}/fees`,
    {
      method: 'POST',
      body: JSON.stringify({ idempotencyKey }),
    }
  );
}

export async function shipOrder(
  id: string,
  idempotencyKey: string
): Promise<{ order: Order; event: EventLogEntry }> {
  return request<{ order: Order; event: EventLogEntry }>(
    `/orders/${id}/ship`,
    {
      method: 'POST',
      body: JSON.stringify({ idempotencyKey }),
    }
  );
}

export async function deliverOrder(
  id: string,
  idempotencyKey: string
): Promise<{ order: Order; event: EventLogEntry }> {
  return request<{ order: Order; event: EventLogEntry }>(
    `/orders/${id}/deliver`,
    {
      method: 'POST',
      body: JSON.stringify({ idempotencyKey }),
    }
  );
}

export async function refundOrder(
  id: string,
  idempotencyKey: string
): Promise<{ order: Order; event: EventLogEntry }> {
  return request<{ order: Order; event: EventLogEntry }>(
    `/orders/${id}/refund`,
    {
      method: 'POST',
      body: JSON.stringify({ idempotencyKey }),
    }
  );
}

export async function getOrderLedger(
  id: string
): Promise<{ entries: LedgerEntry[]; balance: LedgerBalance }> {
  return request<{ entries: LedgerEntry[]; balance: LedgerBalance }>(
    `/orders/${id}/ledger`
  );
}

export async function verifyLedger(id: string): Promise<LedgerBalance> {
  return request<LedgerBalance>(`/verify-ledger/${id}`);
}

export async function triggerSettlement(
  date: string,
  idempotencyKey: string
): Promise<{ settlement: Settlement; processedOrders: string[] }> {
  return request<{ settlement: Settlement; processedOrders: string[] }>('/settle', {
    method: 'POST',
    body: JSON.stringify({ date, idempotencyKey }),
  });
}
