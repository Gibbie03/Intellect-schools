import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Intellect Schools',
  description: 'A modern school website with student portal, teacher uploads, and admin dashboard.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
