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

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <div className="rounded-3xl bg-gray-50 p-10">
          <h1 className="text-3xl font-bold text-[var(--brand-color)]">Application Submitted</h1>
          <p className="mt-4 text-gray-600">
            Thank you for applying to {schoolName}. Our admissions team will review your application and
            contact you via the email or phone number provided.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-8 rounded-xl bg-[var(--brand-color)] px-6 py-3 font-semibold text-white hover:brightness-90"
          >
            Submit another application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-4xl font-bold">Admissions</h1>
      <p className="mt-3 text-gray-600">
        Apply for admission to {schoolName}. Fill in the form below and our admissions team will get in
        touch with you.
      </p>

      {prospectusUrl && (
        <a
          href={prospectusUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[var(--brand-color)] px-5 py-3 font-semibold text-[var(--brand-color)] hover:bg-gray-50"
        >
          Download Prospectus (PDF)
        </a>
      )}

      <form onSubmit={handleSubmit} className="mt-10 grid grid-cols-1 gap-6 rounded-2xl bg-white p-8 shadow md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium">Student Full Name</label>
          <input
            type="text"
            required
            value={form.studentName}
            onChange={(e) => handleChange('studentName', e.target.value)}
            className="w-full rounded-xl border p-3"
            placeholder="e.g. Chidera Nwosu"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Date of Birth</label>
          <input
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
            className="w-full rounded-xl border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Gender</label>
          <select
            value={form.gender}
            onChange={(e) => handleChange('gender', e.target.value)}
            className="w-full rounded-xl border p-3"
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
            className="w-full rounded-xl border p-3"
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
            className="w-full rounded-xl border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Parent/Guardian Phone</label>
          <input
            type="tel"
            required
            value={form.parentPhone}
            onChange={(e) => handleChange('parentPhone', e.target.value)}
            className="w-full rounded-xl border p-3"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium">Parent/Guardian Email</label>
          <input
            type="email"
            required
            value={form.parentEmail}
            onChange={(e) => handleChange('parentEmail', e.target.value)}
            className="w-full rounded-xl border p-3"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium">Home Address</label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => handleChange('address', e.target.value)}
            className="w-full rounded-xl border p-3"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium">Additional Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={3}
            className="w-full rounded-xl border p-3"
          />
        </div>

        {error && <p className="md:col-span-2 text-sm text-red-600">{error}</p>}

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-[var(--brand-color)] py-3 font-semibold text-white hover:brightness-90 disabled:opacity-60"
          >
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
}
