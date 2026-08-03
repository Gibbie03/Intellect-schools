'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

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
  motto,
  isLanding,
}: {
  schoolName: string;
  logoUrl?: string | null;
  motto?: string | null;
  isLanding?: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Hides the sticky header on scroll-down and brings it back on scroll-up,
  // so it doesn't sit fixed over content the whole way down a long page.
  // Ignored near the very top (so it doesn't twitch away on a tiny scroll)
  // and while the mobile menu is open (so links don't vanish mid-tap).
  const [hideHeader, setHideHeader] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    lastScrollY.current = window.scrollY;
    const handleScroll = () => {
      const currentY = window.scrollY;
      const goingDown = currentY > lastScrollY.current;
      setHideHeader(goingDown && currentY > 120);
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/teacher-dashboard')) {
    return null;
  }

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

  if (isLanding) {
    return (
      <header className="sticky top-0 z-50 bg-[#f7f5ef]/95 backdrop-blur">
        <nav className="wrap flex items-center gap-4 py-4">
          <Link href="/" className="font-display text-[19px] font-extrabold" style={{ color: '#1c2444' }}>
            School<span style={{ color: '#b7842b' }}>OS</span>
          </Link>

          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="ml-auto rounded-lg border border-black/10 px-3 py-2 text-sm font-medium md:hidden"
            aria-label="Toggle navigation"
          >
            Menu
          </button>

          <div className="ml-auto hidden items-center gap-6 md:flex">
            {landingLinks.map((link) => (
              <a key={link.href} href={link.href} className="text-sm font-semibold" style={{ color: '#151a2c' }}>
                {link.label}
              </a>
            ))}
            <a
              href="#contact"
              className="font-display inline-flex items-center py-2.5 px-5 text-[13px] font-bold"
              style={{
                background: '#d9a441',
                color: '#12172f',
                clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)',
              }}
            >
              Book a Demo
            </a>
          </div>
        </nav>

        {open && (
          <div className="flex flex-col gap-1 border-t border-black/10 px-6 py-4 md:hidden">
            {landingLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium"
                style={{ color: '#151a2c' }}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-lg px-3 py-2 text-center text-sm font-semibold"
              style={{ background: '#d9a441', color: '#12172f' }}
            >
              Book a Demo
            </a>
          </div>
        )}
      </header>
    );
  }

  const links = schoolLinks;

  const linkClass = (href: string) =>
    `border-b-2 px-1 py-2 text-sm font-semibold transition-colors ${
      pathname === href
        ? 'border-[var(--brand-color-2)] text-[var(--ink)]'
        : 'border-transparent text-[var(--muted)] hover:text-[var(--ink)]'
    }`;

  const shouldHide = hideHeader && !open;

  return (
    <div
      className="sticky top-0 z-50 bg-[var(--paper)]/95 backdrop-blur transition-transform duration-300 ease-in-out"
      style={{ borderBottom: '3px solid var(--gold)', transform: shouldHide ? 'translateY(-100%)' : 'translateY(0)' }}
    >
      <nav className="wrap flex flex-wrap items-center justify-between gap-x-4 gap-y-[14px] py-[29px]">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={schoolName} className="h-12 w-auto shrink-0 object-contain" />
          )}
          <span className="flex flex-col leading-tight">
            <span className="font-display whitespace-nowrap text-lg font-extrabold text-[var(--ink)]">
              {schoolName}
            </span>
            <span className="whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--muted)]">
              {motto || 'School Portal'}
            </span>
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="ml-auto rounded-lg border border-[var(--line)] px-4 py-2.5 text-sm font-medium text-[var(--ink)] md:hidden"
          aria-label="Toggle navigation"
        >
          Menu
        </button>

        <div className="hidden flex-wrap items-center justify-end gap-x-5 gap-y-2 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass(link.href)}>
              {link.label}
            </Link>
          ))}
          <Link href="/admissions" className="btn btn-primary !px-5 !py-2.5 !text-sm">
            Apply
          </Link>
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
          <Link
            href="/admissions"
            onClick={() => setOpen(false)}
            className="mt-2 rounded-lg bg-[var(--brand-color)] px-3 py-2 text-center text-sm font-semibold text-white"
          >
            Apply
          </Link>
        </div>
      )}
    </div>
  );
}
