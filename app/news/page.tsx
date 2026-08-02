'use client';

import { useEffect, useState } from 'react';

type NewsItem = {
  id: string;
  title: string;
  content: string;
  event_date: string | null;
  created_at: string;
};

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

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-4xl font-bold">News &amp; Events</h1>
      <p className="mt-3 text-gray-600">Stay up to date with announcements and upcoming events at {schoolName}.</p>

      <div className="mt-10 space-y-6">
        {loading && <p className="text-gray-500">Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && news.length === 0 && (
          <p className="text-gray-500">No news or events have been posted yet.</p>
        )}

        {news.map((item) => (
          <article key={item.id} className="rounded-2xl bg-white p-6 shadow">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-semibold">{item.title}</h2>
              {item.event_date && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-[var(--brand-color)]">
                  {new Date(item.event_date).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              )}
            </div>
            <p className="mt-3 whitespace-pre-wrap text-gray-600">{item.content}</p>
            <p className="mt-4 text-xs text-gray-400">
              Posted {new Date(item.created_at).toLocaleDateString()}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
