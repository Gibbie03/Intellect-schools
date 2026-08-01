'use client';

import { useState } from 'react';

type Result = {
  id: string;
  subject: string;
  score: number;
  grade: string;
  term: string;
};

export default function StudentPortal() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/results?studentId=${encodeURIComponent(studentId)}&status=Approved`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load results.');

      setResults(
        data.results.map((r: { id: string; subject: string; score: number; grade: string; term: string }) => ({
          id: r.id,
          subject: r.subject,
          score: r.score,
          grade: r.grade,
          term: r.term,
        }))
      );
      setLoggedIn(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (loggedIn) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome, Student {studentId}</h1>
            <p className="text-gray-600">Your approved results</p>
          </div>
          <button
            onClick={() => {
              setLoggedIn(false);
              setStudentId('');
              setResults([]);
            }}
            className="text-sm text-red-600 hover:underline"
          >
            Logout
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow p-8">
          <h2 className="text-2xl font-semibold mb-6">Your Results</h2>

          {results.length === 0 ? (
            <p className="text-gray-500">
              No approved results are available yet. Check back after your teacher uploads results and the admin
              approves them.
            </p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-4">Subject</th>
                  <th className="text-center p-4">Score</th>
                  <th className="text-center p-4">Grade</th>
                  <th className="text-left p-4">Term</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result.id} className="border-b">
                    <td className="p-4 font-medium">{result.subject}</td>
                    <td className="p-4 text-center">{result.score}</td>
                    <td className="p-4 text-center">
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                        {result.grade}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{result.term}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
