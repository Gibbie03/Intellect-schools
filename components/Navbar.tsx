'use client';

import { useState } from 'react';
import Link from 'next/link';

type NavbarProps = {
  schoolName: string;
  logoUrl?: string | null;
  motto?: string | null;
  navbarStyle?: string;
  isLanding?: boolean;
};

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Admissions', href: '/admissions' },
  { label: 'News & Events', href: '/news' },
  { label: 'Timetable', href: '/timetable' },
  { label: 'Calendar', href: '/calendar' },
  { label: 'Staff', href: '/staff' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Contact', href: '/contact' },
  { label: 'Student Portal', href: '/student-portal' },
];

export default function Navbar({
  schoolName,
  logoUrl,
  motto,
  navbarStyle = 'default',
  isLanding = false,
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const isDefault = navbarStyle === 'default';

  /*
   * Default SchoolOS template:
   * - Cream header
   * - Dark ink text
   * - Gold separator
   *
   * Branded schools:
   * - Keep their existing branded appearance
   * - Colour comes from the CSS variables set in layout.tsx
   */
  const headerClass = isDefault
    ? 'bg-[var(--cream)] text-[var(--ink)]'
    : 'bg-[var(--cream)] text-[var(--ink)]';

  return (
    <header
      className={`relative z-50 w-full border-b border-[var(--line)] ${headerClass}`}
    >
      {/* =========================================================
          MOBILE HEADER
          ========================================================= */}
      <div className="md:hidden">
        <div
          className="
            flex min-h-[150px] w-full items-start
            px-5 pt-7 pb-6
          "
        >
          {/* Logo */}
          {logoUrl ? (
            <div className="flex h-[76px] w-[76px] shrink-0 items-center justify-center overflow-hidden">
              <img
                src={logoUrl}
                alt={`${schoolName} logo`}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ) : (
            <div className="w-[76px] shrink-0" />
          )}

          {/* School identity */}
          <div
            className="
              min-w-0 flex-1
              pl-4 pr-3
            "
          >
            <Link
              href="/"
              className="block no-underline"
              onClick={() => setMenuOpen(false)}
            >
              <div
                className="
                  font-[var(--font-manrope)]
                  font-extrabold
                  leading-[1.05]
                  tracking-[-0.035em]
                  text-[clamp(17px,4.8vw,23px)]
                "
              >
                {schoolName}
              </div>

              {motto && (
                <div
                  className="
                    mt-2
                    max-w-full
                    overflow-hidden
                    text-ellipsis
                    whitespace-nowrap
                    font-[var(--font-inter)]
                    text-[11px]
                    font-medium
                    uppercase
                    tracking-[0.22em]
                    text-[var(--muted)]
                  "
                >
                  {motto}
                </div>
              )}
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
            className="
              mt-0
              flex h-[86px] w-[138px]
              shrink-0
              items-center justify-center
              rounded-[16px]
              border border-[var(--line)]
              bg-transparent
              px-6
              font-[var(--font-manrope)]
              text-[22px]
              font-bold
              text-[var(--ink)]
              transition-colors
              hover:bg-black/[0.03]
            "
          >
            {menuOpen ? 'Close' : 'Menu'}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="border-t border-[var(--line)] bg-[var(--cream)] px-5 pb-6">
            <nav className="flex flex-col">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="
                    border-b border-[var(--line)]
                    py-4
                    font-[var(--font-inter)]
                    text-[15px]
                    font-medium
                    text-[var(--ink)]
                  "
                >
                  {item.label}
                </Link>
              ))}

              <div className="mt-4 flex gap-3">
                <Link
                  href="/teachers"
                  onClick={() => setMenuOpen(false)}
                  className="
                    flex-1
                    border border-[var(--line)]
                    px-4 py-3
                    text-center
                    text-sm
                    font-semibold
                    text-[var(--ink)]
                  "
                >
                  Teachers
                </Link>

                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="
                    flex-1
                    border border-[var(--line)]
                    px-4 py-3
                    text-center
                    text-sm
                    font-semibold
                    text-[var(--ink)]
                  "
                >
                  Admin
                </Link>

                <Link
                  href="/admissions/apply"
                  onClick={() => setMenuOpen(false)}
                  className="
                    bg-[var(--brand-color)]
                    px-5 py-3
                    text-center
                    text-sm
                    font-bold
                    text-white
                  "
                >
                  Apply
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* =========================================================
          DESKTOP HEADER
          ========================================================= */}
      <div className="hidden md:block">
        {/* ---------------------------------------------------------
            BRAND ROW
            --------------------------------------------------------- */}
        <div
          className="
            mx-auto
            flex
            min-h-[76px]
            w-full
            max-w-[1440px]
            items-center
            px-8
            lg:px-10
            xl:px-12
          "
        >
          {/* Logo */}
          {logoUrl ? (
            <Link
              href="/"
              className="
                mr-4
                flex
                h-[54px]
                w-[54px]
                shrink-0
                items-center
                justify-center
              "
            >
              <img
                src={logoUrl}
                alt={`${schoolName} logo`}
                className="max-h-full max-w-full object-contain"
              />
            </Link>
          ) : null}

          {/* School name + motto */}
          <div className="min-w-0 flex-1">
            <Link href="/" className="block">
              <div
                className="
                  font-[var(--font-manrope)]
                  text-[18px]
                  font-extrabold
                  leading-[1.05]
                  tracking-[-0.025em]
                  text-[var(--ink)]
                "
              >
                {schoolName}
              </div>

              {motto && (
                <div
                  className="
                    mt-1
                    font-[var(--font-inter)]
                    text-[9px]
                    font-medium
                    uppercase
                    tracking-[0.2em]
                    text-[var(--muted)]
                  "
                >
                  {motto}
                </div>
              )}
            </Link>
          </div>

          {/* Desktop utility actions */}
          <div className="ml-6 flex shrink-0 items-center gap-5">
            <Link
              href="/teachers"
              className="
                font-[var(--font-inter)]
                text-[11px]
                font-medium
                text-[var(--muted)]
                transition-colors
                hover:text-[var(--ink)]
              "
            >
              Teachers
            </Link>

            <Link
              href="/admin"
              className="
                font-[var(--font-inter)]
                text-[11px]
                font-medium
                text-[var(--muted)]
                transition-colors
                hover:text-[var(--ink)]
              "
            >
              Admin
            </Link>

            <Link
              href="/admissions/apply"
              className="
                relative
                inline-flex
                h-[32px]
                items-center
                justify-center
                bg-[var(--brand-color)]
                px-5
                font-[var(--font-inter)]
                text-[11px]
                font-bold
                text-white
                transition-opacity
                hover:opacity-90
              "
            >
              Apply
            </Link>
          </div>
        </div>

        {/* ---------------------------------------------------------
            NAVIGATION ROW
            --------------------------------------------------------- */}
        <div
          className="
            border-t border-[var(--line)]
            bg-[var(--cream)]
          "
        >
          <div
            className="
              mx-auto
              flex
              min-h-[44px]
              w-full
              max-w-[1440px]
              items-center
              px-8
              lg:px-10
              xl:px-12
            "
          >
            <nav className="flex min-w-0 flex-1 items-center gap-0">
              {navItems.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    relative
                    flex
                    h-[44px]
                    shrink-0
                    items-center
                    px-3
                    font-[var(--font-inter)]
                    text-[11px]
                    font-medium
                    text-[var(--muted)]
                    transition-colors
                    hover:text-[var(--ink)]
                    ${index === 0 ? 'pl-0' : ''}
                  `}
                >
                  {item.label}

                  {index === 0 && (
                    <span
                      className="
                        absolute
                        bottom-0
                        left-3
                        right-3
                        h-[2px]
                        bg-[var(--brand-color)]
                      "
                    />
                  )}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* =========================================================
          GOLD / BRAND ACCENT LINE
          ========================================================= */}
      <div
        className="
          h-[4px]
          w-full
          bg-[var(--gold)]
        "
      />
    </header>
  );
        }
