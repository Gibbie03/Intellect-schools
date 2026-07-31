'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';

type UploadedResult = {
  studentId: string;
  studentName: string;
  subject: string;
  score: number;
  term: string;
  grade: string;
  status: 'Pending' | 'Approved';
  uploadedAt: string;
};

const subjects = ['Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology', 'Government'];

function calculateGrade(score: number) {
  if (score >= 70) return 'A';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C';
  if (score >= 45) return 'D';
  return 'F';
}

export default function TeacherDashboard() {
  const [uploadedResults, setUploadedResults] = useState<UploadedResult[]>([
    { studentId: 'ICS/2026/001', studentName: 'Amara Johnson', subject: 'Mathematics', score: 86, grade: 'A', term: 'First Term 2026/2027', status: 'Approved', uploadedAt: '2026-07-31' },
    { studentId: 'ICS/2026/014', studentName: 'Daniel Okoro', subject: 'Physics', score: 68, grade: 'B', term: 'First Term 2026/2027', status: 'Pending', uploadedAt: '2026-07-31' },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [newResult, setNewResult] = useState({
    studentId: '',
    studentName: '',
    subject: subjects[0],
    score: '',
    term: 'First Term 2026/2027',
  });

  const summary = useMemo(() => ({
    total: uploadedResults.length,
    pending: uploadedResults.filter((result) => result.status === 'Pending').length,
    average: uploadedResults.length ? Math.round(uploadedResults.reduce((sum, result) => sum + result.score, 0) / uploadedResults.length) : 0,
  }), [uploadedResults]);

  const handleUpload = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const score = Number(newResult.score);

    if (score < 0 || score > 100) {
      setMessage('Score must be between 0 and 100.');
      return;
    }

    const result: UploadedResult = {
      studentId: newResult.studentId.trim(),
      studentName: newResult.studentName.trim(),
      subject: newResult.subject,
      score,
      term: newResult.term.trim(),
      grade: calculateGrade(score),
      status: 'Pending',
      uploadedAt: new Date().toLocaleDateString(),
    };

    setUploadedResults((current) => [result, ...current]);
    setNewResult({ studentId: '', studentName: '', subject: subjects[0], score: '', term: 'First Term 2026/2027' });
    setShowForm(false);
    setMessage('Result saved as pending approval. Open the admin dashboard to approve records.');
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <Link href="/" className="text-sm font-bold text-green-700">← Back to landing page</Link>
            <h1 className="mt-3 text-4xl font-black">Teacher Dashboard</h1>
            <p className="text-slate-600">Upload scores, calculate grades, and prepare results for admin approval.</p>
          </div>
          <button onClick={() => setShowForm((value) => !value)} className="rounded-xl bg-green-700 px-6 py-3 font-bold text-white hover:bg-green-800">
            {showForm ? 'Close form' : 'Upload New Result'}
          </button>
        </div>

        {message && <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 font-medium text-green-800">{message}</div>}

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm"><p className="text-sm text-slate-500">Uploaded results</p><p className="text-4xl font-black">{summary.total}</p></div>
          <div className="rounded-2xl bg-white p-6 shadow-sm"><p className="text-sm text-slate-500">Pending approval</p><p className="text-4xl font-black text-orange-600">{summary.pending}</p></div>
          <div className="rounded-2xl bg-white p-6 shadow-sm"><p className="text-sm text-slate-500">Class average</p><p className="text-4xl font-black text-green-700">{summary.average}%</p></div>
        </div>

        {showForm && (
          <form onSubmit={handleUpload} className="mb-8 grid gap-5 rounded-3xl bg-white p-6 shadow-sm md:grid-cols-2">
            <label className="text-sm font-bold">Student ID<input value={newResult.studentId} onChange={(event) => setNewResult({ ...newResult, studentId: event.target.value })} className="mt-2 w-full rounded-xl border p-3 font-normal" placeholder="ICS/2026/021" required /></label>
            <label className="text-sm font-bold">Student name<input value={newResult.studentName} onChange={(event) => setNewResult({ ...newResult, studentName: event.target.value })} className="mt-2 w-full rounded-xl border p-3 font-normal" placeholder="Student full name" required /></label>
            <label className="text-sm font-bold">Subject<select value={newResult.subject} onChange={(event) => setNewResult({ ...newResult, subject: event.target.value })} className="mt-2 w-full rounded-xl border p-3 font-normal">{subjects.map((subject) => <option key={subject}>{subject}</option>)}</select></label>
            <label className="text-sm font-bold">Score<input type="number" min="0" max="100" value={newResult.score} onChange={(event) => setNewResult({ ...newResult, score: event.target.value })} className="mt-2 w-full rounded-xl border p-3 font-normal" required /></label>
            <label className="text-sm font-bold md:col-span-2">Term<input value={newResult.term} onChange={(event) => setNewResult({ ...newResult, term: event.target.value })} className="mt-2 w-full rounded-xl border p-3 font-normal" required /></label>
            <button className="rounded-xl bg-green-700 py-3 font-bold text-white hover:bg-green-800 md:col-span-2">Save result for approval</button>
          </form>
        )}

        <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
          <div className="border-b p-6"><h2 className="text-2xl font-black">Uploaded Results</h2></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="bg-slate-100 text-left"><tr><th className="p-4">Student</th><th className="p-4">Subject</th><th className="p-4 text-center">Score</th><th className="p-4 text-center">Grade</th><th className="p-4 text-center">Status</th><th className="p-4">Uploaded</th></tr></thead>
              <tbody>{uploadedResults.map((result) => <tr key={`${result.studentId}-${result.subject}-${result.uploadedAt}`} className="border-t"><td className="p-4"><div className="font-bold">{result.studentName}</div><div className="font-mono text-xs text-slate-500">{result.studentId}</div></td><td className="p-4">{result.subject}</td><td className="p-4 text-center">{result.score}</td><td className="p-4 text-center"><span className="rounded-full bg-green-100 px-3 py-1 font-bold text-green-700">{result.grade}</span></td><td className="p-4 text-center"><span className={result.status === 'Approved' ? 'font-bold text-green-700' : 'font-bold text-orange-600'}>{result.status}</span></td><td className="p-4 text-slate-600">{result.uploadedAt}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
