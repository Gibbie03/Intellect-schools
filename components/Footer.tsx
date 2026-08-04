'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const footerLinks = [
  { href: '/news', label: 'News' },
  { href: '/staff', label: 'Staff' },
  { href: '/contact', label: 'Contact' },
  { href: '/portal', label: 'Student Portal' },
  { href: '/privacy', label: 'Privacy' },
];

export default function Footer({ schoolName, isLanding }: { schoolName: string; isLanding?: boolean }) {
  const pathname = usePathname();
  const isPlatform = pathname?.startsWith('/platform');
  const name = isPlatform ? 'SchoolOS' : schoolName;

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/teacher-dashboard')) {
    return null;
  }

  if (isPlatform) {
    return (
      <footer className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-8 flex flex-wrap items-center justify-between gap-4 text-sm text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} {name}. All rights reserved.
          </p>
          <Link href="/privacy" className="hover:text-gray-800">
            Privacy
          </Link>
        </div>
      </footer>
    );
  }

  if (isLanding) {
    return (
      <footer
        className="flex flex-col items-center gap-2 py-8 text-center text-[13px]"
        style={{ background: '#12172f', color: 'rgba(255,255,255,.55)' }}
      >
        <span>&copy; {new Date().getFullYear()} SchoolOS. A platform for Nigerian school proprietors.</span>
        <Link href="/privacy" className="hover:text-white">
          Privacy
        </Link>
      </footer>
    );
  }

  return (
    <footer style={{ background: 'var(--footer-color, var(--ink))', color: 'rgba(255,255,255,.6)' }}>
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
