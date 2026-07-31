'use client';

import { useState } from 'react';

type UploadedResult = {
  studentId: string;
  subject: string;
  score: string;
  term: string;
  grade: string;
  uploadedAt: string;
};

export default function TeacherDashboard() {
  const [uploadedResults, setUploadedResults] = useState<UploadedResult[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [newResult, setNewResult] = useState({
    studentId: '',
    subject: 'Mathematics',
    score: '',
    term: 'First Term 2025/2026'
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newResult.studentId && newResult.score) {
      const result = {
        ...newResult,
        grade: parseInt(newResult.score) >= 70 ? 'A' : 
               parseInt(newResult.score) >= 60 ? 'B' : 
               parseInt(newResult.score) >= 50 ? 'C' : 'D',
        uploadedAt: new Date().toISOString()
      };
      
      setUploadedResults([...uploadedResults, result]);
      setNewResult({ studentId: '', subject: 'Mathematics', score: '', term: 'First Term 2025/2026' });
      setShowForm(false);
      alert('Result uploaded successfully! (Demo)');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Teacher Dashboard</h1>
          <p className="text-gray-600">Welcome, Mr. Adebayo Okoro (Mathematics)</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-green-700 text-white px-6 py-3 rounded-xl font-semibold"
        >
          {showForm ? 'Cancel' : '+ Upload New Result'}
        </button>
      </div>

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
                onChange={(e) => setNewResult({...newResult, studentId: e.target.value})}
                className="w-full border p-3 rounded-xl" 
                placeholder="ICS/2025/045" 
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <select 
                value={newResult.subject}
                onChange={(e) => setNewResult({...newResult, subject: e.target.value})}
                className="w-full border p-3 rounded-xl"
              >
                <option>Mathematics</option>
                <option>English Language</option>
                <option>Physics</option>
                <option>Chemistry</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Score (0-100)</label>
              <input 
                type="number" 
                value={newResult.score}
                onChange={(e) => setNewResult({...newResult, score: e.target.value})}
                className="w-full border p-3 rounded-xl" 
                min="0" 
                max="100" 
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Term</label>
              <input 
                type="text" 
                value={newResult.term}
                onChange={(e) => setNewResult({...newResult, term: e.target.value})}
                className="w-full border p-3 rounded-xl" 
              />
            </div>

            <div className="md:col-span-2">
              <button 
                type="submit"
                className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-xl font-semibold"
              >
                Upload Result
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Uploaded Results */}
      <div className="bg-white rounded-2xl shadow p-8">
        <h2 className="text-2xl font-semibold mb-6">Recently Uploaded Results ({uploadedResults.length})</h2>
        
        {uploadedResults.length === 0 ? (
          <p className="text-gray-500">No results uploaded yet. Click "Upload New Result" to add one.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-4">Student ID</th>
                <th className="text-left p-4">Subject</th>
                <th className="text-center p-4">Score</th>
                <th className="text-center p-4">Grade</th>
                <th className="text-left p-4">Term</th>
              </tr>
            </thead>
            <tbody>
              {uploadedResults.map((result, index) => (
                <tr key={index} className="border-b">
                  <td className="p-4 font-mono">{result.studentId}</td>
                  <td className="p-4">{result.subject}</td>
                  <td className="p-4 text-center">{result.score}</td>
                  <td className="p-4 text-center">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
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

      <div className="mt-8 text-sm text-gray-500">
        Note: In a real system, uploaded results would go to admin for approval before appearing in student portals.
      </div>
    </div>
  );
}
