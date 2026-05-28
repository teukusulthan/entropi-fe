'use client';

import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Dropdown } from '../ui/Dropdown';
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
  { value: NEW_CUSTOMER,           label: '+ New customer' },
  { value: 'cust-alice-johnson',   label: 'Alice Johnson' },
  { value: 'cust-bob-smith',       label: 'Bob Smith' },
  { value: 'cust-acme-corp',       label: 'Acme Corp' },
  { value: 'cust-diana-chen',      label: 'Diana Chen' },
  { value: 'cust-techflow-inc',    label: 'TechFlow Inc' },
  { value: 'cust-marcus-williams', label: 'Marcus Williams' },
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

function generateNumericCustomerId(): string {
  return 'CUST-' + Math.floor(10000000 + Math.random() * 90000000).toString();
}

export function CreateOrderModal({
  open,
  onClose,
  onCreated,
}: CreateOrderModalProps) {
  const { showToast } = useToast();
  const [amount, setAmount] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('cust-alice-johnson');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [generatedCustomerId, setGeneratedCustomerId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isNewCustomer = selectedCustomer === NEW_CUSTOMER;

  const resolvedCustomerId = isNewCustomer ? generatedCustomerId : selectedCustomer;

  function resetForm() {
    setAmount('');
    setSelectedCustomer('cust-alice-johnson');
    setNewCustomerName('');
    setGeneratedCustomerId('');
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

  function stepAmount(delta: number) {
    setAmount((current) => {
      const normalized = normalizeAmount(current) ?? '0.0000';
      const SCALE = 10000;
      const currentScaled = Math.round(parseFloat(normalized) * SCALE);
      const deltaScaled = Math.round(delta * SCALE);
      const nextScaled = Math.max(0, currentScaled + deltaScaled);
      return (nextScaled / SCALE).toFixed(4);
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
              className="block min-h-11 w-full rounded-xl border border-[var(--border-strong)] bg-white/90 py-3 pl-8 pr-44 text-sm text-slate-900 placeholder-slate-500 shadow-sm outline-none transition focus:border-[var(--accent)]"
              required
            />
            <div className="absolute inset-y-1 right-1 flex overflow-hidden rounded-lg border border-[var(--border)] bg-slate-50">
              {[
                { label: '−1',   delta: -1,   aria: 'Decrease by 1' },
                { label: '−.1',  delta: -0.1, aria: 'Decrease by 0.1' },
                { label: '+.1',  delta:  0.1, aria: 'Increase by 0.1' },
                { label: '+1',   delta:  1,   aria: 'Increase by 1' },
              ].map((btn, i) => (
                <button
                  key={btn.label}
                  type="button"
                  aria-label={btn.aria}
                  onClick={() => stepAmount(btn.delta)}
                  className={`cursor-pointer px-2.5 text-xs font-bold text-slate-600 transition hover:bg-white hover:text-slate-900 ${i > 0 ? 'border-l border-[var(--border)]' : ''}`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-500">Enter a USD amount with up to 4 decimal places.</p>
        </div>

        {/* Customer */}
        <div className="space-y-2">
          <Dropdown
            id="customerId"
            label="Customer"
            options={presetCustomers}
            value={selectedCustomer}
            onChange={(v) => {
              setSelectedCustomer(v);
              setNewCustomerName('');
              setGeneratedCustomerId(v === NEW_CUSTOMER ? generateNumericCustomerId() : '');
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
              <p className="mt-1.5 text-xs text-slate-400">
                ID: <span className="font-mono text-slate-600">{generatedCustomerId}</span>
              </p>
            </div>
          )}
        </div>

        {/* Payment method */}
        <Dropdown
          id="paymentMethod"
          label="Payment Method"
          options={paymentMethods}
          value={paymentMethod}
          onChange={setPaymentMethod}
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
