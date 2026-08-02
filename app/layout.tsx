import type { Metadata } from 'next';
import { headers } from 'next/headers';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { getSchoolFromHost } from '@/lib/tenant';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const school = await getSchoolFromHost(headersList.get('host'));

  if (!school) {
    return {
      title: 'SchoolOS — The all-in-one platform to run your school online',
      description: 'Websites, admissions, results, and staff logins for private schools — with your own custom domain, live in 48 hours.',
    };
  }

  return {
    title: school.name,
    description: `${school.name} website with student portal, teacher uploads, and admin dashboard.`,
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const headersList = await headers();
  const school = await getSchoolFromHost(headersList.get('host'));
  const brandColor = school?.primary_color || '#15803d';

  return (
    <html lang="en" style={{ '--brand-color': brandColor } as React.CSSProperties}>
      <body className="flex min-h-screen flex-col">
        <Navbar schoolName={school?.name ?? 'SchoolOS'} isLanding={!school} />
        <div className="flex-1">{children}</div>
        <Footer schoolName={school?.name ?? 'SchoolOS'} />
        {school?.whatsapp_number && <WhatsAppButton phone={school.whatsapp_number} schoolName={school.name} />}
      </body>
    </html>
  );
}
