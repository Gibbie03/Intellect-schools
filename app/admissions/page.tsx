'use client';

import { useEffect, useState } from 'react';
import { CLASSES } from '@/lib/constants';

const emptyForm = {
  studentName: '',
  dateOfBirth: '',
  gender: '',
  classApplyingFor: CLASSES[0],
  parentName: '',
  parentEmail: '',
  parentPhone: '',
  address: '',
  notes: '',
};

const STEPS = [
  {
    label: 'Step 1',
    title: 'Inquire',
    body: 'Submit an inquiry, and our admissions office will get in touch with more information and a checklist.',
  },
  {
    label: 'Step 2',
    title: 'Tour & interview',
    body: 'Visit campus, sit in on a class, and meet with admissions for a short family interview.',
  },
  {
    label: 'Step 3',
    title: 'Apply',
    body: 'Complete the application below with the student and parent/guardian details we need to process it.',
  },
  {
    label: 'Step 4',
    title: 'Enroll',
    body: 'Accepted families receive an offer; a signed enrollment form and deposit secure the place.',
  },
];

const REQUIREMENTS = [
  'Completed application form',
  'Two years of academic transcripts (where applicable)',
  'Birth certificate or age declaration',
  'Teacher recommendation letter',
  'Immunization records',
  'Non-refundable registration fee',
];

function CheckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--brand-color)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default function AdmissionsPage() {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [schoolName, setSchoolName] = useState('the school');
  const [prospectusUrl, setProspectusUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/school')
      .then((res) => res.json())
      .then((data) => {
        if (data.name) setSchoolName(data.name);
        if (data.prospectusUrl) setProspectusUrl(data.prospectusUrl);
      });
  }, []);

  const handleChange = (field: keyof typeof emptyForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit application.');

      setSubmitted(true);
      setForm(emptyForm);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main>
      <section
        className="py-14"
        style={{ background: 'linear-gradient(135deg, var(--ink) 0%, color-mix(in srgb, var(--brand-color) 70%, black) 100%)' }}
      >
        <div className="wrap">
          <span className="tag tag-light">Admissions</span>
          <h1 className="max-w-[18ch] text-white" style={{ fontSize: 'clamp(30px, 4.5vw, 48px)', lineHeight: 1.12 }}>
            We take as much care choosing you as you take choosing us.
          </h1>
          <p className="mt-5 max-w-[58ch] text-[16.5px] leading-[1.65] text-white/82">
            Apply for admission to {schoolName}. Our process is unhurried and personal — here&apos;s how a family
            moves from first inquiry to a first day of school.
          </p>
        </div>
      </section>

      <section className="wrap pb-6 pt-14">
        <h2 className="mb-7 text-[28px]">The admission process</h2>
        <div className="schools-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {STEPS.map((step, i) => (
            <div key={step.title} className={`card ${i % 2 === 1 ? 'card-accent' : ''}`}>
              <div className="mb-2.5 text-xs font-bold uppercase tracking-[0.06em] text-[var(--brand-color-2)]">
                {step.label}
              </div>
              <div className="font-display mb-2 text-[17px] font-extrabold">{step.title}</div>
              <p className="m-0 text-[13.5px] leading-[1.55] text-[var(--muted)]">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap py-10">
        <h2 className="mb-7 text-[28px]">Requirements</h2>
        <div className="grid gap-x-10 gap-y-3.5 sm:grid-cols-2">
          {REQUIREMENTS.map((req) => (
            <div key={req} className="flex items-center gap-2.5 text-[15px]">
              <CheckIcon />
              {req}
            </div>
          ))}
        </div>
      </section>

      <section className="wrap pb-16 pt-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-5">
          <h2 className="text-[28px]">Apply now</h2>
          {prospectusUrl && (
            <a href={prospectusUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
              Download prospectus
            </a>
          )}
        </div>

        {submitted ? (
          <div className="card text-center">
            <h3 className="font-display text-2xl text-[var(--brand-color)]">Application submitted</h3>
            <p className="mt-3 text-[var(--muted)]">
              Thank you for applying to {schoolName}. Our admissions team will review your application and contact
              you via the email or phone number provided.
            </p>
            <button onClick={() => setSubmitted(false)} className="btn btn-primary mt-6">
              Submit another application
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 bg-[var(--paper)] p-8 shadow-sm md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">Student Full Name</label>
              <input
                type="text"
                required
                value={form.studentName}
                onChange={(e) => handleChange('studentName', e.target.value)}
                className="w-full border border-[var(--line)] p-3"
                placeholder="e.g. Chidera Nwosu"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Date of Birth</label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                className="w-full border border-[var(--line)] p-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Gender</label>
              <select
                value={form.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-full border border-[var(--line)] p-3"
              >
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">Class Applying For</label>
              <select
                value={form.classApplyingFor}
                onChange={(e) => handleChange('classApplyingFor', e.target.value)}
                className="w-full border border-[var(--line)] p-3"
              >
                {CLASSES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Parent/Guardian Name</label>
              <input
                type="text"
                required
                value={form.parentName}
                onChange={(e) => handleChange('parentName', e.target.value)}
                className="w-full border border-[var(--line)] p-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Parent/Guardian Phone</label>
              <input
                type="tel"
                required
                value={form.parentPhone}
                onChange={(e) => handleChange('parentPhone', e.target.value)}
                className="w-full border border-[var(--line)] p-3"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">Parent/Guardian Email</label>
              <input
                type="email"
                required
                value={form.parentEmail}
                onChange={(e) => handleChange('parentEmail', e.target.value)}
                className="w-full border border-[var(--line)] p-3"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">Home Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full border border-[var(--line)] p-3"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">Additional Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
                className="w-full border border-[var(--line)] p-3"
              />
            </div>

            {error && <p className="text-sm text-red-600 md:col-span-2">{error}</p>}

            <div className="md:col-span-2">
              <button type="submit" disabled={submitting} className="btn btn-primary w-full justify-center disabled:opacity-60">
                {submitting ? 'Submitting…' : 'Submit Application'}
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
