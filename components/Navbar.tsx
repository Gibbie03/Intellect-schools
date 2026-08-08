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

        {/* ---------------------------------------------------------
            SCHOOL IDENTITY ROW
            --------------------------------------------------------- */}
        <div className="flex w-full items-center gap-3 px-4 py-4">

          {/* Logo */}
          {logoUrl ? (
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="
                flex
                h-[56px]
                w-[56px]
                shrink-0
                items-center
                justify-center
                overflow-hidden
              "
            >
              <img
                src={logoUrl}
                alt={`${schoolName} logo`}
                className="max-h-full max-w-full object-contain"
              />
            </Link>
          ) : (
            <div className="h-[56px] w-[56px] shrink-0" />
          )}

          {/* School name + motto */}
          <div className="min-w-0 flex-1">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="block"
            >
              <div
                className="
                  font-[var(--font-manrope)]
                  text-[18px]
                  font-extrabold
                  leading-[1.1]
                  tracking-[-0.03em]
                  text-[var(--ink)]
                "
              >
                {schoolName}
              </div>

              {/* Motto intentionally wraps.
                  Long school mottos are NOT truncated. */}
              {motto && (
                <div
                  className="
                    mt-1.5
                    max-w-full
                    font-[var(--font-inter)]
                    text-[9px]
                    font-medium
                    uppercase
                    leading-[1.45]
                    tracking-[0.12em]
                    text-[var(--muted)]
                  "
                >
                  {motto}
                </div>
              )}
            </Link>
          </div>
        </div>

        {/* ---------------------------------------------------------
            MOBILE NAVIGATION ROW
            --------------------------------------------------------- */}
        <div
          className="
            flex
            min-h-[48px]
            items-center
            justify-between
            border-t
            border-[var(--line)]
            bg-[var(--paper)]
            px-4
          "
        >
          <div
            className="
              font-[var(--font-inter)]
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.12em]
              text-[var(--muted)]
            "
          >
            Navigation
          </div>

          {/* Menu button */}
          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
            className="
              inline-flex
              h-[34px]
              items-center
              justify-center
              rounded-[8px]
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
            {menuOpen ? 'Close' : 'Menu'}
          </button>
        </div>

        {/* ---------------------------------------------------------
            MOBILE MENU
            --------------------------------------------------------- */}
        {menuOpen && (
          <div className="border-t border-[var(--line)] bg-[var(--cream)] px-4 pb-5">
            <nav className="flex flex-col">

              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="
                    border-b
                    border-[var(--line)]
                    py-3.5
                    font-[var(--font-inter)]
                    text-[14px]
                    font-medium
                    text-[var(--ink)]
                  "
                >
                  {item.label}
                </Link>
              ))}

              {/* Extra actions */}
              <div className="mt-4 flex gap-2">

                <Link
                  href="/teachers"
                  onClick={() => setMenuOpen(false)}
                  className="
                    flex-1
                    border
                    border-[var(--line)]
                    px-3
                    py-2.5
                    text-center
                    text-xs
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
                    border
                    border-[var(--line)]
                    px-3
                    py-2.5
                    text-center
                    text-xs
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
                    flex-1
                    bg-[var(--brand-color)]
                    px-3
                    py-2.5
                    text-center
                    text-xs
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
            min-h-[68px]
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
                mr-3
                flex
                h-[46px]
                w-[46px]
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
            <Link href="/" className="block min-w-0">

              <div
                className="
                  truncate
                  font-[var(--font-manrope)]
                  text-[17px]
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
                    truncate
                    font-[var(--font-inter)]
                    text-[8px]
                    font-medium
                    uppercase
                    leading-[1.2]
                    tracking-[0.18em]
                    text-[var(--muted)]
                  "
                >
                  {motto}
                </div>
              )}

            </Link>
          </div>

          {/* Desktop utility actions */}
          <div className="ml-5 flex shrink-0 items-center gap-4">

            <Link
              href="/teachers"
              className="
                font-[var(--font-inter)]
                text-[10px]
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
                text-[10px]
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
                h-[30px]
                items-center
                justify-center
                bg-[var(--brand-color)]
                px-4
                font-[var(--font-inter)]
                text-[10px]
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
            DESKTOP NAVIGATION ROW
            --------------------------------------------------------- */}
        <div
          className="
            border-t
            border-[var(--line)]
            bg-[var(--cream)]
          "
        >
          <div
            className="
              mx-auto
              flex
              min-h-[40px]
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
                    h-[40px]
                    shrink-0
                    items-center
                    px-2.5
                    font-[var(--font-inter)]
                    text-[10px]
                    font-medium
                    text-[var(--muted)]
                    transition-colors
                    hover:text-[var(--ink)]
                    ${index === 0 ? 'pl-0' : ''}
                  `}
                >
                  {item.label}

                  {/* Active Home indicator */}
                  {index === 0 && (
                    <span
                      className="
                        absolute
                        bottom-0
                        left-2.5
                        right-2.5
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
          h-[3px]
          w-full
          bg-[var(--gold)]
        "
      />
    </header>
  );
          }
