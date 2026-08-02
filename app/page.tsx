import Link from 'next/link';
import { headers } from 'next/headers';
import { getSchoolFromHost } from '@/lib/tenant';
import LandingPage from '@/components/LandingPage';

export default async function Home() {
  const headersList = await headers();
  const school = await getSchoolFromHost(headersList.get('host'));

  if (!school) {
    return <LandingPage />;
  }

  const name = school.name;
  const tagline = school.tagline || 'Building confident learners for a brighter future.';
  const heroImageUrl = school.hero_image_url;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <section
        className={`mx-auto flex max-w-6xl flex-col gap-12 px-6 py-12 lg:py-20 ${
          heroImageUrl ? 'lg:flex-row lg:items-center' : ''
        }`}
      >
        <div className="flex-1">
          <p className="mb-4 inline-flex rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-[var(--brand-color)]">
            Welcome to {name}
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-950 sm:text-6xl">{tagline}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            {name} combines academic excellence, digital learning, and transparent result management for students, parents, teachers, and administrators.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/admissions" className="rounded-xl bg-[var(--brand-color)] px-6 py-3 font-semibold text-white shadow hover:brightness-90">
              Apply for Admission
            </Link>
            <Link href="/portal" className="rounded-xl border border-[var(--brand-color)] px-6 py-3 font-semibold text-[var(--brand-color)] hover:bg-gray-50">
              Student Portal
            </Link>
            <Link href="/contact" className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-800 hover:bg-white">
              Contact Us
            </Link>
          </div>
        </div>

        {heroImageUrl && (
          <div className="flex-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImageUrl}
              alt={`${name} campus`}
              className="w-full rounded-3xl object-cover shadow-xl"
              style={{ maxHeight: '420px' }}
            />
          </div>
        )}
      </section>
    </main>
  );
}
