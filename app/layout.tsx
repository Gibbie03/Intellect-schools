import type { Metadata } from 'next';
import { Manrope, Inter } from 'next/font/google';
import { headers } from 'next/headers';
import './globals.css';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';

import { generateBrandPalette } from '@/lib/colors';
import { getSchoolFromHost } from '@/lib/tenant';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['500', '700', '800'],
  variable: '--font-manrope',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
});

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const school = await getSchoolFromHost(headersList.get('host'));

  if (!school) {
    return {
      title: 'SchoolOS — The all-in-one platform to run your school online',
      description:
        'Websites, admissions, results, and staff logins for private schools — with your own custom domain, live in 48 hours.',
    };
  }

  return {
    title: school.name,
    description: `${school.name} website with student portal, teacher uploads, and admin dashboard.`,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const school = await getSchoolFromHost(headersList.get('host'));

  /*
   * WEBSITE TEMPLATE
   *
   * We deliberately use the existing `template` column from the schools
   * table instead of `navbar_style`.
   *
   * This avoids the TypeScript error caused by navbar_style not existing
   * in Database['public']['Tables']['schools']['Row'].
   *
   * Supported navbar modes:
   *
   * - default  -> cream/classical navbar
   * - modern   -> light modern navbar
   * - branded  -> school-colour navbar
   *
   * Unknown/missing values safely fall back to default.
   */
  const rawTemplate = school?.template?.toLowerCase().trim();

  const navbarStyle =
    rawTemplate === 'modern'
      ? 'modern'
      : rawTemplate === 'branded'
        ? 'branded'
        : 'default';

  /*
   * BRAND COLOURS
   */
  const brandColor = school?.primary_color || '#15803d';

  const palette = generateBrandPalette(brandColor);

  const brandColor2 =
    school?.secondary_color || '#b23324';

  /*
   * SITE COLOURS
   */
  const footerColor =
    school?.footer_color || '#15201a';

  const inkColor =
    school?.ink_color || '#15201a';

  const mutedColor =
    school?.muted_color || '#6d7568';

  const paperColor =
    school?.paper_color || '#ffffff';

  /*
   * IMPORTANT:
   *
   * Default website background is cream.
   * The navbar itself will use --cream in default mode.
   */
  const creamColor =
    school?.cream_color || '#faf6ee';

  const lineColor =
    school?.line_color || '#e4ddd0';

  const goldColor =
    school?.gold_color || '#c9a35a';

  return (
    <html
      lang="en"
      className={`${manrope.variable} ${inter.variable}`}
      style={
        {
          '--brand-color': palette[500],
          '--brand-100': palette[100],
          '--brand-300': palette[300],
          '--brand-500': palette[500],
          '--brand-700': palette[700],
          '--brand-900': palette[900],

          '--color-primary': 'var(--brand-500)',
          '--color-primary-hover': 'var(--brand-700)',

          '--color-navbar': 'var(--brand-700)',
          '--color-footer': 'var(--brand-900)',
          '--color-hero': 'var(--brand-900)',

          '--color-card': 'var(--brand-100)',
          '--color-tag': 'var(--brand-300)',

          '--color-link': 'var(--brand-500)',

          '--brand-color-2': brandColor2,

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
          navbarStyle={navbarStyle}
          isLanding={!school}
        />

        <div className="flex-1">
          {children}
        </div>

        <Footer
          schoolName={school?.name ?? 'SchoolOS'}
          isLanding={!school}
        />

        {school?.whatsapp_number && (
          <WhatsAppButton
            phone={school.whatsapp_number}
            schoolName={school.name}
          />
        )}
      </body>
    </html>
  );
}
