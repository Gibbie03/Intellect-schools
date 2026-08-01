'use client';

import { useMemo, useState } from 'react';
import { TERMS } from '@/lib/grade';

type Result = {
  id: string;
  subject: string;
  score: number;
  grade: string;
  session: string;
  term: string;
};

export default function StudentPortal() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState<string | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeSession, setActiveSession] = useState('');
  const [activeTerm, setActiveTerm] = useState(TERMS[0]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) return;

    setLoading(true);
    setError('');

    try {
      const [resultsRes, studentRes] = await Promise.all([
        fetch(`/api/results?studentId=${encodeURIComponent(studentId)}&status=Approved`),
        fetch(`/api/students?studentId=${encodeURIComponent(studentId)}`),
      ]);
      const resultsData = await resultsRes.json();
      if (!resultsRes.ok) throw new Error(resultsData.error || 'Failed to load results.');

      const studentData = await studentRes.json();
      const profile = studentRes.ok ? studentData.students?.[0] : null;

      const fetchedResults: Result[] = resultsData.results.map(
        (r: { id: string; subject: string; score: number; grade: string; session: string; term: string }) => ({
          id: r.id,
          subject: r.subject,
          score: r.score,
          grade: r.grade,
          session: r.session,
          term: r.term,
        })
      );

      setResults(fetchedResults);
      setStudentName(profile?.full_name ?? null);

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

  if (loggedIn) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {studentName ?? 'Student'}</h1>
            <p className="text-gray-600">{studentId} &middot; Your approved results</p>
          </div>
          <button
            onClick={() => {
              setLoggedIn(false);
              setStudentId('');
              setStudentName(null);
              setResults([]);
            }}
            className="text-sm text-red-600 hover:underline"
          >
            Logout
          </button>
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
                        ? 'bg-green-700 text-white'
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

              {visibleResults.length === 0 ? (
                <p className="text-gray-500">No approved results for this term yet.</p>
              ) : (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-4">Subject</th>
                      <th className="text-center p-4">Score</th>
                      <th className="text-center p-4">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleResults.map((result) => (
                      <tr key={result.id} className="border-b">
                        <td className="p-4 font-medium">{result.subject}</td>
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
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-8 border rounded-3xl">
      <h1 className="text-3xl font-bold text-center mb-2">Student Results Portal</h1>
      <p className="text-center text-gray-600 mb-8">Login to view your results</p>

      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="text"
          placeholder="Student ID (e.g. ICS/2025/001)"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="w-full border p-3 rounded-xl"
          required
        />
        <input type="password" placeholder="Password" className="w-full border p-3 rounded-xl" required />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-700 text-white py-3 rounded-xl font-semibold hover:bg-green-800 disabled:opacity-60"
        >
          {loading ? 'Loading...' : 'Login'}
        </button>
      </form>

      <p className="text-center text-sm mt-4 text-gray-500">
        Demo: Enter any Student ID to login. Only results your school has approved for that ID will appear.
      </p>
    </div>
  );
}
