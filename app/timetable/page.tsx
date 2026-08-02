'use client';

import { useEffect, useState } from 'react';
import { CLASSES, DAYS_OF_WEEK } from '@/lib/constants';
import { SESSIONS, TERMS, CURRENT_SESSION } from '@/lib/grade';

type ClassTimetableEntry = {
  id: string;
  day_of_week: string;
  period_number: number;
  start_time: string | null;
  end_time: string | null;
  subject: string;
  teacher_name: string | null;
};

type ExamTimetableEntry = {
  id: string;
  subject: string;
  exam_date: string;
  start_time: string | null;
  end_time: string | null;
  venue: string | null;
};

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`font-display border-b-2 pb-2.5 text-[13.5px] font-bold ${
        active ? 'border-[var(--brand-color-2)] text-[var(--ink)]' : 'border-transparent text-[var(--muted)]'
      }`}
    >
      {children}
    </button>
  );
}

export default function TimetablePage() {
  const [selectedClass, setSelectedClass] = useState(CLASSES[0]);
  const [tab, setTab] = useState<'class' | 'exam'>('class');

  const [classEntries, setClassEntries] = useState<ClassTimetableEntry[]>([]);
  const [classLoading, setClassLoading] = useState(true);

  const [examSetup, setExamSetup] = useState({ session: CURRENT_SESSION, term: TERMS[0] });
  const [examEntries, setExamEntries] = useState<ExamTimetableEntry[]>([]);
  const [examLoading, setExamLoading] = useState(true);

  useEffect(() => {
    setClassLoading(true);
    fetch(`/api/class-timetables?class=${encodeURIComponent(selectedClass)}`)
      .then((res) => res.json())
      .then((data) => setClassEntries(data.entries ?? []))
      .catch(() => setClassEntries([]))
      .finally(() => setClassLoading(false));
  }, [selectedClass]);

  useEffect(() => {
    setExamLoading(true);
    fetch(
      `/api/exam-timetables?class=${encodeURIComponent(selectedClass)}&session=${encodeURIComponent(examSetup.session)}&term=${encodeURIComponent(examSetup.term)}`
    )
      .then((res) => res.json())
      .then((data) => setExamEntries(data.entries ?? []))
      .catch(() => setExamEntries([]))
      .finally(() => setExamLoading(false));
  }, [selectedClass, examSetup.session, examSetup.term]);

  const periodsByNumber = new Map<number, { start: string | null; end: string | null }>();
  classEntries.forEach((e) => {
    if (!periodsByNumber.has(e.period_number)) periodsByNumber.set(e.period_number, { start: e.start_time, end: e.end_time });
  });
  const periods = Array.from(periodsByNumber.keys()).sort((a, b) => a - b);

  const cellFor = (day: string, period: number) => classEntries.find((e) => e.day_of_week === day && e.period_number === period);

  return (
    <main>
      <section
        className="py-12"
        style={{ background: 'linear-gradient(135deg, var(--ink) 0%, color-mix(in srgb, var(--brand-color) 70%, black) 100%)' }}
      >
        <div className="wrap">
          <span className="tag tag-light">Academics</span>
          <h1 className="text-white" style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}>
            Timetables
          </h1>
          <p className="mt-3.5 text-[15.5px] text-white/80">Class and exam schedules by class.</p>
        </div>
      </section>

      <section className="wrap py-10">
        <div className="mb-4 flex flex-wrap items-center gap-4">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="border border-[var(--line)] bg-[var(--paper)] p-3 text-sm"
          >
            {CLASSES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <div className="flex gap-6">
            <TabButton active={tab === 'class'} onClick={() => setTab('class')}>
              Class Timetable
            </TabButton>
            <TabButton active={tab === 'exam'} onClick={() => setTab('exam')}>
              Exam Timetable
            </TabButton>
          </div>
        </div>

        {tab === 'class' && (
          <div className="overflow-x-auto bg-[var(--paper)] p-6">
            {classLoading ? (
              <p className="text-[var(--muted)]">Loading…</p>
            ) : periods.length === 0 ? (
              <p className="text-[var(--muted)]">No timetable has been published for {selectedClass} yet.</p>
            ) : (
              <table className="w-full min-w-[640px] border-collapse text-[13.5px]">
                <thead>
                  <tr>
                    <th className="border-b-2 border-[var(--ink)] p-3 text-left text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">
                      Period
                    </th>
                    {DAYS_OF_WEEK.map((d) => (
                      <th
                        key={d}
                        className="border-b-2 border-[var(--ink)] p-3 text-left text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]"
                      >
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {periods.map((period) => {
                    const times = periodsByNumber.get(period);
                    return (
                      <tr key={period} className="align-top">
                        <td className="border-b border-[var(--line)] p-3 font-semibold">
                          {period}
                          {(times?.start || times?.end) && (
                            <div className="text-[11.5px] font-normal text-[var(--muted)]">
                              {times?.start} {times?.end ? `– ${times.end}` : ''}
                            </div>
                          )}
                        </td>
                        {DAYS_OF_WEEK.map((day) => {
                          const cell = cellFor(day, period);
                          return (
                            <td key={day} className="border-b border-[var(--line)] p-3">
                              {cell ? (
                                <>
                                  <p className="font-semibold">{cell.subject}</p>
                                  {cell.teacher_name && <p className="text-xs text-[var(--muted)]">{cell.teacher_name}</p>}
                                </>
                              ) : (
                                <span className="text-[var(--line)]">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === 'exam' && (
          <div>
            <div className="mb-5 flex flex-wrap gap-4">
              <select
                value={examSetup.session}
                onChange={(e) => setExamSetup({ ...examSetup, session: e.target.value })}
                className="border border-[var(--line)] bg-[var(--paper)] p-3 text-sm"
              >
                {SESSIONS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <select
                value={examSetup.term}
                onChange={(e) => setExamSetup({ ...examSetup, term: e.target.value })}
                className="border border-[var(--line)] bg-[var(--paper)] p-3 text-sm"
              >
                {TERMS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto bg-[var(--paper)] p-6">
              {examLoading ? (
                <p className="text-[var(--muted)]">Loading…</p>
              ) : examEntries.length === 0 ? (
                <p className="text-[var(--muted)]">No exam timetable has been published for {selectedClass} yet.</p>
              ) : (
                <table className="w-full text-[13.5px]">
                  <thead>
                    <tr>
                      <th className="border-b-2 border-[var(--ink)] p-3 text-left text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">
                        Subject
                      </th>
                      <th className="border-b-2 border-[var(--ink)] p-3 text-left text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">
                        Date
                      </th>
                      <th className="border-b-2 border-[var(--ink)] p-3 text-left text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">
                        Time
                      </th>
                      <th className="border-b-2 border-[var(--ink)] p-3 text-left text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">
                        Venue
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {examEntries.map((e) => (
                      <tr key={e.id}>
                        <td className="border-b border-[var(--line)] p-3 font-semibold">{e.subject}</td>
                        <td className="border-b border-[var(--line)] p-3">
                          {new Date(e.exam_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="border-b border-[var(--line)] p-3">
                          {e.start_time || '—'} {e.end_time ? `– ${e.end_time}` : ''}
                        </td>
                        <td className="border-b border-[var(--line)] p-3">{e.venue || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
