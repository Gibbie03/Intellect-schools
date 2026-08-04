import { headers } from 'next/headers';
import { getSchoolFromHost } from '@/lib/tenant';
import PageHero from '@/components/PageHero';

export default async function PrivacyPage() {
  const headersList = await headers();
  const school = await getSchoolFromHost(headersList.get('host'));
  const name = school?.name ?? 'SchoolOS';

  return (
    <main>
      <PageHero
        eyebrow="Data protection"
        sectionClassName="py-13"
        title="Privacy & data protection"
        subtitle={<>How {name} handles student, staff, and parent records.</>}
      />

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
            <h2 className="mb-2 text-xl font-semibold text-[var(--ink)]">Legal basis for processing, and children&rsquo;s data</h2>
            <p>
              {name} is the data controller for every record in this system, as defined under the Nigeria Data
              Protection Act, 2023 (NDPA); SchoolOS is the data processor, handling that data only on the
              school&rsquo;s instructions. Almost every student record in this system belongs to a minor. Where a
              student is under 18, {name} processes their data on the basis of the consent given by a parent or
              legal guardian at admission, and, for the ordinary business of educating that student, on the basis
              that the processing is necessary for the provision of education &mdash; both recognised bases under
              the NDPA. Staff and admissions-enquiry data is processed on the basis of {name}&rsquo;s legitimate
              interest in running the school and the contractual relationship of employment.
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
            <h2 className="mb-2 text-xl font-semibold text-[var(--ink)]">Data breaches</h2>
            <p>
              If a breach occurs that is likely to pose a risk to the rights of anyone in this system, {name} and
              SchoolOS will notify the Nigeria Data Protection Commission (NDPC) and any affected individuals within
              the timelines set out in the NDPA, and will keep a record of the breach, its cause, and how it was
              addressed.
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
            <h2 className="mb-2 text-xl font-semibold text-[var(--ink)]">Your rights</h2>
            <p>
              Under the NDPA, a parent or guardian (on behalf of a student), or a staff member, may request access to
              the personal data {name} holds about them, ask for it to be corrected if it is inaccurate, or request
              its erasure where the NDPA permits. {name} will respond to any such request within the time required
              by the NDPA.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold text-[var(--ink)]">Questions</h2>
            <p>
              Parents, staff, or guardians with questions about their records, or wishing to exercise any of the
              rights above, should contact {name} directly through the{' '}
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
