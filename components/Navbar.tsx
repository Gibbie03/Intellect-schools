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

type NavbarStyle = 'default' | 'modern' | 'branded';

export default function Navbar({
  schoolName,
  logoUrl,
  motto,
  navbarStyle = 'default',
  isLanding,
}: {
  schoolName: string;
  logoUrl?: string | null;
  motto?: string | null;
  navbarStyle?: NavbarStyle;
  isLanding?: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isModern = navbarStyle === 'modern';
  const isBranded = navbarStyle === 'branded';

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

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

  if (
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/teacher-dashboard')
  ) {
    return null;
  }

  /*
   * PLATFORM ADMIN
   */
  if (pathname?.startsWith('/platform')) {
    return (
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-extrabold text-gray-900">
            SchoolOS
          </span>

          <span className="text-sm text-gray-500">
            Platform Admin
          </span>
        </nav>
      </header>
    );
  }

  /*
   * SCHOOLOS LANDING PAGE
   */
  if (isLanding) {
    return (
      <header className="sticky top-0 z-50 bg-[#f7f5ef]/95 backdrop-blur">
        <nav className="wrap flex items-center gap-4 py-4">
          <Link
            href="/"
            className="font-display text-[19px] font-extrabold"
            style={{ color: '#1c2444' }}
          >
            School
            <span style={{ color: '#b7842b' }}>OS</span>
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
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-semibold"
                style={{ color: '#151a2c' }}
              >
                {link.label}
              </a>
            ))}

            <a
              href="#contact"
              className="font-display inline-flex items-center px-5 py-2.5 text-[13px] font-bold"
              style={{
                background: '#d9a441',
                color: '#12172f',
                clipPath:
                  'polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)',
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
              style={{
                background: '#d9a441',
                color: '#12172f',
              }}
            >
              Book a Demo
            </a>
          </div>
        )}
      </header>
    );
  }

  const links = schoolLinks;

  const shouldHide = hideHeader && !open;

  /*
   * DEFAULT / HILLMASTERS
   *
   * This intentionally preserves the existing design.
   */
  const defaultNavbar =
    navbarStyle === 'default';

  /*
   * NAVBAR THEME
   */
  const navbarBackground = isBranded
    ? 'var(--brand-700)'
    : isModern
      ? 'var(--paper)'
      : 'color-mix(in srgb, var(--paper) 95%, transparent)';

  const navbarBorder = isBranded
    ? '2px solid var(--brand-500)'
    : defaultNavbar
      ? '3px solid var(--gold)'
      : '1px solid var(--line)';

  const schoolNameClass = isBranded
    ? 'text-white'
    : 'text-[var(--ink)]';

  const mottoClass = isBranded
    ? 'text-white/70'
    : 'text-[var(--muted)]';

  const linkClass = (href: string) => {
    const active = pathname === href;

    if (isBranded) {
      return `border-b-2 px-1 py-2 text-sm font-semibold transition-colors ${
        active
          ? 'border-[var(--brand-300)] text-white'
          : 'border-transparent text-white/80 hover:border-[var(--brand-300)] hover:text-white'
      }`;
    }

    if (isModern) {
      return `border-b-2 px-1 py-2 text-sm font-semibold transition-colors ${
        active
          ? 'border-[var(--brand-500)] text-[var(--brand-700)]'
          : 'border-transparent text-[var(--muted)] hover:border-[var(--brand-300)] hover:text-[var(--brand-700)]'
      }`;
    }

    return `border-b-2 px-1 py-2 text-sm font-semibold transition-colors ${
      active
        ? 'border-[var(--brand-color-2)] text-[var(--ink)]'
        : 'border-transparent text-[var(--muted)] hover:text-[var(--ink)]'
    }`;
  };

  return (
    <div
      className={`sticky top-0 z-50 backdrop-blur transition-transform duration-300 ease-in-out ${
        isBranded ? 'text-white' : 'text-[var(--ink)]'
      }`}
      style={{
        background: navbarBackground,
        borderBottom: navbarBorder,
        transform: shouldHide
          ? 'translateY(-100%)'
          : 'translateY(0)',
      }}
    >
      <nav
        className={`wrap flex flex-wrap items-center justify-between ${
          isModern
            ? 'gap-x-4 gap-y-3 py-4'
            : defaultNavbar
              ? 'gap-x-4 gap-y-[14px] py-[29px]'
              : 'gap-x-4 gap-y-3 py-5'
        }`}
      >
        {/* SCHOOL BRAND */}
        <Link
          href="/"
          className={`flex w-full items-center gap-3 ${
            defaultNavbar
              ? 'flex-col text-center sm:w-auto sm:flex-row sm:items-center sm:text-left'
              : 'sm:w-auto'
          }`}
        >
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={schoolName}
              className={`w-auto shrink-0 object-contain ${
                isModern ? 'h-10' : 'h-12'
              }`}
            />
          )}

          <span
            className={`flex flex-col leading-tight ${
              defaultNavbar
                ? 'items-center sm:items-start'
                : 'items-start'
            }`}
          >
            <span
              className={`font-display text-lg font-extrabold ${schoolNameClass}`}
            >
              {schoolName}
            </span>

            <span
              className={`whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.15em] ${mottoClass}`}
            >
              {motto || 'School Portal'}
            </span>
          </span>
        </Link>

        {/* MOBILE BUTTON */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`ml-auto rounded-lg px-4 py-2.5 text-sm font-medium md:hidden ${
            isBranded
              ? 'border border-white/30 text-white'
              : 'border border-[var(--line)] text-[var(--ink)]'
          }`}
          aria-label="Toggle navigation"
        >
          Menu
        </button>

        {/* DESKTOP NAVIGATION */}
        <div className="hidden flex-wrap items-center justify-end gap-x-5 gap-y-2 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={linkClass(link.href)}
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/admissions"
            className="btn btn-primary !px-5 !py-2.5 !text-sm"
          >
            Apply
          </Link>
        </div>
      </nav>

      {/* MOBILE NAVIGATION */}
      {open && (
        <div
          className={`flex flex-col gap-1 border-t px-6 py-4 md:hidden ${
            isBranded
              ? 'border-white/15'
              : 'border-[var(--line)]'
          }`}
        >
          {links.map((link) => {
            const active = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  isBranded
                    ? active
                      ? 'bg-[var(--brand-500)] text-white'
                      : 'text-white/85 hover:bg-white/10 hover:text-white'
                    : active
                      ? 'bg-[var(--brand-color)] text-white'
                      : 'text-[var(--muted)] hover:bg-[var(--cream)]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <Link
            href="/admissions"
            onClick={() => setOpen(false)}
            className="mt-2 rounded-lg bg-[var(--brand-500)] px-3 py-2 text-center text-sm font-semibold text-white"
          >
            Apply
          </Link>
        </div>
      )}
    </div>
  );
   }
