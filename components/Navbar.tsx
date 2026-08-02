'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const schoolLinks = [
  { href: '/', label: 'Home' },
  { href: '/admissions', label: 'Admissions' },
  { href: '/news', label: 'News & Events' },
  { href: '/timetable', label: 'Timetable' },
  { href: '/calendar', label: 'Calendar' },
  { href: '/staff', label: 'Staff' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/contact', label: 'Contact' },
  { href: '/portal', label: 'Student Portal' },
  { href: '/teacher-dashboard', label: 'Teachers' },
  { href: '/admin', label: 'Admin' },
];

const landingLinks = [
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#contact', label: 'Contact' },
];

export default function Navbar({
  schoolName,
  logoUrl,
  isLanding,
}: {
  schoolName: string;
  logoUrl?: string | null;
  isLanding?: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname?.startsWith('/platform')) {
    return (
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-extrabold text-gray-900">SchoolOS</span>
          <span className="text-sm text-gray-500">Platform Admin</span>
        </nav>
      </header>
    );
  }

  const links = isLanding ? landingLinks : schoolLinks;
  const brandTextClass = isLanding ? 'text-[#1E2761]' : 'text-[var(--ink)]';

  const linkClass = (href: string) =>
    `border-b-2 px-1 py-2 text-sm font-semibold transition-colors ${
      pathname === href
        ? 'border-[var(--brand-color-2)] text-[var(--ink)]'
        : 'border-transparent text-[var(--muted)] hover:text-[var(--ink)]'
    }`;

  return (
    <div
      className="sticky top-0 z-50 bg-[var(--paper)]/95 backdrop-blur"
      style={{ borderBottom: '3px solid var(--gold)' }}
    >
      <nav className="wrap flex items-center justify-between py-3">
        <Link href="/" className="flex items-center gap-3">
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={schoolName} className="h-[38px] w-auto object-contain" />
          )}
          <span className="flex flex-col leading-tight">
            <span className={`font-display text-lg font-extrabold ${brandTextClass}`}>{schoolName}</span>
            {!isLanding && (
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--muted)]">
                School Portal
              </span>
            )}
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm font-medium text-[var(--ink)] md:hidden"
          aria-label="Toggle navigation"
        >
          Menu
        </button>

        <div className="hidden items-center gap-5 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass(link.href)}>
              {link.label}
            </Link>
          ))}
          {!isLanding && (
            <Link href="/admissions" className="btn btn-primary !px-5 !py-2.5 !text-sm">
              Apply
            </Link>
          )}
          {isLanding && (
            <a href="#contact" className="btn btn-primary !px-5 !py-2.5 !text-sm">
              Book a Demo
            </a>
          )}
        </div>
      </nav>

      {open && (
        <div className="flex flex-col gap-1 border-t border-[var(--line)] px-6 py-4 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                pathname === link.href
                  ? 'bg-[var(--brand-color)] text-white'
                  : 'text-[var(--muted)] hover:bg-[var(--cream)]'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {!isLanding && (
            <Link
              href="/admissions"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-lg bg-[var(--brand-color)] px-3 py-2 text-center text-sm font-semibold text-white"
            >
              Apply
            </Link>
          )}
          {isLanding && (
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-lg bg-[var(--brand-color)] px-3 py-2 text-center text-sm font-semibold text-white"
            >
              Book a Demo
            </a>
          )}
        </div>
      )}
    </div>
  );
}
