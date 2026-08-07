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

  const [{ count: studentCount }, { count: staffCount }, { data: classRows }, { data: galleryRows }, { data: testimonials }] =
    await Promise.all([
      supabase.from('students').select('*', { count: 'exact', head: true }).eq('school_id', school.id).eq('status', 'Active'),
      supabase.from('teachers').select('*', { count: 'exact', head: true }).eq('school_id', school.id).eq('status', 'Active'),
      supabase.from('students').select('class').eq('school_id', school.id).eq('status', 'Active'),
      supabase
        .from('gallery_images')
        .select('image_url, caption')
        .eq('school_id', school.id)
        .order('created_at', { ascending: false })
        .limit(1),
      supabase.from('testimonials').select('*').eq('school_id', school.id).order('created_at', { ascending: false }).limit(6),
    ]);

  const classCount = new Set((classRows ?? []).map((r) => r.class)).size;
  const campusPhoto = galleryRows?.[0]?.image_url ?? heroImageUrl;
  const testimonialList = testimonials ?? [];
  const marqueeList = testimonialList.length > 0 ? [...testimonialList, ...testimonialList] : [];

  return (
    <main>
      <section className="relative overflow-hidden py-24">
        {heroImageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroImageUrl} alt={`${name} campus`} className="absolute inset-0 h-full w-full object-cover" />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(115deg, color-mix(in srgb, var(--brand-color) 75%, black) 0%, color-mix(in srgb, var(--brand-color) 55%, transparent) 50%, color-mix(in srgb, var(--brand-color) 70%, black) 100%)',
              }}
            />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(115deg, color-mix(in srgb, var(--brand-color) 35%, black) 0%, color-mix(in srgb, var(--brand-color-2) 35%, black) 100%)',
            }}
          />
        )}
        <div className="wrap relative z-10 max-w-2xl">
          <span className="tag tag-light">{school.address || `Welcome to ${name}`}</span>
          <h1 className="text-white" style={{ fontSize: 'clamp(34px, 5vw, 58px)', lineHeight: 1.08 }}>
            {tagline}
          </h1>
          <p className="mt-5 max-w-[52ch] text-[17px] leading-[1.65] text-white/85">
            {name} combines academic excellence, digital learning, and transparent result management for students,
            parents, teachers, and administrators.
          </p>
          <div className="mt-8 flex flex-wrap gap-3.5">
            <Link href="/admissions" className="btn btn-primary">
              Apply for admission
            </Link>
            <Link href="/gallery" className="btn btn-ghost">
              Visit campus life
            </Link>
          </div>
        </div>
      </section>

      <div className="wrap py-11">
        <div className="stat-row">
          <div className="stat">
            <p className="font-display text-[40px] font-extrabold text-[var(--brand-color)]">{studentCount ?? 0}</p>
            <p className="mt-1.5 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--muted)]">Students</p>
          </div>
          <div className="stat">
            <p className="font-display text-[40px] font-extrabold text-[var(--brand-color-2)]">{staffCount ?? 0}</p>
            <p className="mt-1.5 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--muted)]">Teaching staff</p>
          </div>
          <div className="stat">
            <p className="font-display text-[40px] font-extrabold text-[var(--brand-color)]">{classCount}</p>
            <p className="mt-1.5 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--muted)]">Classes offered</p>
          </div>
        </div>
      </div>

      <section className="wrap pb-6 pt-14">
        <span className="tag">Our school</span>
        <h2 className="mb-7 text-3xl">Three stages, one community</h2>
        <div className="schools-grid">
          <div className="card">
            <h3 className="mb-3 text-xl">Primary School</h3>
            <p className="text-[15px] leading-[1.65] text-[var(--muted)]">
              Foundational years focused on literacy, numeracy and curiosity, taught by class teachers who stay with
              their pupils all day.
            </p>
          </div>
          <div className="card card-accent">
            <h3 className="mb-3 text-xl">Junior Secondary</h3>
            <p className="text-[15px] leading-[1.65] text-[var(--muted)]">
              JSS 1&ndash;3 broaden into the sciences, humanities and languages, taught by subject specialists preparing
              students for BECE and beyond.
            </p>
          </div>
          <div className="card">
            <h3 className="mb-3 text-xl">Senior Secondary</h3>
            <p className="text-[15px] leading-[1.65] text-[var(--muted)]">
              SSS 1&ndash;3 prepare students for WAEC and NECO through focused subject specialization, independent study
              and inter-house sports.
            </p>
          </div>
        </div>
      </section>

      <section className="wrap split py-[76px]">
        <div>
          <span className="tag">Campus life</span>
          <h2 className="mb-4 text-[30px]">A campus meant for looking around</h2>
          <p className="max-w-[48ch] text-[15.5px] leading-[1.65] text-[var(--muted)]">
            Academics, athletics, performances and the everyday life of the school. Take a look through the gallery
            for a fuller picture of a term here.
          </p>
          <Link href="/gallery" className="btn btn-outline mt-5">
            See the gallery &rarr;
          </Link>
        </div>
        <figure className="frame m-0 overflow-hidden">
          {campusPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={campusPhoto} alt={`${name} campus`} className="aspect-[4/3] w-full object-cover" />
          ) : (
            <div
              className="flex aspect-[4/3] w-full items-center justify-center text-sm font-semibold text-[var(--muted)]"
              style={{ background: 'var(--brand-tint)' }}
            >
              Campus photos coming soon
            </div>
          )}
        </figure>
      </section>

      {welcomeMessage && (
        <section className="wrap pb-16">
          <div className="card flex flex-col gap-8 lg:flex-row lg:items-center">
            {principalPhotoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={principalPhotoUrl}
                alt="Principal"
                className="h-32 w-32 shrink-0 rounded-full object-cover shadow lg:h-40 lg:w-40"
              />
            )}
            <div>
              <span className="tag">A message from the principal</span>
              <p className="whitespace-pre-wrap text-lg leading-8 text-[var(--ink)]">{welcomeMessage}</p>
            </div>
          </div>
        </section>
      )}

      {marqueeList.length > 0 && (
        <section className="overflow-hidden py-14" style={{ background: 'var(--brand-color-2)' }}>
          <div className="wrap mb-5">
            <span className="tag tag-light">What families say</span>
          </div>
          <div className="marquee-track gap-5">
            {marqueeList.map((t, i) => (
              <div key={`${t.id}-${i}`} className="testi-card">
                <p className="testi-quote">&ldquo;{t.quote}&rdquo;</p>
                <p className="testi-name">
                  {t.author_name}
                  {t.author_role ? ` — ${t.author_role}` : ''}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="wrap py-[72px]">
        <div
          className="flex flex-wrap items-center justify-between gap-6 p-11"
          style={{ background: 'var(--ink)' }}
        >
          <div>
            <h3 className="mb-2 text-2xl text-white">Ready to join us?</h3>
            <p className="max-w-[52ch] text-[15px] text-white/75">
              Applications for the coming term are open through our admissions office — reach out any time to
              schedule a tour.
            </p>
          </div>
          <Link href="/admissions" className="btn btn-primary">
            Start an application
          </Link>
        </div>
      </section>
    </main>
  );
}
