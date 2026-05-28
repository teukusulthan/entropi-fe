'use client';

import { useEffect, useRef, useState } from 'react';

interface DropdownProps {
  label?: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  id?: string;
}

export function Dropdown({ label, value, options, onChange, id }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div ref={ref} className="relative">
        <button
          id={id}
          type="button"
          onClick={() => setOpen(o => !o)}
          className="flex min-h-11 w-full items-center justify-between rounded-xl border border-[var(--border-strong)] bg-white/90 px-3.5 py-3 text-sm text-slate-900 shadow-sm transition focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15"
        >
          <span className={selected ? 'text-slate-900' : 'text-slate-400'}>
            {selected?.label ?? 'Select…'}
          </span>
          <svg
            className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
            viewBox="0 0 16 16" fill="none" stroke="currentColor"
            strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M4 6l4 4 4-4" />
          </svg>
        </button>

        {open && (
          <div className="absolute left-0 top-full z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.10)]">
            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm transition-colors hover:bg-slate-50 ${
                  value === opt.value
                    ? 'bg-[var(--accent-soft)] font-semibold text-[var(--accent-strong)]'
                    : 'text-slate-700'
                }`}
              >
                {opt.label}
                {value === opt.value && (
                  <svg className="h-4 w-4 shrink-0 text-[var(--accent)]" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
