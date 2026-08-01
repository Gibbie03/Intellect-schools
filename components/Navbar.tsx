'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const links = [
  { href: '/', label: 'Home' },
  { href: '/admissions', label: 'Admissions' },
  { href: '/news', label: 'News & Events' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/contact', label: 'Contact' },
  { href: '/portal', label: 'Student Portal' },
  { href: '/teacher-dashboard', label: 'Teachers' },
  { href: '/admin', label: 'Admin' },
];

export default function Navbar({ schoolName }: { schoolName: string }) {
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

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-extrabold text-[var(--brand-color)]">
          {schoolName}
        </Link>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 md:hidden"
          aria-label="Toggle navigation"
        >
          Menu
        </button>

        <div className="hidden gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                pathname === link.href
                  ? 'bg-[var(--brand-color)] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      {open && (
        <div className="flex flex-col gap-1 border-t border-gray-100 px-6 py-4 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                pathname === link.href
                  ? 'bg-[var(--brand-color)] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
