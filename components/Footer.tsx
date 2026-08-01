'use client';

import { usePathname } from 'next/navigation';

export default function Footer({ schoolName }: { schoolName: string }) {
  const pathname = usePathname();
  const name = pathname?.startsWith('/platform') ? 'SchoolOS' : schoolName;

  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} {name}. All rights reserved.</p>
      </div>
    </footer>
  );
}
