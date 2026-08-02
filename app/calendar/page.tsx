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
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-4xl font-bold">Academic Calendar</h1>
      <p className="mt-3 text-gray-600">Term dates, resumption/closing days, mid-term breaks, and holidays.</p>

      <div className="mt-8">
        <select
          value={selectedSession}
          onChange={(e) => setSelectedSession(e.target.value)}
          className="rounded-xl border p-3"
        >
          {SESSIONS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading && <p className="mt-10 text-gray-500">Loading...</p>}
      {error && <p className="mt-10 text-red-600">{error}</p>}
      {!loading && !error && entries.length === 0 && (
        <p className="mt-10 text-gray-500">No calendar has been published for {selectedSession} yet.</p>
      )}

      {!loading &&
        !error &&
        groupOrder.map((groupKey) => (
          <div key={groupKey} className="mt-10">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">{groupKey}</h2>
            <div className="space-y-3">
              {groups.get(groupKey)!.map((entry) => {
                const isPast = new Date(entry.end_date || entry.start_date) < today;
                return (
                  <div
                    key={entry.id}
                    className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-5 shadow ${
                      isPast ? 'opacity-60' : ''
                    }`}
                  >
                    <div>
                      <p className="font-semibold">{entry.title}</p>
                      <p className="mt-1 text-sm text-gray-500">
                        {formatDate(entry.start_date)}
                        {entry.end_date && ` – ${formatDate(entry.end_date)}`}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${TYPE_STYLES[entry.event_type]}`}>
                      {entry.event_type}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
    </div>
  );
}
