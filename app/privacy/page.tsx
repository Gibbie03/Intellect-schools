import { headers } from 'next/headers';
import { getSchoolFromHost } from '@/lib/tenant';

export default async function PrivacyPage() {
  const headersList = await headers();
  const school = await getSchoolFromHost(headersList.get('host'));
  const name = school?.name ?? 'SchoolOS';

  return (
    <main>
      <section
        className="py-13"
        style={{ background: 'linear-gradient(135deg, var(--ink) 0%, color-mix(in srgb, var(--brand-color) 70%, black) 100%)' }}
      >
        <div className="wrap">
          <span className="tag tag-light">Data protection</span>
          <h1 className="text-white" style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}>
            Privacy &amp; data protection
          </h1>
          <p className="mt-3.5 text-[15.5px] text-white/80">How {name} handles student, staff, and parent records.</p>
        </div>
      </section>

      <section className="wrap py-16" style={{ maxWidth: 760 }}>
        <div className="space-y-8 text-[15px] leading-[1.7] text-[var(--muted)]">
          <div>
            <h2 className="mb-2 text-xl font-semibold text-[var(--ink)]">Who owns the data</h2>
            <p>
              {name} owns every student, staff, admissions, and results record entered into this system. SchoolOS, the
              platform this site runs on, processes that data only on the school&rsquo;s behalf &mdash; it is never
              sold, shared with other schools, or used to train any external service.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold text-[var(--ink)]">What is collected</h2>
            <p>
              Student records (name, class, department, parent/guardian contact details, academic results, attendance,
              and fee status), staff records (name, role, contact details, and employment status), and admissions
              enquiries submitted through the public admissions form. Result-checker access is by PIN card, not a
              student login, so no separate student account credentials are stored.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold text-[var(--ink)]">How it is protected</h2>
            <p>
              Staff logins are hashed, never stored in plain text, and can be protected with two-factor authentication.
              Every result approval, report card publish, and record deletion is recorded in an audit log showing who
              did what and when. Each school&rsquo;s records are isolated from every other school on the platform.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold text-[var(--ink)]">Retention and export</h2>
            <p>
              Records are kept for as long as the school&rsquo;s account is active. A school&rsquo;s administrator can
              request a full export of that school&rsquo;s data at any time, and again at the end of the school&rsquo;s
              engagement with SchoolOS &mdash; ownership of the data does not depend on the school continuing to use
              the platform.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold text-[var(--ink)]">Questions</h2>
            <p>
              Parents or staff with questions about their records should contact {name} directly through the{' '}
              <a href="/contact" className="underline hover:no-underline">
                Contact
              </a>{' '}
              page.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
