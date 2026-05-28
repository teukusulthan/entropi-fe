interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-[var(--border)]">
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return <thead className="bg-slate-50/80">{children}</thead>;
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return (
    <tbody className="divide-y divide-[var(--border)] bg-transparent">{children}</tbody>
  );
}

export function TableRow({
  children,
  className = '',
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <tr onClick={onClick} className={`transition hover:bg-white/70 ${className}`}>
      {children}
    </tr>
  );
}

export function TableHeader({
  children,
  align = 'left',
  className = '',
}: {
  children?: React.ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
}) {
  const alignClass = {
    left: 'text-left',
    right: 'text-right',
    center: 'text-center',
  };
  return (
    <th
      className={`px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 ${alignClass[align]} ${className}`}
    >
      {children}
    </th>
  );
}

export function TableCell({
  children,
  align = 'left',
  className = '',
}: {
  children: React.ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
}) {
  const alignClass = {
    left: 'text-left',
    right: 'text-right',
    center: 'text-center',
  };
  return (
    <td
      className={`px-5 py-4 text-sm ${alignClass[align]} ${className}`}
    >
      {children}
    </td>
  );
}
