'use client';

import { useState } from 'react';
import Link from 'next/link';

type Result = {
  studentId: string;
  subject: string;
  score: number;
  grade: string;
  status: 'Approved' | 'Pending';
};

export default function AdminDashboard() {
  const [results] = useState<Result[]>([
    { studentId: "ICS/2025/045", subject: "Mathematics", score: 85, grade: "A", status: "Approved" },
    { studentId: "ICS/2025/012", subject: "Physics", score: 78, grade: "B", status: "Pending" },
  ]);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-6">
        <h2 className="font-bold text-xl mb-8">Admin Dashboard</h2>
        <nav className="space-y-1 text-sm">
          <div className="px-4 py-2 bg-white/10 rounded">Dashboard</div>
          <Link href="/admin" className="block px-4 py-2 hover:bg-white/10 rounded">Manage Results</Link>
          <Link href="/teacher-dashboard" className="block px-4 py-2 hover:bg-white/10 rounded">Teacher Uploads</Link>
          <div className="px-4 py-2 hover:bg-white/10 rounded">News & Events</div>
          <div className="px-4 py-2 hover:bg-white/10 rounded">Gallery</div>
          <div className="px-4 py-2 hover:bg-white/10 rounded">Settings</div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <Link 
            href="/teacher-dashboard" 
            className="bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium"
          >
            Go to Teacher Uploads
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow">
            <div className="text-sm text-gray-500">Total Students</div>
            <div className="text-4xl font-bold mt-1">1,250</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow">
            <div className="text-sm text-gray-500">Results Uploaded</div>
            <div className="text-4xl font-bold mt-1 text-green-700">312</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow">
            <div className="text-sm text-gray-500">Pending Approval</div>
            <div className="text-4xl font-bold mt-1 text-orange-600">47</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-8">
          <h2 className="text-2xl font-semibold mb-6">Recent Results</h2>
          
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-4">Student ID</th>
                <th className="text-left p-4">Subject</th>
                <th className="text-center p-4">Score</th>
                <th className="text-center p-4">Grade</th>
                <th className="text-center p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} className="border-b">
                  <td className="p-4 font-mono">{r.studentId}</td>
                  <td className="p-4">{r.subject}</td>
                  <td className="p-4 text-center">{r.score}</td>
                  <td className="p-4 text-center">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">{r.grade}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={r.status === "Approved" ? "text-green-600" : "text-orange-600"}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
