import type { Metadata } from 'next';
import { headers } from 'next/headers';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getSchoolFromHost } from '@/lib/tenant';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const school = await getSchoolFromHost(headersList.get('host'));
  const name = school?.name ?? 'School Portal';

  return {
    title: name,
    description: `${name} website with student portal, teacher uploads, and admin dashboard.`,
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const headersList = await headers();
  const school = await getSchoolFromHost(headersList.get('host'));
  const brandColor = school?.primary_color || '#15803d';

  return (
    <html lang="en" style={{ '--brand-color': brandColor } as React.CSSProperties}>
      <body className="flex min-h-screen flex-col">
        <Navbar schoolName={school?.name ?? 'School Portal'} />
        <div className="flex-1">{children}</div>
        <Footer schoolName={school?.name ?? 'School Portal'} />
      </body>
    </html>
  );
}
