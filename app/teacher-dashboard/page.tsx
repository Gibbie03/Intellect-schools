'use client';

import { useEffect, useState } from 'react';
import { SUBJECTS, TERMS } from '@/lib/grade';

type UploadedResult = {
  id: string;
  student_id: string;
  subject: string;
  score: number;
  term: string;
  grade: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  created_at: string;
};

const TEACHER_NAME = 'Mr. Adebayo Okoro (Mathematics)';

export default function TeacherDashboard() {
  const [uploadedResults, setUploadedResults] = useState<UploadedResult[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [newResult, setNewResult] = useState({
    studentId: '',
    subject: SUBJECTS[0],
    score: '',
    term: TERMS[0],
  });

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

      setNewResult({ studentId: '', subject: SUBJECTS[0], score: '', term: TERMS[0] });
      setShowForm(false);
      setNotice('Result uploaded and sent to the admin for approval.');
      loadResults();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Teacher Dashboard</h1>
          <p className="text-gray-600">Welcome, {TEACHER_NAME}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-700 text-white px-6 py-3 rounded-xl font-semibold"
        >
          {showForm ? 'Cancel' : '+ Upload New Result'}
        </button>
      </div>

      {notice && <div className="mb-6 rounded-xl bg-green-50 p-4 text-sm text-green-800">{notice}</div>}
      {error && <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {/* Upload Form */}
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
        Uploaded results go to the admin for approval before they appear in student portals.
      </div>
    </div>
  );
}
