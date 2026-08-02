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
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-4xl font-bold">Timetables</h1>
      <p className="mt-3 text-gray-600">Class and exam schedules by class.</p>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="rounded-xl border p-3"
        >
          {CLASSES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <div className="flex gap-2">
          <button
            onClick={() => setTab('class')}
            className={`rounded-xl px-4 py-2 text-sm font-medium ${
              tab === 'class' ? 'bg-[var(--brand-color)] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Class Timetable
          </button>
          <button
            onClick={() => setTab('exam')}
            className={`rounded-xl px-4 py-2 text-sm font-medium ${
              tab === 'exam' ? 'bg-[var(--brand-color)] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Exam Timetable
          </button>
        </div>
      </div>

      {tab === 'class' && (
        <div className="mt-8 bg-white rounded-2xl shadow p-6 overflow-x-auto">
          {classLoading ? (
            <p className="text-gray-500">Loading...</p>
          ) : periods.length === 0 ? (
            <p className="text-gray-500">No timetable has been published for {selectedClass} yet.</p>
          ) : (
            <table className="w-full border-collapse text-sm min-w-[640px]">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-3">Period</th>
                  {DAYS_OF_WEEK.map((d) => (
                    <th key={d} className="text-left p-3">
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {periods.map((period) => {
                  const times = periodsByNumber.get(period);
                  return (
                    <tr key={period} className="border-b align-top">
                      <td className="p-3 font-medium">
                        {period}
                        {(times?.start || times?.end) && (
                          <div className="text-xs text-gray-400">
                            {times?.start} {times?.end ? `– ${times.end}` : ''}
                          </div>
                        )}
                      </td>
                      {DAYS_OF_WEEK.map((day) => {
                        const cell = cellFor(day, period);
                        return (
                          <td key={day} className="p-3">
                            {cell ? (
                              <>
                                <p className="font-medium">{cell.subject}</p>
                                {cell.teacher_name && <p className="text-xs text-gray-500">{cell.teacher_name}</p>}
                              </>
                            ) : (
                              <span className="text-gray-300">—</span>
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
        <div className="mt-8">
          <div className="flex flex-wrap gap-4 mb-6">
            <select
              value={examSetup.session}
              onChange={(e) => setExamSetup({ ...examSetup, session: e.target.value })}
              className="rounded-xl border p-3"
            >
              {SESSIONS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select
              value={examSetup.term}
              onChange={(e) => setExamSetup({ ...examSetup, term: e.target.value })}
              className="rounded-xl border p-3"
            >
              {TERMS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            {examLoading ? (
              <p className="text-gray-500">Loading...</p>
            ) : examEntries.length === 0 ? (
              <p className="text-gray-500">No exam timetable has been published for {selectedClass} yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-3">Subject</th>
                    <th className="text-left p-3">Date</th>
                    <th className="text-left p-3">Time</th>
                    <th className="text-left p-3">Venue</th>
                  </tr>
                </thead>
                <tbody>
                  {examEntries.map((e) => (
                    <tr key={e.id} className="border-b">
                      <td className="p-3 font-medium">{e.subject}</td>
                      <td className="p-3">{new Date(e.exam_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      <td className="p-3">
                        {e.start_time || '—'} {e.end_time ? `– ${e.end_time}` : ''}
                      </td>
                      <td className="p-3">{e.venue || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
