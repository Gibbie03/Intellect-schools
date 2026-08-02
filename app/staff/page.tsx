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
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-4xl font-bold">Meet the Teachers</h1>
      <p className="mt-3 text-gray-600">The people behind the classroom.</p>

      {loading && <p className="mt-10 text-gray-500">Loading...</p>}
      {error && <p className="mt-10 text-red-600">{error}</p>}
      {!loading && !error && staff.length === 0 && <p className="mt-10 text-gray-500">No staff profiles published yet.</p>}

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {staff.map((member) => (
          <div key={member.id} className="rounded-2xl bg-white p-6 text-center shadow">
            {member.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={member.photo_url}
                alt={member.full_name}
                className="mx-auto h-28 w-28 rounded-full object-cover shadow"
              />
            ) : (
              <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gray-100 text-3xl font-bold text-gray-400">
                {member.full_name.charAt(0)}
              </div>
            )}
            <p className="mt-4 text-lg font-semibold">{member.full_name}</p>
            <p className="text-sm text-[var(--brand-color)]">
              {member.role}
              {member.subject ? ` — ${member.subject}` : ''}
            </p>
            {member.bio && <p className="mt-3 text-sm text-gray-600">{member.bio}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
