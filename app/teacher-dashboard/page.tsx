'use client';

import { useEffect, useState } from 'react';
import { SUBJECTS, TERMS, SESSIONS, CURRENT_SESSION } from '@/lib/grade';
import { CLASSES } from '@/lib/constants';

type UploadedResult = {
  id: string;
  student_id: string;
  subject: string;
  score: number;
  session: string;
  term: string;
  grade: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  created_at: string;
};

type RosterStudent = {
  id: string;
  student_id: string;
  full_name: string;
};

const TEACHER_NAME = 'Mr. Adebayo Okoro (Mathematics)';

export default function TeacherDashboard() {
  const [uploadedResults, setUploadedResults] = useState<UploadedResult[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showBatch, setShowBatch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [newResult, setNewResult] = useState({
    studentId: '',
    subject: SUBJECTS[0],
    score: '',
    session: CURRENT_SESSION,
    term: TERMS[0],
  });

  const [batchSetup, setBatchSetup] = useState({
    className: CLASSES[0],
    subject: SUBJECTS[0],
    session: CURRENT_SESSION,
    term: TERMS[0],
  });
  const [roster, setRoster] = useState<RosterStudent[] | null>(null);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [rosterError, setRosterError] = useState('');
  const [scores, setScores] = useState<Record<string, string>>({});
  const [batchSubmitting, setBatchSubmitting] = useState(false);
  const [batchResult, setBatchResult] = useState<{
    created: number;
    skipped: number;
    errors: { studentId: string; reason: string }[];
  } | null>(null);

  const loadResults = () => {
    setLoading(true);
    fetch('/api/results')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setUploadedResults(data.results);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadResults();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResult.studentId || !newResult.score) return;

    setSubmitting(true);
    setError('');
    setNotice('');

    try {
      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newResult, uploadedBy: TEACHER_NAME }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload result.');

      setNewResult({ studentId: '', subject: SUBJECTS[0], score: '', session: CURRENT_SESSION, term: TERMS[0] });
      setShowForm(false);
      setNotice('Result uploaded and is now visible in the student portal.');
      loadResults();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const loadRoster = async () => {
    setRosterLoading(true);
    setRosterError('');
    setBatchResult(null);
    setRoster(null);

    try {
      const res = await fetch(
        `/api/students?class=${encodeURIComponent(batchSetup.className)}&status=Active`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load class roster.');
      setRoster(data.students);
      setScores({});
    } catch (err) {
      setRosterError((err as Error).message);
    } finally {
      setRosterLoading(false);
    }
  };

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roster) return;

    const entries = roster
      .filter((s) => scores[s.student_id]?.trim())
      .map((s) => ({ studentId: s.student_id, score: scores[s.student_id] }));

    if (entries.length === 0) {
      setRosterError('Enter at least one score before submitting.');
      return;
    }

    setBatchSubmitting(true);
    setRosterError('');
    setBatchResult(null);

    try {
      const res = await fetch('/api/results/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: batchSetup.subject,
          session: batchSetup.session,
          term: batchSetup.term,
          uploadedBy: TEACHER_NAME,
          entries,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Batch upload failed.');
      setBatchResult(data);
      setScores({});
      loadResults();
    } catch (err) {
      setRosterError((err as Error).message);
    } finally {
      setBatchSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold">Teacher Dashboard</h1>
          <p className="text-gray-600">Welcome, {TEACHER_NAME}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowBatch(!showBatch);
              setShowForm(false);
            }}
            className="bg-white border border-green-700 text-green-800 px-6 py-3 rounded-xl font-semibold"
          >
            {showBatch ? 'Cancel' : 'Upload Results for a Class'}
          </button>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setShowBatch(false);
            }}
            className="bg-green-700 text-white px-6 py-3 rounded-xl font-semibold"
          >
            {showForm ? 'Cancel' : '+ Upload New Result'}
          </button>
        </div>
      </div>

      {notice && <div className="mb-6 rounded-xl bg-green-50 p-4 text-sm text-green-800">{notice}</div>}
      {error && <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {/* Single Upload Form */}
      {showForm && (
        <div className="bg-white p-8 rounded-2xl shadow mb-10 border">
          <h2 className="text-2xl font-semibold mb-6">Upload Student Result</h2>

          <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Student ID</label>
              <input
                type="text"
                value={newResult.studentId}
                onChange={(e) => setNewResult({ ...newResult, studentId: e.target.value })}
                className="w-full border p-3 rounded-xl"
                placeholder="ICS/2025/045"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <select
                value={newResult.subject}
                onChange={(e) => setNewResult({ ...newResult, subject: e.target.value })}
                className="w-full border p-3 rounded-xl"
              >
                {SUBJECTS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Score (0-100)</label>
              <input
                type="number"
                value={newResult.score}
                onChange={(e) => setNewResult({ ...newResult, score: e.target.value })}
                className="w-full border p-3 rounded-xl"
                min="0"
                max="100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Session</label>
              <select
                value={newResult.session}
                onChange={(e) => setNewResult({ ...newResult, session: e.target.value })}
                className="w-full border p-3 rounded-xl"
              >
                {SESSIONS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Term</label>
              <select
                value={newResult.term}
                onChange={(e) => setNewResult({ ...newResult, term: e.target.value })}
                className="w-full border p-3 rounded-xl"
              >
                {TERMS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-xl font-semibold disabled:opacity-60"
              >
                {submitting ? 'Uploading...' : 'Upload Result'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Batch Upload for a Class */}
      {showBatch && (
        <div className="bg-white p-8 rounded-2xl shadow mb-10 border">
          <h2 className="text-2xl font-semibold mb-2">Upload Results for a Class</h2>
          <p className="text-sm text-gray-500 mb-6">
            Pick your class, subject, and term, load the roster, then enter a score for each student. Leave a
            student blank to skip them.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Class</label>
              <select
                value={batchSetup.className}
                onChange={(e) => setBatchSetup({ ...batchSetup, className: e.target.value })}
                className="w-full border p-3 rounded-xl"
              >
                {CLASSES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <select
                value={batchSetup.subject}
                onChange={(e) => setBatchSetup({ ...batchSetup, subject: e.target.value })}
                className="w-full border p-3 rounded-xl"
              >
                {SUBJECTS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Session</label>
              <select
                value={batchSetup.session}
                onChange={(e) => setBatchSetup({ ...batchSetup, session: e.target.value })}
                className="w-full border p-3 rounded-xl"
              >
                {SESSIONS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Term</label>
              <select
                value={batchSetup.term}
                onChange={(e) => setBatchSetup({ ...batchSetup, term: e.target.value })}
                className="w-full border p-3 rounded-xl"
              >
                {TERMS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={loadRoster}
            disabled={rosterLoading}
            className="rounded-xl bg-gray-900 text-white px-6 py-3 font-semibold mb-6 disabled:opacity-60"
          >
            {rosterLoading ? 'Loading roster...' : 'Load Class Roster'}
          </button>

          {rosterError && <p className="text-sm text-red-600 mb-4">{rosterError}</p>}

          {batchResult && (
            <div className="mb-6 rounded-xl bg-green-50 p-4 text-sm text-green-800">
              <p>
                Uploaded {batchResult.created} result{batchResult.created === 1 ? '' : 's'}. Visible in student
                portals now.
                {batchResult.skipped > 0 && ` ${batchResult.skipped} row(s) skipped.`}
              </p>
              {batchResult.errors.length > 0 && (
                <ul className="mt-2 list-disc pl-5 text-red-700">
                  {batchResult.errors.map((e, i) => (
                    <li key={i}>
                      {e.studentId}: {e.reason}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {roster && (
            <form onSubmit={handleBatchSubmit}>
              {roster.length === 0 ? (
                <p className="text-gray-500">No active students found in {batchSetup.className}.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full mb-6">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="text-left p-3">Student ID</th>
                        <th className="text-left p-3">Name</th>
                        <th className="text-center p-3">
                          Score ({batchSetup.subject}, 0-100)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {roster.map((s) => (
                        <tr key={s.id} className="border-b">
                          <td className="p-3 font-mono">{s.student_id}</td>
                          <td className="p-3">{s.full_name}</td>
                          <td className="p-3 text-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={scores[s.student_id] ?? ''}
                              onChange={(e) => setScores({ ...scores, [s.student_id]: e.target.value })}
                              className="w-24 rounded-lg border p-2 text-center"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button
                    type="submit"
                    disabled={batchSubmitting}
                    className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-xl font-semibold disabled:opacity-60"
                  >
                    {batchSubmitting ? 'Uploading...' : 'Upload All Scores'}
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      )}

      {/* Uploaded Results */}
      <div className="bg-white rounded-2xl shadow p-8">
        <h2 className="text-2xl font-semibold mb-6">Recently Uploaded Results ({uploadedResults.length})</h2>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : uploadedResults.length === 0 ? (
          <p className="text-gray-500">No results uploaded yet. Click &quot;Upload New Result&quot; to add one.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-4">Student ID</th>
                <th className="text-left p-4">Subject</th>
                <th className="text-center p-4">Score</th>
                <th className="text-center p-4">Grade</th>
                <th className="text-left p-4">Session</th>
                <th className="text-left p-4">Term</th>
                <th className="text-center p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {uploadedResults.map((result) => (
                <tr key={result.id} className="border-b">
                  <td className="p-4 font-mono">{result.student_id}</td>
                  <td className="p-4">{result.subject}</td>
                  <td className="p-4 text-center">{result.score}</td>
                  <td className="p-4 text-center">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                      {result.grade}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{result.session}</td>
                  <td className="p-4 text-sm text-gray-600">{result.term}</td>
                  <td className="p-4 text-center">
                    <span
                      className={
                        result.status === 'Approved'
                          ? 'text-green-600'
                          : result.status === 'Rejected'
                          ? 'text-red-600'
                          : 'text-orange-600'
                      }
                    >
                      {result.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-8 text-sm text-gray-500">
        Results are visible in student portals immediately after upload. The admin is notified and can flag any
        result that needs correction.
      </div>
    </div>
  );
}
