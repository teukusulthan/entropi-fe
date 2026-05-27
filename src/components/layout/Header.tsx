'use client';

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[rgba(246,247,244,0.84)] backdrop-blur lg:hidden">
      <div className="flex items-center justify-between px-4 py-4">
        <div>
          <span className="text-base font-semibold tracking-[0.24em] text-[var(--accent)]">
            ENTROPI
          </span>
          <p className="mt-1 text-xs text-slate-500">Seller operations console</p>
        </div>
        <button
          onClick={onMenuToggle}
          className="cursor-pointer rounded-xl border border-[var(--border)] bg-white/80 p-2.5 text-slate-600 transition hover:border-[var(--border-strong)] hover:text-slate-900"
          aria-label="Open menu"
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
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
