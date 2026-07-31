'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';

type Result = { subject: string; score: number; grade: string; term: string; remark: string };

const demoResults: Result[] = [
  { subject: 'Mathematics', score: 85, grade: 'A', term: 'First Term 2026/2027', remark: 'Excellent' },
  { subject: 'English Language', score: 78, grade: 'B', term: 'First Term 2026/2027', remark: 'Very good' },
  { subject: 'Physics', score: 92, grade: 'A', term: 'First Term 2026/2027', remark: 'Excellent' },
  { subject: 'Chemistry', score: 71, grade: 'A', term: 'First Term 2026/2027', remark: 'Strong performance' },
  { subject: 'Biology', score: 66, grade: 'B', term: 'First Term 2026/2027', remark: 'Good' },
];

export default function StudentPortal() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');

  const average = useMemo(() => Math.round(demoResults.reduce((sum, result) => sum + result.score, 0) / demoResults.length), []);

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (studentId.trim() && password.trim()) setLoggedIn(true);
  };

  if (!loggedIn) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-sm">
          <Link href="/" className="text-sm font-bold text-green-700">← Back to landing page</Link>
          <h1 className="mt-6 text-3xl font-black">Student Results Portal</h1>
          <p className="mt-2 text-slate-600">Enter any demo student ID and password to view a sample report card.</p>
          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <input value={studentId} onChange={(event) => setStudentId(event.target.value)} className="w-full rounded-xl border p-3" placeholder="Student ID, e.g. ICS/2026/001" required />
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border p-3" placeholder="Password" required />
            <button className="w-full rounded-xl bg-green-700 py-3 font-bold text-white hover:bg-green-800">View results</button>
          </form>
          <p className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-800">Demo access: any student ID and password works.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <Link href="/" className="text-sm font-bold text-green-700">← Back to landing page</Link>
            <h1 className="mt-3 text-4xl font-black">Welcome, Student {studentId}</h1>
            <p className="text-slate-600">First Term 2026/2027 approved report card</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => window.print()} className="rounded-xl border border-slate-300 px-5 py-3 font-bold hover:bg-white">Print report</button>
            <button onClick={() => { setLoggedIn(false); setStudentId(''); setPassword(''); }} className="rounded-xl bg-red-600 px-5 py-3 font-bold text-white hover:bg-red-700">Logout</button>
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm"><p className="text-sm text-slate-500">Average score</p><p className="text-4xl font-black text-green-700">{average}%</p></div>
          <div className="rounded-2xl bg-white p-6 shadow-sm"><p className="text-sm text-slate-500">Subjects</p><p className="text-4xl font-black">{demoResults.length}</p></div>
          <div className="rounded-2xl bg-white p-6 shadow-sm"><p className="text-sm text-slate-500">Position remark</p><p className="text-2xl font-black">Excellent progress</p></div>
        </div>

        <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-slate-100 text-left"><tr><th className="p-4">Subject</th><th className="p-4 text-center">Score</th><th className="p-4 text-center">Grade</th><th className="p-4">Remark</th><th className="p-4">Term</th></tr></thead>
              <tbody>{demoResults.map((result) => <tr key={result.subject} className="border-t"><td className="p-4 font-bold">{result.subject}</td><td className="p-4 text-center">{result.score}</td><td className="p-4 text-center"><span className="rounded-full bg-green-100 px-3 py-1 font-bold text-green-700">{result.grade}</span></td><td className="p-4">{result.remark}</td><td className="p-4 text-slate-600">{result.term}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
