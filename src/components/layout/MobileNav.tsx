'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', href: '/' },
  { label: 'Settlement', href: '/settlement' },
];

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const pathname = usePathname();

  function isActive(href: string, label: string): boolean {
    if (label === 'Dashboard') {
      return pathname === '/' || pathname.startsWith('/orders');
    }

    return pathname.startsWith(href);
  }

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 cursor-pointer bg-slate-950/35 backdrop-blur-sm lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className="surface-card fixed inset-y-3 left-3 z-50 w-[18rem] rounded-[28px] border border-[var(--border)] lg:hidden"
      >
        <div className="flex items-start justify-between border-b border-[var(--border)] px-6 py-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--accent)]">
              Entropi
            </span>
            <p className="mt-3 text-lg font-semibold text-slate-900">Seller Console</p>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-xl border border-[var(--border)] bg-white/80 p-2 text-slate-600 transition hover:text-slate-900"
            aria-label="Close menu"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <nav className="space-y-2 px-4 py-6">
          {navItems.map((item) => {
            const active = isActive(item.href, item.label);
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                aria-current={active ? 'page' : undefined}
                className={`block rounded-2xl px-4 py-3 text-sm transition ${
                  active
                    ? 'bg-[var(--accent-soft)] font-semibold text-[var(--accent-strong)]'
                    : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-[var(--border)] px-6 py-5">
          <span className="text-xs uppercase tracking-[0.22em] text-slate-500">
            Ent-JFE-20/05/26
          </span>
        </div>
      </div>
    </>
  );
}
