'use client';

import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input, Select } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { createOrder, payOrder, calculateOrderFees } from '@/lib/api';
import { generateIdempotencyKey } from '@/lib/utils';

interface CreateOrderModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const paymentMethods = [
  { value: 'card', label: 'Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'wallet', label: 'Wallet' },
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

export function CreateOrderModal({
  open,
  onClose,
  onCreated,
}: CreateOrderModalProps) {
  const { showToast } = useToast();
  const [amount, setAmount] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetForm() {
    setAmount('');
    setCustomerId('');
    setPaymentMethod('card');
    setError(null);
  }

  function handleAmountChange(value: string) {
    if (value === '' || amountPattern.test(value)) {
      setAmount(value);
    }
  }

  function handleAmountBlur(value: string) {
    if (!value.trim()) {
      setAmount('');
      return;
    }

    const normalized = normalizeAmount(value);
    setAmount(normalized ?? value);
  }

  function stepAmount(delta: 1 | -1) {
    setAmount((current) => {
      const normalized = normalizeAmount(current) ?? '0.0000';
      const [whole, fractional] = normalized.split('.');
      const nextWhole = BigInt(whole) + BigInt(delta);
      const zero = BigInt(0);
      const safeWhole = nextWhole < zero ? zero : nextWhole;

      return `${safeWhole.toString()}.${fractional}`;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || !customerId) {
      const message = 'Please fill in all fields.';
      setError(message);
      showToast({
        variant: 'error',
        title: 'Order creation failed',
        description: message,
      });
      return;
    }

    const normalizedAmount = normalizeAmount(amount);
    if (!normalizedAmount) {
      const message = 'Please enter a valid amount.';
      setError(message);
      showToast({
        variant: 'error',
        title: 'Order creation failed',
        description: message,
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await createOrder({
        amount: normalizedAmount,
        customerId: customerId.trim(),
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
      const message =
        err instanceof Error ? err.message : 'Failed to create order';
      setError(message);
      showToast({
        variant: 'error',
        title: 'Order creation failed',
        description: message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New Order">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-slate-700"
          >
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
              <button
                type="button"
                aria-label="Decrease amount by 1"
                onClick={() => stepAmount(-1)}
                className="cursor-pointer px-3 text-sm font-bold text-slate-600 transition hover:bg-white hover:text-slate-900"
              >
                -
              </button>
              <button
                type="button"
                aria-label="Increase amount by 1"
                onClick={() => stepAmount(1)}
                className="cursor-pointer border-l border-[var(--border)] px-3 text-sm font-bold text-slate-600 transition hover:bg-white hover:text-slate-900"
              >
                +
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Enter a USD amount with up to 4 decimal places.
          </p>
        </div>
        <Input
          id="customerId"
          label="Customer ID"
          type="text"
          placeholder="customer-id"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          required
        />
        <Select
          id="paymentMethod"
          label="Payment Method"
          options={paymentMethods}
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        />

        {error && (
          <p className="text-sm font-medium text-red-700" role="alert">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 border-t border-[var(--border)] pt-4">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create Order
          </Button>
        </div>
      </form>
    </Modal>
  );
}
