'use client';

import { useEffect, useState } from 'react';

const CATEGORIES = ['General Enquiry', 'Suggestion', 'Complaint', 'Other'];

const emptyForm = { name: '', email: '', phone: '', subject: '', message: '', category: CATEGORIES[0] };

function ContactIcon({ path, viewBox = '0 0 24 24' }: { path: React.ReactNode; viewBox?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox={viewBox}
      fill="none"
      stroke="var(--gold)"
      strokeWidth={2}
      className="mt-px shrink-0"
    >
      {path}
    </svg>
  );
}

export default function ContactPage() {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [address, setAddress] = useState<string | null>(null);
  const [contactEmail, setContactEmail] = useState<string | null>(null);
  const [contactPhone, setContactPhone] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/school')
      .then((res) => res.json())
      .then((data) => {
        if (data.address) setAddress(data.address);
        if (data.contactEmail) setContactEmail(data.contactEmail);
        if (data.contactPhone) setContactPhone(data.contactPhone);
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
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send message.');

      setSubmitted(true);
      setForm(emptyForm);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const hasContactCard = address || contactPhone || contactEmail;

  return (
    <main>
      <section
        className="py-12"
        style={{ background: 'linear-gradient(135deg, var(--ink) 0%, color-mix(in srgb, var(--brand-color) 70%, black) 100%)' }}
      >
        <div className="wrap" style={{ maxWidth: 900 }}>
          <span className="tag tag-light">Get in touch</span>
          <h1 className="text-white" style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}>
            Contact us
          </h1>
          <p className="mt-3.5 text-[15.5px] text-white/80">
            Have a question, suggestion or complaint? Send us a message and we&apos;ll get back to you.
          </p>
        </div>
      </section>

      <section className="wrap py-14" style={{ maxWidth: 900 }}>
        <div className={`grid gap-8 ${hasContactCard ? 'md:grid-cols-[1.2fr_0.8fr]' : ''} items-start`}>
          {submitted ? (
            <div className="card text-center">
              <h2 className="font-display text-xl text-[var(--brand-color)]">Message sent</h2>
              <p className="mt-2 text-[var(--muted)]">Thank you for reaching out. We will respond as soon as possible.</p>
              <button onClick={() => setSubmitted(false)} className="btn btn-primary mt-6">
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4.5 bg-[var(--paper)] p-8">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full border border-[var(--line)] p-3"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full border border-[var(--line)] p-3"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">Phone (optional)</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full border border-[var(--line)] p-3"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">What is this about?</label>
                <select
                  value={form.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full border border-[var(--line)] p-3"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">Subject</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  className="w-full border border-[var(--line)] p-3"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">Message</label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  className="w-full border border-[var(--line)] p-3"
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button type="submit" disabled={submitting} className="btn btn-primary w-full justify-center disabled:opacity-60">
                {submitting ? 'Sending…' : 'Send message'}
              </button>
            </form>
          )}

          {hasContactCard && (
            <div className="flex flex-col gap-4 p-7" style={{ background: 'var(--ink)', color: '#fff' }}>
              <h3 className="text-lg text-white">Visit or write to us</h3>
              {address && (
                <div className="flex gap-3 text-sm">
                  <ContactIcon path={<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></>} />
                  <span>{address}</span>
                </div>
              )}
              {contactPhone && (
                <div className="flex gap-3 text-sm">
                  <ContactIcon
                    path={
                      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2.1.7 3.1a2 2 0 0 1-.5 2.1L8 10.5a16 16 0 0 0 6 6l1.6-1.3a2 2 0 0 1 2.1-.5c1 .3 2 .6 3.1.7a2 2 0 0 1 1.2 2z" />
                    }
                  />
                  <span>{contactPhone}</span>
                </div>
              )}
              {contactEmail && (
                <div className="flex gap-3 text-sm">
                  <ContactIcon path={<><path d="M4 4h16v16H4z" /><path d="m4 6 8 7 8-7" /></>} />
                  <span>{contactEmail}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {address && (
          <div className="frame mt-10 overflow-hidden">
            <iframe
              title="School location"
              src={`https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
              className="h-72 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        )}
      </section>
    </main>
  );
}
