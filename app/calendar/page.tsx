'use client';

import { useEffect, useState } from 'react';
import { SESSIONS, TERMS, CURRENT_SESSION } from '@/lib/grade';

type CalendarEntry = {
  id: string;
  session: string;
  term: string | null;
  title: string;
  event_type: 'Resumption' | 'Midterm Break' | 'Closing' | 'Holiday' | 'Other';
  start_date: string;
  end_date: string | null;
};

const TYPE_STYLES: Record<CalendarEntry['event_type'], string> = {
  Resumption: 'bg-green-100 text-green-800',
  'Midterm Break': 'bg-amber-100 text-amber-800',
  Closing: 'bg-blue-100 text-blue-800',
  Holiday: 'bg-purple-100 text-purple-800',
  Other: 'bg-gray-100 text-gray-700',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

export default function CalendarPage() {
  const [selectedSession, setSelectedSession] = useState(CURRENT_SESSION);
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/academic-calendar?session=${encodeURIComponent(selectedSession)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setEntries(data.entries ?? []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedSession]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const groups = new Map<string, CalendarEntry[]>();
  entries.forEach((e) => {
    const key = e.term || 'Whole Session';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(e);
  });
  const groupOrder = [...TERMS, 'Whole Session'].filter((key) => groups.has(key));

  return (
    <main>
      <section
        className="py-12"
        style={{ background: 'linear-gradient(135deg, var(--ink) 0%, color-mix(in srgb, var(--brand-color) 70%, black) 100%)' }}
      >
        <div className="wrap" style={{ maxWidth: 900 }}>
          <span className="tag tag-light">Academics</span>
          <h1 className="text-white" style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}>
            Academic Calendar
          </h1>
          <p className="mt-3.5 text-[15.5px] text-white/80">
            Term dates, resumption/closing days, mid-term breaks, and holidays.
          </p>
        </div>
      </section>

      <div className="wrap py-10" style={{ maxWidth: 900 }}>
        <select
          value={selectedSession}
          onChange={(e) => setSelectedSession(e.target.value)}
          className="mb-5 border border-[var(--line)] bg-[var(--paper)] p-3 text-sm"
        >
          {SESSIONS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        {loading && <p className="text-[var(--muted)]">Loading…</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && entries.length === 0 && (
          <p className="text-[var(--muted)]">No calendar has been published for {selectedSession} yet.</p>
        )}

        {!loading &&
          !error &&
          groupOrder.map((groupKey) => (
            <div key={groupKey} className="mb-8">
              <p className="mb-3 text-[11.5px] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">{groupKey}</p>
              <div className="grid gap-3">
                {groups.get(groupKey)!.map((entry) => {
                  const isPast = new Date(entry.end_date || entry.start_date) < today;
                  return (
                    <div
                      key={entry.id}
                      className={`flex flex-wrap items-center justify-between gap-2.5 bg-[var(--paper)] px-5 py-4.5 ${
                        isPast ? 'opacity-55' : ''
                      }`}
                    >
                      <div>
                        <p className="m-0 font-semibold">{entry.title}</p>
                        <p className="mt-1 text-[13px] text-[var(--muted)]">
                          {formatDate(entry.start_date)}
                          {entry.end_date && ` – ${formatDate(entry.end_date)}`}
                        </p>
                      </div>
                      <span className={`pill ${TYPE_STYLES[entry.event_type]}`}>{entry.event_type}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
      </div>
    </main>
  );
}
