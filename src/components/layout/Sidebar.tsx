'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', href: '/' },
  { label: 'Settlement', href: '/settlement' },
];

export function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string, label: string): boolean {
    if (label === 'Dashboard') {
      return pathname === '/' || pathname.startsWith('/orders');
    }

    return pathname.startsWith(href);
  }

  return (
    <aside
      aria-label="Primary navigation"
      className="surface-card hidden border-r border-[var(--border)] lg:fixed lg:inset-y-4 lg:left-4 lg:flex lg:w-[17rem] lg:flex-col lg:rounded-[28px]"
    >
      <div className="border-b border-[var(--border)] px-7 py-7">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--accent)]">
          Entropi
        </p>
        <p className="mt-3 text-xl font-semibold text-slate-900">Seller Console</p>
        <p className="mt-1 text-sm text-slate-500">
          Orders, settlement, and ledger visibility in one place.
        </p>
      </div>
      <nav className="flex-1 space-y-2 px-4 py-6">
        {navItems.map((item) => {
          const active = isActive(item.href, item.label);
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`block rounded-2xl px-4 py-3 text-sm transition ${
                active
                  ? 'bg-[var(--accent-soft)] text-[var(--accent-strong)] font-semibold shadow-sm'
                  : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-[var(--border)] px-7 py-5">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
          Build
        </p>
        <span className="mt-1 block text-sm text-slate-500">Ent-JFE-20/05/26</span>
      </div>
    </aside>
  );
}
