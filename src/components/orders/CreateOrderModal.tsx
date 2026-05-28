'use client';

import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { createOrder, payOrder, calculateOrderFees } from '@/lib/api';
import { generateIdempotencyKey } from '@/lib/utils';

interface CreateOrderModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const NEW_CUSTOMER = '__new__';

const presetCustomers = [
  { value: 'cust-alice-johnson',   label: 'Alice Johnson' },
  { value: 'cust-bob-smith',       label: 'Bob Smith' },
  { value: 'cust-acme-corp',       label: 'Acme Corp' },
  { value: 'cust-diana-chen',      label: 'Diana Chen' },
  { value: 'cust-techflow-inc',    label: 'TechFlow Inc' },
  { value: 'cust-marcus-williams', label: 'Marcus Williams' },
  { value: NEW_CUSTOMER,           label: '+ New customer' },
];

const paymentMethods = [
  { value: 'card',          label: 'Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'wallet',        label: 'Wallet' },
];

const amountPattern = /^\d*(?:\.\d{0,4})?$/;

function normalizeAmount(value: string): string | null {
  const trimmed = value.trim();
  if (!/^\d+(?:\.\d{0,4})?$/.test(trimmed)) return null;

  const [wholeRaw, fractionalRaw = ''] = trimmed.split('.');
  const whole = wholeRaw.replace(/^0+(?=\d)/, '') || '0';
  const fractional = fractionalRaw.padEnd(4, '0');
  const hasValue = whole !== '0' || /[1-9]/.test(fractional);

  if (!hasValue) return null;
  return `${whole}.${fractional}`;
}

function deriveCustomerId(name: string): string {
  return 'cust-' + name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function CreateOrderModal({
  open,
  onClose,
  onCreated,
}: CreateOrderModalProps) {
  const { showToast } = useToast();
  const [amount, setAmount] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(presetCustomers[0].value);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isNewCustomer = selectedCustomer === NEW_CUSTOMER;

  const resolvedCustomerId = isNewCustomer
    ? deriveCustomerId(newCustomerName)
    : selectedCustomer;

  function resetForm() {
    setAmount('');
    setSelectedCustomer(presetCustomers[0].value);
    setNewCustomerName('');
    setPaymentMethod('card');
    setError(null);
  }

  function handleAmountChange(value: string) {
    if (value === '' || amountPattern.test(value)) {
      setAmount(value);
    }
  }

  function handleAmountBlur(value: string) {
    if (!value.trim()) { setAmount(''); return; }
    const normalized = normalizeAmount(value);
    setAmount(normalized ?? value);
  }

  function stepAmount(delta: 1 | -1) {
    setAmount((current) => {
      const normalized = normalizeAmount(current) ?? '0.0000';
      const [whole, fractional] = normalized.split('.');
      const nextWhole = BigInt(whole) + BigInt(delta);
      const safeWhole = nextWhole < BigInt(0) ? BigInt(0) : nextWhole;
      return `${safeWhole.toString()}.${fractional}`;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!amount) {
      const message = 'Please enter an amount.';
      setError(message);
      showToast({ variant: 'error', title: 'Order creation failed', description: message });
      return;
    }

    if (isNewCustomer && !newCustomerName.trim()) {
      const message = 'Please enter the new customer name.';
      setError(message);
      showToast({ variant: 'error', title: 'Order creation failed', description: message });
      return;
    }

    const normalizedAmount = normalizeAmount(amount);
    if (!normalizedAmount) {
      const message = 'Please enter a valid amount.';
      setError(message);
      showToast({ variant: 'error', title: 'Order creation failed', description: message });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await createOrder({
        amount: normalizedAmount,
        customerId: resolvedCustomerId,
        paymentMethod,
      });
      const orderId = result.order.id;

      await payOrder(orderId, generateIdempotencyKey());
      await calculateOrderFees(orderId, generateIdempotencyKey());

      resetForm();
      onCreated();
      showToast({
        title: 'Order created',
        description: `Order ${orderId.slice(0, 8)} created, paid, and fees applied.`,
      });
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create order';
      setError(message);
      showToast({ variant: 'error', title: 'Order creation failed', description: message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New Order">
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Amount */}
        <div className="space-y-1.5">
          <label htmlFor="amount" className="block text-sm font-medium text-slate-700">
            Amount
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm font-semibold text-slate-600">
              $
            </span>
            <input
              id="amount"
              type="text"
              inputMode="decimal"
              placeholder="0.0000"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              onBlur={(e) => handleAmountBlur(e.target.value)}
              className="block min-h-11 w-full rounded-xl border border-[var(--border-strong)] bg-white/90 py-3 pl-8 pr-24 text-sm text-slate-900 placeholder-slate-500 shadow-sm outline-none transition focus:border-[var(--accent)]"
              required
            />
            <div className="absolute inset-y-1 right-1 flex overflow-hidden rounded-lg border border-[var(--border)] bg-slate-50">
              <button type="button" aria-label="Decrease amount by 1" onClick={() => stepAmount(-1)}
                className="cursor-pointer px-3 text-sm font-bold text-slate-600 transition hover:bg-white hover:text-slate-900">
                -
              </button>
              <button type="button" aria-label="Increase amount by 1" onClick={() => stepAmount(1)}
                className="cursor-pointer border-l border-[var(--border)] px-3 text-sm font-bold text-slate-600 transition hover:bg-white hover:text-slate-900">
                +
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-500">Enter a USD amount with up to 4 decimal places.</p>
        </div>

        {/* Customer */}
        <div className="space-y-2">
          <Select
            id="customerId"
            label="Customer"
            options={presetCustomers}
            value={selectedCustomer}
            onChange={(e) => {
              setSelectedCustomer(e.target.value);
              setNewCustomerName('');
              setError(null);
            }}
          />
          {isNewCustomer && (
            <div className="animate-in fade-in slide-in-from-top-1 duration-150">
              <input
                id="newCustomerName"
                type="text"
                placeholder="Enter customer name"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                autoFocus
                className="block min-h-11 w-full rounded-xl border border-[var(--accent)] bg-white/90 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
              />
              {newCustomerName.trim() && (
                <p className="mt-1.5 text-xs text-slate-400">
                  ID: <span className="font-mono text-slate-600">{deriveCustomerId(newCustomerName)}</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Payment method */}
        <Select
          id="paymentMethod"
          label="Payment Method"
          options={paymentMethods}
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        />

        {error && (
          <p className="text-sm font-medium text-red-700" role="alert">{error}</p>
        )}

        <div className="flex justify-end gap-3 border-t border-[var(--border)] pt-4">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Create Order</Button>
        </div>
      </form>
    </Modal>
  );
}
