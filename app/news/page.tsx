'use client';

import { useEffect, useState } from 'react';

type NewsItem = {
  id: string;
  title: string;
  content: string;
  event_date: string | null;
  created_at: string;
};

function DateBadge({ isoDate }: { isoDate: string }) {
  const date = new Date(isoDate);
  return (
    <div className="flex w-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-[var(--brand-color)] py-4 text-white">
      <span className="text-xs font-semibold uppercase tracking-wide">
        {date.toLocaleDateString(undefined, { month: 'short' })}
      </span>
      <span className="text-3xl font-extrabold leading-none">{date.getDate()}</span>
      <span className="text-xs text-white/80">{date.getFullYear()}</span>
    </div>
  );
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [schoolName, setSchoolName] = useState('the school');

  useEffect(() => {
    fetch('/api/news')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setNews(data.news);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    fetch('/api/school')
      .then((res) => res.json())
      .then((data) => {
        if (data.name) setSchoolName(data.name);
      });
  }, []);

  const events = news
    .filter((item) => item.event_date)
    .sort((a, b) => new Date(a.event_date!).getTime() - new Date(b.event_date!).getTime());
  const announcements = news
    .filter((item) => !item.event_date)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-4xl font-bold">News &amp; Events</h1>
      <p className="mt-3 text-gray-600">Stay up to date with announcements and upcoming events at {schoolName}.</p>

      {loading && <p className="mt-10 text-gray-500">Loading...</p>}
      {error && <p className="mt-10 text-red-600">{error}</p>}
      {!loading && !error && news.length === 0 && (
        <p className="mt-10 text-gray-500">No news or events have been posted yet.</p>
      )}

      {!loading && !error && events.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">Upcoming Events</h2>
          <div className="space-y-4">
            {events.map((item) => {
              const isPast = new Date(item.event_date!) < today;
              return (
                <article
                  key={item.id}
                  className={`flex gap-5 rounded-2xl bg-white p-5 shadow ${isPast ? 'opacity-60' : ''}`}
                >
                  <DateBadge isoDate={item.event_date!} />
                  <div className="min-w-0">
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                    <p className="mt-2 whitespace-pre-wrap text-gray-600">{item.content}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {!loading && !error && announcements.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">Announcements</h2>
          <div className="space-y-4">
            {announcements.map((item) => (
              <article key={item.id} className="rounded-2xl bg-white p-6 shadow">
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 whitespace-pre-wrap text-gray-600">{item.content}</p>
                <p className="mt-4 text-xs text-gray-400">
                  Posted {new Date(item.created_at).toLocaleDateString()}
                </p>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
