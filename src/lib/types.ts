export type OrderStatus =
  | 'PENDING'
  | 'PAYMENT_PROCESSING'
  | 'PAID'
  | 'FEE_CALCULATED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'REFUNDED';

export type AccountType =
  | 'ORDER_BALANCE'
  | 'ORDER_PENDING'
  | 'PAYMENT_RECEIVED'
  | 'FEES_OWED'
  | 'SELLER_PAYOUT';

export type EventType =
  | 'ORDER_CREATED'
  | 'PAYMENT_PROCESSING'
  | 'PAYMENT_CONFIRMED'
  | 'FEE_CALCULATED'
  | 'ORDER_SHIPPED'
  | 'ORDER_DELIVERED'
  | 'REFUND_INITIATED'
  | 'REFUND_COMPLETED'
  | 'SETTLEMENT_PROCESSED';

export interface Order {
  id: string;
  customerId: string;
  amount: string;
  paymentMethod: string;
  status: OrderStatus;
  paymentReceived: string;
  feeAmount: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface LedgerEntry {
  id: string;
  orderId: string;
  account: AccountType;
  debit: string | null;
  credit: string | null;
  description: string;
  eventId: string;
  timestamp: string;
}

export interface LedgerBalance {
  totalDebits: string;
  totalCredits: string;
  balanced: boolean;
}

export interface Settlement {
  id: string;
  settlementDate: string;
  idempotencyKey: string;
  totalAmount: string;
  totalFees: string;
  netPayout: string;
  orderCount: number;
  processedOrderIds: string[];
  status: 'PENDING' | 'COMPLETED';
  createdAt: string;
}

export interface EventLogEntry {
  id: string;
  aggregateId: string;
  eventType: EventType;
  payload: Record<string, unknown>;
  version: number;
  timestamp: string;
  idempotencyKey: string;
}

export interface CreateOrderInput {
  amount: string;
  customerId: string;
  paymentMethod: string;
}
