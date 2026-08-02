'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const footerLinks = [
  { href: '/news', label: 'News' },
  { href: '/staff', label: 'Staff' },
  { href: '/contact', label: 'Contact' },
  { href: '/portal', label: 'Student Portal' },
];

export default function Footer({ schoolName }: { schoolName: string }) {
  const pathname = usePathname();
  const isPlatform = pathname?.startsWith('/platform');
  const name = isPlatform ? 'SchoolOS' : schoolName;

  if (isPlatform) {
    return (
      <footer className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} {name}. All rights reserved.
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer style={{ background: 'var(--ink)', color: 'rgba(255,255,255,.6)' }}>
      <div className="wrap flex flex-col items-center gap-4 py-8 text-sm sm:flex-row sm:justify-between">
        <p>
          &copy; {new Date().getFullYear()} {name}. All rights reserved.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-5">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-white">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
