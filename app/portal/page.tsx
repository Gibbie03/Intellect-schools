'use client';

import { useEffect, useMemo, useState } from 'react';
import { TERMS } from '@/lib/grade';

type Result = {
  id: string;
  subject: string;
  score: number;
  ca_score: number | null;
  exam_score: number | null;
  grade: string;
  session: string;
  term: string;
};

type ReportCard = {
  session: string;
  term: string;
  days_school_opened: number | null;
  days_present: number | null;
  times_punctual: number | null;
  conduct_rating: string | null;
  teacher_comment: string | null;
  principal_comment: string | null;
};

export default function StudentPortal() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [serial, setSerial] = useState('');
  const [pin, setPin] = useState('');
  const [studentName, setStudentName] = useState<string | null>(null);
  const [studentClass, setStudentClass] = useState<string | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usesRemaining, setUsesRemaining] = useState<number | null>(null);
  const [activeSession, setActiveSession] = useState('');
  const [activeTerm, setActiveTerm] = useState(TERMS[0]);
  const [schoolName, setSchoolName] = useState('');

  useEffect(() => {
    fetch('/api/school')
      .then((res) => res.json())
      .then((data) => setSchoolName(data.name ?? ''))
      .catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !serial || !pin) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/portal/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, serial, pin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to check result.');

      const fetchedResults: Result[] = data.results.map(
        (r: {
          id: string;
          subject: string;
          score: number;
          ca_score: number | null;
          exam_score: number | null;
          grade: string;
          session: string;
          term: string;
        }) => ({
          id: r.id,
          subject: r.subject,
          score: r.score,
          ca_score: r.ca_score,
          exam_score: r.exam_score,
          grade: r.grade,
          session: r.session,
          term: r.term,
        })
      );

      setResults(fetchedResults);
      setReportCards(data.reportCards ?? []);
      setStudentName(data.student?.fullName ?? null);
      setStudentClass(data.student?.class ?? null);
      setUsesRemaining(data.usesRemaining ?? null);

      const sessions = Array.from(new Set(fetchedResults.map((r) => r.session))).sort();
      setActiveSession(sessions[sessions.length - 1] ?? '');
      setLoggedIn(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const sessions = useMemo(
    () => Array.from(new Set(results.map((r) => r.session))).sort(),
    [results]
  );

  const visibleResults = useMemo(
    () => results.filter((r) => r.session === activeSession && r.term === activeTerm),
    [results, activeSession, activeTerm]
  );

  const activeReportCard = useMemo(
    () => reportCards.find((rc) => rc.session === activeSession && rc.term === activeTerm) ?? null,
    [reportCards, activeSession, activeTerm]
  );

  const handlePrint = () => {
    const win = window.open('', '_blank');
    if (!win) return;

    const rows = visibleResults
      .map(
        (r) => `
        <tr>
          <td>${r.subject}</td>
          <td class="c">${r.ca_score ?? '—'}</td>
          <td class="c">${r.exam_score ?? '—'}</td>
          <td class="c"><strong>${r.score}</strong></td>
          <td class="c">${r.grade}</td>
        </tr>`
      )
      .join('');

    const rc = activeReportCard;
    const attendanceLine = rc
      ? `${rc.days_present ?? '—'} / ${rc.days_school_opened ?? '—'} days present &middot; Punctual ${rc.times_punctual ?? '—'} time(s)`
      : 'Not recorded yet';

    win.document.write(`
      <html>
        <head>
          <title>${studentName ?? 'Student'} - ${activeTerm} ${activeSession} Report Card</title>
          <style>
            * { box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
            h1 { font-size: 20px; margin: 0 0 4px; }
            .muted { color: #666; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin: 16px 0; }
            th, td { border: 1px solid #ccc; padding: 8px; font-size: 13px; }
            th { background: #f3f3f3; text-align: left; }
            .c { text-align: center; }
            .section { margin-top: 20px; }
            .section h2 { font-size: 14px; margin: 0 0 6px; }
            .box { border: 1px solid #ccc; border-radius: 6px; padding: 10px; font-size: 13px; min-height: 40px; }
            .sign { margin-top: 40px; display: flex; justify-content: space-between; font-size: 12px; }
            .sign div { border-top: 1px solid #333; width: 40%; padding-top: 4px; }
          </style>
        </head>
        <body>
          <h1>${schoolName || 'School'}</h1>
          <p class="muted">Report Card &mdash; ${activeTerm}, ${activeSession} Session</p>
          <p class="muted">${studentName ?? ''} &middot; ${studentId} ${studentClass ? `&middot; ${studentClass}` : ''}</p>
          <p class="muted">Attendance: ${attendanceLine}</p>

          <table>
            <thead>
              <tr><th>Subject</th><th class="c">CA</th><th class="c">Exam</th><th class="c">Total</th><th class="c">Grade</th></tr>
            </thead>
            <tbody>${rows || '<tr><td colspan="5" class="c">No approved results for this term yet.</td></tr>'}</tbody>
          </table>

          <div class="section">
            <h2>Conduct</h2>
            <div class="box">${rc?.conduct_rating ?? 'Not recorded'}</div>
          </div>
          <div class="section">
            <h2>Class Teacher's Comment</h2>
            <div class="box">${rc?.teacher_comment ?? 'Not recorded'}</div>
          </div>
          <div class="section">
            <h2>Principal's Comment</h2>
            <div class="box">${rc?.principal_comment ?? 'Not recorded'}</div>
          </div>

          <div class="sign">
            <div>Class Teacher&apos;s Signature</div>
            <div>Principal&apos;s Signature</div>
          </div>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  if (loggedIn) {
    return (
      <main className="wrap py-12" style={{ maxWidth: 900 }}>
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl">Welcome, {studentName ?? 'Student'}</h1>
            <p className="text-[var(--muted)]">
              {studentId}
              {studentClass ? ` · ${studentClass}` : ''} &middot; Your approved results
            </p>
            {usesRemaining !== null && (
              <p className="mt-1 text-sm text-[var(--muted)]">
                {usesRemaining > 0
                  ? `This card can be used ${usesRemaining} more time${usesRemaining === 1 ? '' : 's'}.`
                  : 'This card has now been fully used.'}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={handlePrint} className="btn btn-outline !px-4 !py-2 !text-sm">
              Print Report Card
            </button>
            <button
              onClick={() => {
                setLoggedIn(false);
                setStudentId('');
                setSerial('');
                setPin('');
                setStudentName(null);
                setStudentClass(null);
                setResults([]);
                setReportCards([]);
                setUsesRemaining(null);
              }}
              className="text-sm font-semibold text-[var(--brand-color-2)] hover:underline"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="p-8" style={{ background: 'var(--paper)' }}>
          {sessions.length === 0 ? (
            <p className="text-[var(--muted)]">
              No approved results are available yet. Check back after your teacher uploads results and the admin
              approves them.
            </p>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap gap-2">
                {sessions.map((session) => (
                  <button
                    key={session}
                    onClick={() => setActiveSession(session)}
                    className={`px-4 py-2 text-sm font-medium ${
                      activeSession === session ? 'text-white' : 'bg-[var(--cream)] text-[var(--muted)]'
                    }`}
                    style={activeSession === session ? { background: 'var(--ink)' } : undefined}
                  >
                    {session} Session
                  </button>
                ))}
              </div>

              <div className="mb-6 flex flex-wrap gap-6 border-b border-[var(--line)] pb-3">
                {TERMS.map((term) => (
                  <button
                    key={term}
                    onClick={() => setActiveTerm(term)}
                    className={`font-display border-b-2 pb-1 text-sm font-bold ${
                      activeTerm === term
                        ? 'border-[var(--brand-color-2)] text-[var(--ink)]'
                        : 'border-transparent text-[var(--muted)]'
                    }`}
                  >
                    {term}
                  </button>
                ))}
              </div>

              <h2 className="mb-6 text-2xl">
                {activeTerm}, {activeSession} Session
              </h2>

              {activeReportCard && (
                <div className="mb-6 grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
                  <div className="p-4" style={{ background: 'var(--cream)' }}>
                    <p className="mb-1 text-[var(--muted)]">Attendance</p>
                    <p className="font-medium">
                      {activeReportCard.days_present ?? '—'} / {activeReportCard.days_school_opened ?? '—'} days present
                    </p>
                    <p className="text-[var(--muted)]">Punctual {activeReportCard.times_punctual ?? '—'} time(s)</p>
                  </div>
                  <div className="p-4" style={{ background: 'var(--cream)' }}>
                    <p className="mb-1 text-[var(--muted)]">Conduct</p>
                    <p className="font-medium">{activeReportCard.conduct_rating ?? 'Not recorded'}</p>
                  </div>
                  <div className="p-4 sm:col-span-1" style={{ background: 'var(--cream)' }}>
                    <p className="mb-1 text-[var(--muted)]">Class Teacher&apos;s Comment</p>
                    <p className="font-medium">{activeReportCard.teacher_comment ?? 'Not recorded'}</p>
                  </div>
                </div>
              )}

              {visibleResults.length === 0 ? (
                <p className="text-[var(--muted)]">No approved results for this term yet.</p>
              ) : (
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      <th className="border-b-2 border-[var(--ink)] p-4 text-left text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">
                        Subject
                      </th>
                      <th className="border-b-2 border-[var(--ink)] p-4 text-center text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">
                        CA
                      </th>
                      <th className="border-b-2 border-[var(--ink)] p-4 text-center text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">
                        Exam
                      </th>
                      <th className="border-b-2 border-[var(--ink)] p-4 text-center text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">
                        Total
                      </th>
                      <th className="border-b-2 border-[var(--ink)] p-4 text-center text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">
                        Grade
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleResults.map((result) => (
                      <tr key={result.id}>
                        <td className="border-b border-[var(--line)] p-4 font-medium">{result.subject}</td>
                        <td className="border-b border-[var(--line)] p-4 text-center text-[var(--muted)]">
                          {result.ca_score ?? '—'}
                        </td>
                        <td className="border-b border-[var(--line)] p-4 text-center text-[var(--muted)]">
                          {result.exam_score ?? '—'}
                        </td>
                        <td className="border-b border-[var(--line)] p-4 text-center">{result.score}</td>
                        <td className="border-b border-[var(--line)] p-4 text-center">
                          <span className="pill" style={{ background: 'var(--brand-tint)', color: 'var(--brand-color)' }}>
                            {result.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeReportCard?.principal_comment && (
                <div className="mt-6 p-4 text-sm" style={{ background: 'var(--cream)' }}>
                  <p className="mb-1 text-[var(--muted)]">Principal&apos;s Comment</p>
                  <p className="font-medium">{activeReportCard.principal_comment}</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center px-5 py-14">
      <div style={{ width: 'min(420px, 100%)' }}>
        <div className="mb-7 text-center">
          <h1 className="mb-2 text-[27px]">
            Student <span style={{ color: 'var(--brand-color-2)' }}>Results Portal</span>
          </h1>
          <p className="m-0 text-[14.5px] text-[var(--muted)]">Enter your details from your result checker card.</p>
        </div>

        <form
          onSubmit={handleLogin}
          className="frame flex flex-col gap-5 p-8"
          style={{ background: 'var(--paper)', boxShadow: '0 20px 48px rgba(21,32,26,0.1)' }}
        >
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">Student ID</label>
            <input
              type="text"
              placeholder="e.g. ICS/2025/001"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full border border-[var(--line)] p-3 text-[14.5px]"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">Serial Number</label>
            <input
              type="text"
              placeholder="e.g. ICS-25T2-0001"
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              className="w-full border border-[var(--line)] p-3 text-[14.5px]"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">PIN</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full border border-[var(--line)] p-3 text-[14.5px]"
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center disabled:opacity-60">
            {loading ? 'Checking…' : 'Check Result'}
          </button>
        </form>
        <p className="mt-5 text-center text-[13px] text-[var(--muted)]">
          Don&rsquo;t have a card? Get a result checker card from your school.
        </p>
      </div>
    </main>
  );
}
