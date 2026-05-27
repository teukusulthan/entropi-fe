interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | 'default'
    | 'warning'
    | 'success'
    | 'info'
    | 'violet'
    | 'danger';
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  className = '',
}: BadgeProps) {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    warning: 'bg-amber-100 text-amber-800',
    success: 'bg-emerald-100 text-emerald-800',
    info: 'bg-teal-100 text-teal-800',
    violet: 'bg-cyan-100 text-cyan-800',
    danger: 'bg-red-100 text-red-800',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
