'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function StudentPortal() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Demo login - any ID works
    if (studentId) {
      // Sample results
      const sampleResults = [
        { subject: "Mathematics", score: 85, grade: "A", term: "First Term 2025/2026" },
        { subject: "English Language", score: 78, grade: "B", term: "First Term 2025/2026" },
        { subject: "Physics", score: 92, grade: "A", term: "First Term 2025/2026" },
        { subject: "Chemistry", score: 71, grade: "B", term: "First Term 2025/2026" },
      ];
      setResults(sampleResults);
      setLoggedIn(true);
    }
  };

  if (loggedIn) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome, Student {studentId}</h1>
            <p className="text-gray-600">First Term 2025/2026 Results</p>
          </div>
          <button 
            onClick={() => { setLoggedIn(false); setStudentId(''); setResults([]); }}
            className="text-sm text-red-600 hover:underline"
          >
            Logout
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow p-8">
          <h2 className="text-2xl font-semibold mb-6">Your Results</h2>
          
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-4">Subject</th>
                <th className="text-center p-4">Score</th>
                <th className="text-center p-4">Grade</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={index} className="border-b">
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

          <div className="mt-8 p-4 bg-green-50 rounded-xl text-sm">
            <strong>Note:</strong> These are demo results. In production, results will be uploaded by your teachers and approved by the admin.
          </div>
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
        <button 
          type="submit" 
          className="w-full bg-green-700 text-white py-3 rounded-xl font-semibold hover:bg-green-800"
        >
          Login
        </button>
      </form>

      <p className="text-center text-sm mt-4 text-gray-500">
        Demo: Enter any Student ID to login
      </p>
    </div>
  );
}
