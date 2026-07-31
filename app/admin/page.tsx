'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

type Result = { id: number; studentId: string; studentName: string; subject: string; score: number; grade: string; status: 'Approved' | 'Pending' | 'Rejected' };

export default function AdminDashboard() {
  const [results, setResults] = useState<Result[]>([
    { id: 1, studentId: 'ICS/2026/001', studentName: 'Amara Johnson', subject: 'Mathematics', score: 86, grade: 'A', status: 'Approved' },
    { id: 2, studentId: 'ICS/2026/014', studentName: 'Daniel Okoro', subject: 'Physics', score: 68, grade: 'B', status: 'Pending' },
    { id: 3, studentId: 'ICS/2026/009', studentName: 'Fatima Bello', subject: 'English Language', score: 74, grade: 'A', status: 'Pending' },
  ]);

  const stats = useMemo(() => ({
    students: new Set(results.map((result) => result.studentId)).size,
    uploaded: results.length,
    pending: results.filter((result) => result.status === 'Pending').length,
    approved: results.filter((result) => result.status === 'Approved').length,
  }), [results]);

  const updateStatus = (id: number, status: Result['status']) => {
    setResults((current) => current.map((result) => result.id === id ? { ...result, status } : result));
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="bg-slate-950 p-6 text-white lg:w-72">
          <Link href="/" className="text-xl font-black">Intellect Schools</Link>
          <p className="mt-2 text-sm text-slate-300">Administration console</p>
          <nav className="mt-8 grid gap-2 text-sm font-semibold">
            <Link href="/admin" className="rounded-xl bg-white/10 px-4 py-3">Dashboard</Link>
            <Link href="/teacher-dashboard" className="rounded-xl px-4 py-3 hover:bg-white/10">Teacher Uploads</Link>
            <Link href="/portal" className="rounded-xl px-4 py-3 hover:bg-white/10">Student Portal</Link>
            <Link href="/" className="rounded-xl px-4 py-3 hover:bg-white/10">Landing Page</Link>
          </nav>
        </aside>

        <section className="flex-1 p-6 lg:p-10">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-4xl font-black">Admin Dashboard</h1>
              <p className="text-slate-600">Approve results, review metrics, and move through every working page.</p>
            </div>
            <Link href="/teacher-dashboard" className="rounded-xl bg-green-700 px-5 py-3 text-center font-bold text-white hover:bg-green-800">Go to uploads</Link>
          </div>

          <div className="mb-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-white p-6 shadow-sm"><p className="text-sm text-slate-500">Students</p><p className="text-4xl font-black">{stats.students}</p></div>
            <div className="rounded-2xl bg-white p-6 shadow-sm"><p className="text-sm text-slate-500">Uploaded</p><p className="text-4xl font-black text-green-700">{stats.uploaded}</p></div>
            <div className="rounded-2xl bg-white p-6 shadow-sm"><p className="text-sm text-slate-500">Pending</p><p className="text-4xl font-black text-orange-600">{stats.pending}</p></div>
            <div className="rounded-2xl bg-white p-6 shadow-sm"><p className="text-sm text-slate-500">Approved</p><p className="text-4xl font-black text-emerald-700">{stats.approved}</p></div>
          </div>

          <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
            <div className="border-b p-6"><h2 className="text-2xl font-black">Result Approval Queue</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] text-sm">
                <thead className="bg-slate-100 text-left"><tr><th className="p-4">Student</th><th className="p-4">Subject</th><th className="p-4 text-center">Score</th><th className="p-4 text-center">Grade</th><th className="p-4 text-center">Status</th><th className="p-4 text-center">Actions</th></tr></thead>
                <tbody>{results.map((result) => <tr key={result.id} className="border-t"><td className="p-4"><div className="font-bold">{result.studentName}</div><div className="font-mono text-xs text-slate-500">{result.studentId}</div></td><td className="p-4">{result.subject}</td><td className="p-4 text-center">{result.score}</td><td className="p-4 text-center"><span className="rounded-full bg-green-100 px-3 py-1 font-bold text-green-700">{result.grade}</span></td><td className="p-4 text-center"><span className={result.status === 'Approved' ? 'font-bold text-green-700' : result.status === 'Rejected' ? 'font-bold text-red-600' : 'font-bold text-orange-600'}>{result.status}</span></td><td className="p-4"><div className="flex justify-center gap-2"><button onClick={() => updateStatus(result.id, 'Approved')} className="rounded-lg bg-green-700 px-3 py-2 font-bold text-white disabled:opacity-40" disabled={result.status === 'Approved'}>Approve</button><button onClick={() => updateStatus(result.id, 'Rejected')} className="rounded-lg bg-red-600 px-3 py-2 font-bold text-white disabled:opacity-40" disabled={result.status === 'Rejected'}>Reject</button></div></td></tr>)}</tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
