'use client';

import { useEffect, useState } from 'react';
import PageHero from '@/components/PageHero';

type NewsItem = {
  id: string;
  title: string;
  content: string;
  event_date: string | null;
  created_at: string;
};

function DateBadge({ isoDate, past }: { isoDate: string; past: boolean }) {
  const date = new Date(isoDate);
  return (
    <div
      className="flex w-16 shrink-0 flex-col items-center justify-center py-3 text-white"
      style={{ background: past ? 'var(--muted)' : 'var(--ink)' }}
    >
      <span className="text-[11px] font-bold uppercase tracking-[0.06em]">
        {date.toLocaleDateString(undefined, { month: 'short' })}
      </span>
      <span className="font-display text-[26px] font-extrabold leading-none">{date.getDate()}</span>
      <span className="text-[10.5px] opacity-70">{date.getFullYear()}</span>
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
    <main>
      <PageHero
        eyebrow="News & Events"
        title="Stay up to date"
        subtitle={<>Announcements and upcoming events at {schoolName}.</>}
        subtitleClassName="mt-3.5 max-w-[56ch] text-[15.5px] text-white/80"
        wrapStyle={{ maxWidth: 900 }}
      />

      <div className="wrap" style={{ maxWidth: 900 }}>
        {loading && (
          <p className="pt-14 text-[var(--muted)]">Loading…</p>
        )}
        {error && <p className="pt-14 text-red-600">{error}</p>}
        {!loading && !error && news.length === 0 && (
          <p className="pt-14 text-[var(--muted)]">No news or events have been posted yet.</p>
        )}

        {!loading && !error && events.length > 0 && (
          <section className="pb-4 pt-14">
            <p className="mb-4 text-[11.5px] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">
              Upcoming events
            </p>
            <div className="grid gap-3.5">
              {events.map((item) => {
                const isPast = new Date(item.event_date!) < today;
                return (
                  <article
                    key={item.id}
                    className={`flex gap-5 bg-[var(--paper)] p-5 ${isPast ? 'opacity-60' : ''}`}
                  >
                    <DateBadge isoDate={item.event_date!} past={isPast} />
                    <div className="min-w-0">
                      <h3 className="mb-2 text-lg">{item.title}</h3>
                      <p className="m-0 whitespace-pre-wrap text-[14.5px] leading-[1.6] text-[var(--muted)]">
                        {item.content}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {!loading && !error && announcements.length > 0 && (
          <section className="pb-16 pt-10">
            <p className="mb-4 text-[11.5px] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">
              Announcements
            </p>
            <div className="grid gap-3.5">
              {announcements.map((item) => (
                <article key={item.id} className="card">
                  <h3 className="mb-2 text-lg">{item.title}</h3>
                  <p className="m-0 whitespace-pre-wrap text-[14.5px] leading-[1.6] text-[var(--muted)]">
                    {item.content}
                  </p>
                  <p className="mt-3.5 text-xs text-[var(--muted)]">
                    Posted {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
