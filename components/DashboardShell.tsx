'use client';

import { useState } from 'react';

export default function DashboardShell<T extends string>({
  brandLabel,
  tabs,
  activeTab,
  onTabChange,
  userLabel,
  onLogout,
  children,
}: {
  brandLabel: string;
  tabs: { id: T; label: string }[];
  activeTab: T;
  onTabChange: (id: T) => void;
  userLabel: string;
  onLogout: () => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="dash-shell">
      <div className={`dash-overlay ${open ? 'open' : ''}`} onClick={() => setOpen(false)} />
      <aside className={`dash-sidebar ${open ? 'open' : ''}`}>
        <div className="flex items-center gap-2 px-5">
          <span className="font-display text-sm font-extrabold leading-tight text-white">{brandLabel}</span>
          {open && (
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="dash-icon-btn ml-auto"
              style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'transparent', color: '#fff' }}
            >
              ✕
            </button>
          )}
        </div>
        <nav className="flex flex-col gap-0.5">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                onTabChange(t.id);
                setOpen(false);
              }}
              className={`side-link ${activeTab === t.id ? 'active' : ''}`}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto px-1.5">
          <button type="button" onClick={onLogout} className="side-link">
            Log out
          </button>
        </div>
      </aside>

      <main className="p-5 sm:p-8" style={{ background: 'var(--cream)' }}>
        <div className="mb-6 flex flex-wrap items-center gap-3.5">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="dash-icon-btn dash-mobile-toggle"
          >
            ☰
          </button>
          <span className="text-sm text-[var(--muted)]">Signed in as {userLabel || '…'}</span>
        </div>
        {children}
      </main>
    </div>
  );
}
