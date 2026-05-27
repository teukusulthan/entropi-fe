import { ButtonHTMLAttributes } from 'react';
import { Spinner } from './Spinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const base =
    'inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-50';

  const variants = {
    primary:
      'bg-[var(--accent)] text-white shadow-[0_12px_24px_rgba(15,118,110,0.22)] hover:bg-[var(--accent-strong)]',
    secondary:
      'border border-[var(--border-strong)] bg-white/90 text-slate-700 hover:border-slate-300 hover:bg-white',
    danger:
      'bg-red-600 text-white hover:bg-red-700',
  };

  const sizes = {
    sm: 'px-3.5 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="mr-2">
          <Spinner size="sm" />
        </span>
      )}
      {children}
    </button>
  );
}
