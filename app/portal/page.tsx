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
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {studentName ?? 'Student'}</h1>
            <p className="text-gray-600">
              {studentId}
              {studentClass ? ` · ${studentClass}` : ''} &middot; Your approved results
            </p>
            {usesRemaining !== null && (
              <p className="text-sm text-gray-500 mt-1">
                {usesRemaining > 0
                  ? `This card can be used ${usesRemaining} more time${usesRemaining === 1 ? '' : 's'}.`
                  : 'This card has now been fully used.'}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="text-sm rounded-xl border border-gray-300 px-4 py-2 font-medium hover:bg-gray-50"
            >
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
              className="text-sm text-red-600 hover:underline"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-8">
          {sessions.length === 0 ? (
            <p className="text-gray-500">
              No approved results are available yet. Check back after your teacher uploads results and the admin
              approves them.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 mb-4">
                {sessions.map((session) => (
                  <button
                    key={session}
                    onClick={() => setActiveSession(session)}
                    className={`rounded-xl px-4 py-2 text-sm font-medium ${
                      activeSession === session
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {session} Session
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
                {TERMS.map((term) => (
                  <button
                    key={term}
                    onClick={() => setActiveTerm(term)}
                    className={`rounded-xl px-4 py-2 text-sm font-medium ${
                      activeTerm === term
                        ? 'bg-[var(--brand-color)] text-white'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {term}
                  </button>
                ))}
              </div>

              <h2 className="text-2xl font-semibold mb-6">
                {activeTerm}, {activeSession} Session
              </h2>

              {activeReportCard && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-sm">
                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-gray-500 mb-1">Attendance</p>
                    <p className="font-medium">
                      {activeReportCard.days_present ?? '—'} / {activeReportCard.days_school_opened ?? '—'} days present
                    </p>
                    <p className="text-gray-500">Punctual {activeReportCard.times_punctual ?? '—'} time(s)</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-gray-500 mb-1">Conduct</p>
                    <p className="font-medium">{activeReportCard.conduct_rating ?? 'Not recorded'}</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-4 sm:col-span-1">
                    <p className="text-gray-500 mb-1">Class Teacher&apos;s Comment</p>
                    <p className="font-medium">{activeReportCard.teacher_comment ?? 'Not recorded'}</p>
                  </div>
                </div>
              )}

              {visibleResults.length === 0 ? (
                <p className="text-gray-500">No approved results for this term yet.</p>
              ) : (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-4">Subject</th>
                      <th className="text-center p-4">CA</th>
                      <th className="text-center p-4">Exam</th>
                      <th className="text-center p-4">Total</th>
                      <th className="text-center p-4">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleResults.map((result) => (
                      <tr key={result.id} className="border-b">
                        <td className="p-4 font-medium">{result.subject}</td>
                        <td className="p-4 text-center text-gray-500">{result.ca_score ?? '—'}</td>
                        <td className="p-4 text-center text-gray-500">{result.exam_score ?? '—'}</td>
                        <td className="p-4 text-center">{result.score}</td>
                        <td className="p-4 text-center">
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                            {result.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeReportCard?.principal_comment && (
                <div className="mt-6 rounded-xl bg-gray-50 p-4 text-sm">
                  <p className="text-gray-500 mb-1">Principal&apos;s Comment</p>
                  <p className="font-medium">{activeReportCard.principal_comment}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-8 border rounded-3xl">
      <h1 className="text-3xl font-bold text-center mb-2">Student Results Portal</h1>
      <p className="text-center text-gray-600 mb-8">Enter your details from your result checker card</p>

      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="text"
          placeholder="Student ID (e.g. ICS/2025/001)"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="w-full border p-3 rounded-xl"
          required
        />
        <input
          type="text"
          placeholder="Serial Number (e.g. ICS-25T2-0001)"
          value={serial}
          onChange={(e) => setSerial(e.target.value)}
          className="w-full border p-3 rounded-xl"
          required
        />
        <input
          type="text"
          inputMode="numeric"
          placeholder="PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full border p-3 rounded-xl"
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--brand-color)] text-white py-3 rounded-xl font-semibold hover:brightness-90 disabled:opacity-60"
        >
          {loading ? 'Checking...' : 'Check Result'}
        </button>
      </form>

      <p className="text-center text-sm mt-4 text-gray-500">
        Don&rsquo;t have a card? Get a result checker card from your school.
      </p>
    </div>
  );
}
