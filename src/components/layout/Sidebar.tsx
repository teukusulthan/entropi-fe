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
      <nav className="flex-1 space-y-1 px-4 py-6">
        {navItems.map((item) => {
          const active = isActive(item.href, item.label);
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-all duration-200 ease-in-out ${
                active
                  ? 'bg-[var(--accent-soft)] font-semibold text-[var(--accent-strong)] shadow-sm'
                  : 'text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-[0_2px_8px_rgba(15,23,42,0.06)]'
              }`}
            >
              <span
                className={`h-5 w-0.5 rounded-full transition-all duration-200 ease-in-out ${
                  active
                    ? 'bg-[var(--accent)]'
                    : 'bg-transparent group-hover:bg-[var(--accent)] group-hover:opacity-60'
                }`}
              />
              <span className={`transition-transform duration-200 ease-in-out ${active ? '' : 'group-hover:translate-x-0.5'}`}>
                {item.label}
              </span>
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
