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

  const [hideHeader, setHideHeader] = useState(false);
  const lastScrollY = useRef(0);

  const isModern = navbarStyle === 'modern';
  const isBranded = navbarStyle === 'branded';
  const isDefault = navbarStyle === 'default';

  /*
   * Prevent the page from scrolling behind the mobile menu.
   */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  /*
   * Hide navbar while scrolling down.
   */
  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;
      const goingDown = currentY > lastScrollY.current;

      setHideHeader(goingDown && currentY > 120);
      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  /*
   * Never show the main navbar on these dashboards.
   */
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
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
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
        <nav className="wrap flex min-h-[68px] items-center gap-4 py-3">
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

  const shouldHide = hideHeader && !open;

  /*
   * NAVBAR COLORS
   *
   * IMPORTANT:
   * Default = cream/paper on ALL screen sizes.
   *
   * We do NOT switch the default navbar to burgundy or green
   * on mobile.
   */
  const navbarBackground = isBranded
    ? 'var(--brand-700)'
    : isModern
      ? 'var(--paper)'
      : 'var(--cream)';

  const navbarBorder = isBranded
    ? '2px solid var(--brand-500)'
    : isDefault
      ? '3px solid var(--gold)'
      : '1px solid var(--line)';

  /*
   * BRAND TEXT COLORS
   */
  const schoolNameClass = isBranded
    ? 'text-white'
    : 'text-[var(--ink)]';

  const mottoClass = isBranded
    ? 'text-white/70'
    : 'text-[var(--muted)]';

  /*
   * DESKTOP NAV LINK STYLE
   */
  const linkClass = (href: string) => {
    const active = pathname === href;

    if (isBranded) {
      return `border-b-2 px-1 py-1.5 text-[12px] font-semibold whitespace-nowrap transition-colors ${
        active
          ? 'border-[var(--brand-300)] text-white'
          : 'border-transparent text-white/80 hover:border-[var(--brand-300)] hover:text-white'
      }`;
    }

    if (isModern) {
      return `border-b-2 px-1 py-1.5 text-[12px] font-semibold whitespace-nowrap transition-colors ${
        active
          ? 'border-[var(--brand-500)] text-[var(--brand-700)]'
          : 'border-transparent text-[var(--muted)] hover:border-[var(--brand-300)] hover:text-[var(--brand-700)]'
      }`;
    }

    return `border-b-2 px-1 py-1.5 text-[12px] font-semibold whitespace-nowrap transition-colors ${
      active
        ? 'border-[var(--brand-color-2)] text-[var(--ink)]'
        : 'border-transparent text-[var(--muted)] hover:border-[var(--brand-color-2)] hover:text-[var(--ink)]'
    }`;
  };

  return (
    <header
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
        className={`
          wrap
          flex
          items-center
          justify-between
          gap-4
          px-4
          sm:px-6
          lg:px-0

          ${
            isDefault
              ? 'min-h-[82px] py-3'
              : 'min-h-[76px] py-3'
          }
        `}
      >
        {/* =========================================================
            SCHOOL BRAND
            ========================================================= */}

        <Link
          href="/"
          className={`
            flex
            min-w-0
            shrink
            items-center
            gap-2.5
            sm:gap-3

            ${
              isDefault
                ? 'max-w-[calc(100%-105px)] md:max-w-[280px] lg:max-w-[320px]'
                : 'max-w-[calc(100%-105px)] md:max-w-[280px] lg:max-w-[320px]'
            }
          `}
        >
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={schoolName}
              className={`
                shrink-0
                object-contain
                ${
                  isDefault
                    ? 'h-12 w-12 sm:h-14 sm:w-14 md:h-12 md:w-12'
                    : 'h-11 w-11 sm:h-12 sm:w-12'
                }
              `}
            />
          )}

          <span className="min-w-0 flex-1">
            {/* 
              Long school names are allowed to wrap naturally.
              The font scales down slightly on narrow screens.
            */}
            <span
              className={`
                block
                font-display
                font-extrabold
                leading-[1.08]
                tracking-[-0.025em]
                ${schoolNameClass}

                text-[clamp(15px,4.2vw,18px)]
                sm:text-[18px]
                md:text-[17px]
                lg:text-[18px]
              `}
            >
              {schoolName}
            </span>

            <span
              className={`
                mt-1
                block
                whitespace-nowrap
                text-[9px]
                font-bold
                uppercase
                tracking-[0.16em]
                sm:text-[10px]
                ${mottoClass}
              `}
            >
              {motto || 'School Portal'}
            </span>
          </span>
        </Link>

        {/* =========================================================
            MOBILE MENU BUTTON
            ========================================================= */}

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`
            shrink-0
            rounded-xl
            px-5
            py-3
            text-sm
            font-semibold
            md:hidden

            ${
              isBranded
                ? 'border border-white/30 text-white'
                : 'border border-[var(--line)] text-[var(--ink)]'
            }
          `}
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          Menu
        </button>

        {/* =========================================================
            DESKTOP NAVIGATION
            ========================================================= */}

        <div
          className="
            hidden
            min-w-0
            flex-1
            items-center
            justify-end
            gap-x-3
            xl:gap-x-4
            md:flex
          "
        >
          {schoolLinks.map((link) => (
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
            className="
              btn
              btn-primary
              shrink-0
              !px-4
              !py-2
              !text-[12px]
            "
          >
            Apply
          </Link>
        </div>
      </nav>

      {/* =========================================================
          MOBILE NAVIGATION
          ========================================================= */}

      {open && (
        <div
          className={`
            border-t
            px-4
            py-4
            md:hidden

            ${
              isBranded
                ? 'border-white/15'
                : 'border-[var(--line)]'
            }
          `}
        >
          <div className="flex flex-col gap-1">
            {schoolLinks.map((link) => {
              const active = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`
                    rounded-lg
                    px-3
                    py-2.5
                    text-sm
                    font-medium

                    ${
                      isBranded
                        ? active
                          ? 'bg-[var(--brand-500)] text-white'
                          : 'text-white/85 hover:bg-white/10 hover:text-white'
                        : active
                          ? 'bg-[var(--brand-color)] text-white'
                          : 'text-[var(--muted)] hover:bg-[var(--cream)]'
                    }
                  `}
                >
                  {link.label}
                </Link>
              );
            })}

            <Link
              href="/admissions"
              onClick={() => setOpen(false)}
              className="
                mt-2
                rounded-lg
                bg-[var(--brand-500)]
                px-3
                py-2.5
                text-center
                text-sm
                font-semibold
                text-white
              "
            >
              Apply
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
