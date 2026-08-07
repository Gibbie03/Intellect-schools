import type { Metadata } from 'next';
import { Manrope, Inter } from 'next/font/google';
import { headers } from 'next/headers';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { heroOverlayColor } from "@/lib/colors";
import WhatsAppButton from '@/components/WhatsAppButton';
import { getSchoolFromHost } from '@/lib/tenant';

const manrope = Manrope({ subsets: ['latin'], weight: ['500', '700', '800'], variable: '--font-manrope' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-inter' });

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
  // The classical template's accent moments (tags, card borders, active nav
  // underline, testimonial band) are designed against a distinct accent
  // color, not a tint of the primary -- falling back to primary_color here
  // silently erases that accent for any school that hasn't set one.
  const heroOverlay = heroOverlayColor(brandColor);
  const brandColor2 = school?.secondary_color || '#b23324';
   // Defaults to the platform's standard dark green (matching --ink) unless
  // a school explicitly overrides it in the platform admin dashboard
  const footerColor = school?.footer_color || '#15201a';
  const inkColor = school?.ink_color || '#15201a';
  const mutedColor = school?.muted_color || '#6d7568';
  const paperColor = school?.paper_color || '#ffffff';
  const creamColor = school?.cream_color || '#faf6ee';
  const lineColor = school?.line_color || '#e4ddd0';
  const goldColor = school?.gold_color || '#c9a35a';
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${inter.variable}`}
      style={
        {
          '--brand-color': brandColor,
          '--brand-color-2': brandColor2,
          '--hero-overlay': heroOverlay,
          '--footer-color': footerColor,
          '--ink': inkColor,
          '--muted': mutedColor,
          '--paper': paperColor,
          '--cream': creamColor,
          '--line': lineColor,
          '--gold': goldColor,
        } as React.CSSProperties
      }
    >
      <body className="flex min-h-screen flex-col">
        <Navbar
          schoolName={school?.name ?? 'SchoolOS'}
          logoUrl={school?.logo_url ?? null}
          motto={school?.motto ?? null}
          isLanding={!school}
        />
        <div className="flex-1">{children}</div>
        <Footer schoolName={school?.name ?? 'SchoolOS'} isLanding={!school} />
        {school?.whatsapp_number && <WhatsAppButton phone={school.whatsapp_number} schoolName={school.name} />}
      </body>
    </html>
  );
}
