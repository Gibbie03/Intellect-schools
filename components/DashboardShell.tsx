'use client';

import Link from 'next/link';
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
      {/* Mobile overlay */}
      <div
        className={`dash-overlay ${open ? 'open' : ''}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside className={`dash-sidebar ${open ? 'open' : ''}`}>
        {/* Brand */}
        <div className="dash-brand">
          <div className="dash-brand-mark">S</div>

          <div className="min-w-0">
            <div className="dash-brand-name">SchoolOS</div>
            <div className="dash-brand-label">{brandLabel}</div>
          </div>

          {open && (
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="dash-icon-btn dash-close"
            >
              ✕
            </button>
          )}
        </div>

        {/* Website link */}
        <Link
          href="/"
          className="dash-back-link"
          onClick={() => setOpen(false)}
        >
          <span>←</span>
          <span>Back to website</span>
        </Link>

        {/* Navigation */}
        <div className="dash-nav-label">School management</div>

        <nav className="dash-nav">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  onTabChange(tab.id);
                  setOpen(false);
                }}
                className={`dash-nav-item ${active ? 'active' : ''}`}
              >
                <span className="dash-nav-indicator" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="dash-sidebar-bottom">
          <div className="dash-user-mini">
            <div className="dash-avatar">
              {(userLabel || 'A').charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <div className="dash-user-name">
                {userLabel || 'Administrator'}
              </div>
              <div className="dash-user-role">School administrator</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="dash-logout"
          >
            <span>↪</span>
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main application */}
      <main className="dash-main">
        {/* Top bar */}
        <header className="dash-topbar">
          <div className="dash-topbar-left">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="dash-icon-btn dash-mobile-toggle"
            >
              ☰
            </button>

            <div className="dash-mobile-brand">
              <span className="dash-mobile-brand-name">SchoolOS</span>
              <span className="dash-mobile-brand-label">
                {brandLabel}
              </span>
            </div>
          </div>

          <div className="dash-topbar-right">
            <Link
              href="/"
              className="dash-topbar-link"
              title="Back to website"
            >
              <span>⌂</span>
              <span className="hidden sm:inline">Website</span>
            </Link>

            <div className="dash-divider" />

            <div className="dash-signed-in">
              <span className="dash-signed-label">Signed in as</span>
              <span className="dash-signed-user">
                {userLabel || 'Administrator'}
              </span>
            </div>

            <div className="dash-avatar dash-avatar-top">
              {(userLabel || 'A').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="dash-content">{children}</div>
      </main>
    </div>
  );
}
