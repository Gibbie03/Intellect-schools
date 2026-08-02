import Link from 'next/link';
import { headers } from 'next/headers';
import { getSchoolFromHost } from '@/lib/tenant';
import { getSupabaseClient } from '@/lib/supabase';
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
  const welcomeMessage = school.principal_welcome_message;
  const principalPhotoUrl = school.principal_photo_url;

  const supabase = getSupabaseClient();
  const { data: testimonials } = await supabase
    .from('testimonials')
    .select('*')
    .eq('school_id', school.id)
    .order('created_at', { ascending: false })
    .limit(6);

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

      {welcomeMessage && (
        <section className="mx-auto max-w-5xl px-6 pb-16 lg:pb-24">
          <div className="flex flex-col gap-8 rounded-3xl bg-white p-8 shadow-xl sm:p-12 lg:flex-row lg:items-center">
            {principalPhotoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={principalPhotoUrl}
                alt="Principal"
                className="h-32 w-32 shrink-0 rounded-full object-cover shadow lg:h-40 lg:w-40"
              />
            )}
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--brand-color)]">
                A Message from the Principal
              </p>
              <p className="whitespace-pre-wrap text-lg leading-8 text-gray-700">{welcomeMessage}</p>
            </div>
          </div>
        </section>
      )}

      {testimonials && testimonials.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-16 lg:pb-24">
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">What Our Community Says</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.id} className="flex flex-col rounded-2xl bg-white p-6 shadow">
                <p className="flex-1 text-gray-600">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-4 flex items-center gap-3">
                  {t.photo_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.photo_url} alt={t.author_name} className="h-10 w-10 rounded-full object-cover" />
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{t.author_name}</p>
                    {t.author_role && <p className="text-xs text-gray-500">{t.author_role}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
