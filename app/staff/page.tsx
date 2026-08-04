'use client';

import { useEffect, useState } from 'react';

type StaffMember = {
  id: string;
  full_name: string;
  role: string;
  subject: string | null;
  photo_url: string | null;
  bio: string | null;
};

export default function StaffDirectoryPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/staff-directory')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setStaff(data.staff ?? []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      <section
        className="py-13"
        style={{ background: 'linear-gradient(135deg, var(--ink) 0%, color-mix(in srgb, var(--brand-color) 35%, black) 100%)' }}
      >
        <div className="wrap">
          <span className="tag tag-light">Our people</span>
          <h1 className="text-white" style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}>
            Meet the teachers
          </h1>
          <p className="mt-3.5 text-[15.5px] text-white/80">The people behind the classroom.</p>
        </div>
      </section>

      <section className="wrap py-16">
        {loading && <p className="text-[var(--muted)]">Loading…</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && staff.length === 0 && <p className="text-[var(--muted)]">No staff profiles published yet.</p>}

        <div className="schools-grid">
          {staff.map((member) => (
            <div key={member.id} className="p-6.5 text-center" style={{ background: 'var(--paper)' }}>
              {member.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={member.photo_url}
                  alt={member.full_name}
                  className="mx-auto h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <div
                  className="mx-auto flex h-24 w-24 items-center justify-center rounded-full text-2xl font-bold"
                  style={{ background: 'var(--brand-tint)', color: 'var(--brand-color)' }}
                >
                  {member.full_name.charAt(0)}
                </div>
              )}
              <p className="mt-4 mb-0.5 font-semibold">{member.full_name}</p>
              <p className="m-0 text-[13px] text-[var(--brand-color-2)]">
                {member.role}
                {member.subject ? `, ${member.subject}` : ''}
              </p>
              {member.bio && (
                <p className="mt-3 text-[13.5px] leading-[1.55] text-[var(--muted)]">{member.bio}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
