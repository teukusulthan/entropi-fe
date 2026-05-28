import { InputHTMLAttributes, SelectHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefix?: string;
}

export function Input({
  label,
  error,
  prefix,
  className = '',
  id,
  ...props
}: InputProps) {
  const hintId = error && id ? `${id}-error` : undefined;

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {prefix ? (
          <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm font-semibold text-slate-600">
            {prefix}
          </span>
        ) : null}
        <input
          id={id}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={hintId}
          className={`block min-h-11 w-full rounded-xl border bg-white/90 py-3 text-sm text-slate-900 placeholder-slate-500 shadow-sm outline-none transition focus:border-[var(--accent)] ${prefix ? 'pl-8 pr-3.5' : 'px-3.5'} ${error ? 'border-red-500' : 'border-[var(--border-strong)]'} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p id={hintId} className="mt-1 text-xs font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({
  label,
  error,
  options,
  className = '',
  id,
  ...props
}: SelectProps) {
  const hintId = error && id ? `${id}-error` : undefined;

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={hintId}
          className={`block min-h-11 w-full appearance-none rounded-xl border bg-white/90 py-3 pl-3.5 pr-9 text-sm text-slate-900 shadow-sm outline-none transition focus:border-[var(--accent)] ${error ? 'border-red-500' : 'border-[var(--border-strong)]'} ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 6l4 4 4-4" />
          </svg>
        </span>
      </div>
      {error && (
        <p id={hintId} className="mt-1 text-xs font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
