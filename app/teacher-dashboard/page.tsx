'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SUBJECTS, TERMS, SESSIONS, CURRENT_SESSION, CONDUCT_RATINGS } from '@/lib/grade';
import { CLASSES } from '@/lib/constants';

type UploadedResult = {
  id: string;
  student_id: string;
  subject: string;
  score: number;
  ca_score: number | null;
  exam_score: number | null;
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

type OcrRosterStudent = { student_id: string; full_name: string };

type OcrRow = {
  label: string;
  score: number | null;
  caScore: number | null;
  examScore: number | null;
  matchedStudentId: string | null;
  matchedStudentName: string | null;
};

export default function TeacherDashboard() {
  const router = useRouter();
  const [teacherName, setTeacherName] = useState('');
  const [uploadedResults, setUploadedResults] = useState<UploadedResult[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showBatch, setShowBatch] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const [showReportCard, setShowReportCard] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [newResult, setNewResult] = useState({
    studentId: '',
    subject: SUBJECTS[0],
    caScore: '',
    examScore: '',
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
  const [scores, setScores] = useState<Record<string, { ca: string; exam: string }>>({});
  const [batchSubmitting, setBatchSubmitting] = useState(false);
  const [batchResult, setBatchResult] = useState<{
    created: number;
    skipped: number;
    errors: { studentId: string; reason: string }[];
  } | null>(null);

  // "Upload from Photo" -- read a mark sheet photo, then review/correct the
  // extracted rows before anything is saved.
  const [ocrSetup, setOcrSetup] = useState({
    className: CLASSES[0],
    subject: SUBJECTS[0],
    session: CURRENT_SESSION,
    term: TERMS[0],
  });
  const [ocrFile, setOcrFile] = useState<File | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState('');
  const [ocrRows, setOcrRows] = useState<OcrRow[] | null>(null);
  const [ocrRoster, setOcrRoster] = useState<OcrRosterStudent[]>([]);
  const [ocrSaving, setOcrSaving] = useState(false);
  const [ocrSaveResult, setOcrSaveResult] = useState<{ created: number; skipped: number } | null>(null);

  // Report card comments -- attendance, conduct, and the class teacher's
  // remark for one student's term. Principal's comment is admin-only.
  const [rcLookup, setRcLookup] = useState({ studentId: '', session: CURRENT_SESSION, term: TERMS[0] });
  const [rcLoading, setRcLoading] = useState(false);
  const [rcSaving, setRcSaving] = useState(false);
  const [rcError, setRcError] = useState('');
  const [rcNotice, setRcNotice] = useState('');
  const [rcForm, setRcForm] = useState({
    daysSchoolOpened: '',
    daysPresent: '',
    timesPunctual: '',
    conductRating: '',
    teacherComment: '',
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
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.fullName) setTeacherName(data.fullName);
      });
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResult.studentId || (!newResult.caScore && !newResult.examScore)) return;

    setSubmitting(true);
    setError('');
    setNotice('');

    try {
      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newResult, uploadedBy: teacherName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload result.');

      setNewResult({ studentId: '', subject: SUBJECTS[0], caScore: '', examScore: '', session: CURRENT_SESSION, term: TERMS[0] });
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
      .filter((s) => scores[s.student_id]?.ca?.trim() || scores[s.student_id]?.exam?.trim())
      .map((s) => ({
        studentId: s.student_id,
        caScore: scores[s.student_id]?.ca || undefined,
        examScore: scores[s.student_id]?.exam || undefined,
      }));

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
          uploadedBy: teacherName,
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

  const handleOcrExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ocrFile) return;

    setOcrLoading(true);
    setOcrError('');
    setOcrRows(null);
    setOcrSaveResult(null);

    try {
      const formData = new FormData();
      formData.append('file', ocrFile);
      formData.append('className', ocrSetup.className);

      const res = await fetch('/api/results/ocr', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to read that photo.');

      setOcrRows(data.rows);
      setOcrRoster(data.roster ?? []);
    } catch (err) {
      setOcrError((err as Error).message);
    } finally {
      setOcrLoading(false);
    }
  };

  const updateOcrRow = (index: number, patch: Partial<OcrRow>) => {
    setOcrRows((prev) => (prev ? prev.map((r, i) => (i === index ? { ...r, ...patch } : r)) : prev));
  };

  const handleOcrSave = async () => {
    if (!ocrRows) return;
    const entries = ocrRows
      .filter((r) => r.matchedStudentId && (r.score !== null || r.caScore !== null || r.examScore !== null))
      .map((r) => ({
        studentId: r.matchedStudentId,
        score: r.score ?? undefined,
        caScore: r.caScore ?? undefined,
        examScore: r.examScore ?? undefined,
      }));

    if (entries.length === 0) {
      setOcrError('Match at least one row to a student before saving.');
      return;
    }

    setOcrSaving(true);
    setOcrError('');

    try {
      const res = await fetch('/api/results/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: ocrSetup.subject,
          session: ocrSetup.session,
          term: ocrSetup.term,
          uploadedBy: teacherName,
          entries,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save results.');
      setOcrSaveResult({ created: data.created, skipped: data.skipped });
      setOcrRows(null);
      setOcrFile(null);
      loadResults();
    } catch (err) {
      setOcrError((err as Error).message);
    } finally {
      setOcrSaving(false);
    }
  };

  const loadReportCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rcLookup.studentId) return;

    setRcLoading(true);
    setRcError('');
    setRcNotice('');

    try {
      const res = await fetch(
        `/api/report-cards?studentId=${encodeURIComponent(rcLookup.studentId)}&session=${encodeURIComponent(rcLookup.session)}&term=${encodeURIComponent(rcLookup.term)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load report card.');
      const rc = data.reportCard;
      setRcForm({
        daysSchoolOpened: rc?.days_school_opened?.toString() ?? '',
        daysPresent: rc?.days_present?.toString() ?? '',
        timesPunctual: rc?.times_punctual?.toString() ?? '',
        conductRating: rc?.conduct_rating ?? '',
        teacherComment: rc?.teacher_comment ?? '',
      });
    } catch (err) {
      setRcError((err as Error).message);
    } finally {
      setRcLoading(false);
    }
  };

  const saveReportCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rcLookup.studentId) return;

    setRcSaving(true);
    setRcError('');
    setRcNotice('');

    try {
      const res = await fetch('/api/report-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: rcLookup.studentId,
          session: rcLookup.session,
          term: rcLookup.term,
          daysSchoolOpened: rcForm.daysSchoolOpened,
          daysPresent: rcForm.daysPresent,
          timesPunctual: rcForm.timesPunctual,
          conductRating: rcForm.conductRating,
          teacherComment: rcForm.teacherComment,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save report card.');
      setRcNotice('Saved. This will show on the student portal alongside their results.');
    } catch (err) {
      setRcError((err as Error).message);
    } finally {
      setRcSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold">Teacher Dashboard</h1>
          <p className="text-gray-600">Welcome, {teacherName || '...'}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleLogout} className="text-sm text-red-600 hover:underline self-center">
            Logout
          </button>
          <button
            onClick={() => {
              setShowReportCard(!showReportCard);
              setShowForm(false);
              setShowBatch(false);
              setShowPhoto(false);
            }}
            className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold"
          >
            {showReportCard ? 'Cancel' : 'Report Card Comments'}
          </button>
          <button
            onClick={() => {
              setShowPhoto(!showPhoto);
              setShowForm(false);
              setShowBatch(false);
              setShowReportCard(false);
            }}
            className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold"
          >
            {showPhoto ? 'Cancel' : 'Upload from Photo'}
          </button>
          <button
            onClick={() => {
              setShowBatch(!showBatch);
              setShowForm(false);
              setShowPhoto(false);
              setShowReportCard(false);
            }}
            className="bg-white border border-[var(--brand-color)] text-[var(--brand-color)] px-6 py-3 rounded-xl font-semibold"
          >
            {showBatch ? 'Cancel' : 'Upload Results for a Class'}
          </button>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setShowBatch(false);
              setShowPhoto(false);
              setShowReportCard(false);
            }}
            className="bg-[var(--brand-color)] text-white px-6 py-3 rounded-xl font-semibold"
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
              <label className="block text-sm font-medium mb-2">CA Score</label>
              <input
                type="number"
                value={newResult.caScore}
                onChange={(e) => setNewResult({ ...newResult, caScore: e.target.value })}
                className="w-full border p-3 rounded-xl"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Exam Score</label>
              <input
                type="number"
                value={newResult.examScore}
                onChange={(e) => setNewResult({ ...newResult, examScore: e.target.value })}
                className="w-full border p-3 rounded-xl"
                min="0"
              />
            </div>

            <div className="md:col-span-2 text-sm text-gray-500">
              Total: {(Number(newResult.caScore) || 0) + (Number(newResult.examScore) || 0)} / 100
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
                className="w-full bg-[var(--brand-color)] hover:brightness-90 text-white py-3 rounded-xl font-semibold disabled:opacity-60"
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
            Pick your class, subject, and term, load the roster, then enter CA and/or Exam scores for each student.
            Leave a student blank to skip them.
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
                        <th className="text-center p-3">CA</th>
                        <th className="text-center p-3">Exam</th>
                        <th className="text-center p-3">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roster.map((s) => {
                        const ca = scores[s.student_id]?.ca ?? '';
                        const exam = scores[s.student_id]?.exam ?? '';
                        return (
                          <tr key={s.id} className="border-b">
                            <td className="p-3 font-mono">{s.student_id}</td>
                            <td className="p-3">{s.full_name}</td>
                            <td className="p-3 text-center">
                              <input
                                type="number"
                                min="0"
                                value={ca}
                                onChange={(e) =>
                                  setScores({ ...scores, [s.student_id]: { ca: e.target.value, exam } })
                                }
                                className="w-20 rounded-lg border p-2 text-center"
                              />
                            </td>
                            <td className="p-3 text-center">
                              <input
                                type="number"
                                min="0"
                                value={exam}
                                onChange={(e) =>
                                  setScores({ ...scores, [s.student_id]: { ca, exam: e.target.value } })
                                }
                                className="w-20 rounded-lg border p-2 text-center"
                              />
                            </td>
                            <td className="p-3 text-center text-gray-500">
                              {(Number(ca) || 0) + (Number(exam) || 0) || '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <button
                    type="submit"
                    disabled={batchSubmitting}
                    className="w-full bg-[var(--brand-color)] hover:brightness-90 text-white py-3 rounded-xl font-semibold disabled:opacity-60"
                  >
                    {batchSubmitting ? 'Uploading...' : 'Upload All Scores'}
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      )}

      {/* Upload from Photo */}
      {showPhoto && (
        <div className="bg-white p-8 rounded-2xl shadow mb-10 border">
          <h2 className="text-2xl font-semibold mb-2">Upload from Photo</h2>
          <p className="text-sm text-gray-500 mb-6">
            Take a photo of your mark sheet or registry and we&apos;ll read the scores for you. Review and correct
            the table below before saving &mdash; nothing is saved automatically.
          </p>

          <form onSubmit={handleOcrExtract} className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Class</label>
                <select
                  value={ocrSetup.className}
                  onChange={(e) => setOcrSetup({ ...ocrSetup, className: e.target.value })}
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
                  value={ocrSetup.subject}
                  onChange={(e) => setOcrSetup({ ...ocrSetup, subject: e.target.value })}
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
                  value={ocrSetup.session}
                  onChange={(e) => setOcrSetup({ ...ocrSetup, session: e.target.value })}
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
                  value={ocrSetup.term}
                  onChange={(e) => setOcrSetup({ ...ocrSetup, term: e.target.value })}
                  className="w-full border p-3 rounded-xl"
                >
                  {TERMS.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setOcrFile(e.target.files?.[0] ?? null)}
              className="w-full rounded-xl border p-3"
              required
            />

            <button
              type="submit"
              disabled={ocrLoading || !ocrFile}
              className="rounded-xl bg-gray-900 text-white px-6 py-3 font-semibold disabled:opacity-60"
            >
              {ocrLoading ? 'Reading photo...' : 'Read Photo'}
            </button>
          </form>

          {ocrError && <p className="text-sm text-red-600 mb-4">{ocrError}</p>}

          {ocrSaveResult && (
            <div className="mb-6 rounded-xl bg-green-50 p-4 text-sm text-green-800">
              Saved {ocrSaveResult.created} result{ocrSaveResult.created === 1 ? '' : 's'}.
              {ocrSaveResult.skipped > 0 && ` ${ocrSaveResult.skipped} row(s) skipped.`}
            </div>
          )}

          {ocrRows && (
            <div>
              <p className="text-sm text-amber-700 bg-amber-50 rounded-xl p-4 mb-4">
                Check every row below &mdash; photo reading isn&apos;t perfect, especially on handwriting. Fix the
                matched student or the scores before saving.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full mb-6">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-3">As Read</th>
                      <th className="text-left p-3">Matched Student</th>
                      <th className="text-center p-3">CA</th>
                      <th className="text-center p-3">Exam</th>
                      <th className="text-center p-3">Score (if single)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ocrRows.map((row, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-3 text-gray-500">{row.label}</td>
                        <td className="p-3">
                          <select
                            value={row.matchedStudentId ?? ''}
                            onChange={(e) => {
                              const student = ocrRoster.find((s) => s.student_id === e.target.value);
                              updateOcrRow(i, {
                                matchedStudentId: e.target.value || null,
                                matchedStudentName: student?.full_name ?? null,
                              });
                            }}
                            className="w-full rounded-lg border p-2"
                          >
                            <option value="">— Not matched —</option>
                            {ocrRoster.map((s) => (
                              <option key={s.student_id} value={s.student_id}>
                                {s.student_id} &middot; {s.full_name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="number"
                            min="0"
                            value={row.caScore ?? ''}
                            onChange={(e) => updateOcrRow(i, { caScore: e.target.value === '' ? null : Number(e.target.value) })}
                            className="w-20 rounded-lg border p-2 text-center"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="number"
                            min="0"
                            value={row.examScore ?? ''}
                            onChange={(e) => updateOcrRow(i, { examScore: e.target.value === '' ? null : Number(e.target.value) })}
                            className="w-20 rounded-lg border p-2 text-center"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="number"
                            min="0"
                            value={row.score ?? ''}
                            onChange={(e) => updateOcrRow(i, { score: e.target.value === '' ? null : Number(e.target.value) })}
                            className="w-20 rounded-lg border p-2 text-center"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                onClick={handleOcrSave}
                disabled={ocrSaving}
                className="w-full bg-[var(--brand-color)] hover:brightness-90 text-white py-3 rounded-xl font-semibold disabled:opacity-60"
              >
                {ocrSaving ? 'Saving...' : 'Save Reviewed Results'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Report Card Comments */}
      {showReportCard && (
        <div className="bg-white p-8 rounded-2xl shadow mb-10 border">
          <h2 className="text-2xl font-semibold mb-2">Report Card Comments</h2>
          <p className="text-sm text-gray-500 mb-6">
            Attendance, conduct, and your comment for one student&apos;s term &mdash; shown on their report card
            alongside subject results.
          </p>

          <form onSubmit={loadReportCard} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <input
              type="text"
              placeholder="Student ID"
              value={rcLookup.studentId}
              onChange={(e) => setRcLookup({ ...rcLookup, studentId: e.target.value })}
              className="w-full border p-3 rounded-xl"
              required
            />
            <select
              value={rcLookup.session}
              onChange={(e) => setRcLookup({ ...rcLookup, session: e.target.value })}
              className="w-full border p-3 rounded-xl"
            >
              {SESSIONS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select
              value={rcLookup.term}
              onChange={(e) => setRcLookup({ ...rcLookup, term: e.target.value })}
              className="w-full border p-3 rounded-xl"
            >
              {TERMS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={rcLoading}
              className="rounded-xl bg-gray-900 text-white px-6 py-3 font-semibold disabled:opacity-60"
            >
              {rcLoading ? 'Loading...' : 'Load'}
            </button>
          </form>

          {rcError && <p className="text-sm text-red-600 mb-4">{rcError}</p>}
          {rcNotice && <p className="text-sm text-green-700 mb-4">{rcNotice}</p>}

          <form onSubmit={saveReportCard} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Days School Opened</label>
              <input
                type="number"
                min="0"
                value={rcForm.daysSchoolOpened}
                onChange={(e) => setRcForm({ ...rcForm, daysSchoolOpened: e.target.value })}
                className="w-full border p-3 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Days Present</label>
              <input
                type="number"
                min="0"
                value={rcForm.daysPresent}
                onChange={(e) => setRcForm({ ...rcForm, daysPresent: e.target.value })}
                className="w-full border p-3 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Times Punctual</label>
              <input
                type="number"
                min="0"
                value={rcForm.timesPunctual}
                onChange={(e) => setRcForm({ ...rcForm, timesPunctual: e.target.value })}
                className="w-full border p-3 rounded-xl"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium mb-2">Conduct</label>
              <select
                value={rcForm.conductRating}
                onChange={(e) => setRcForm({ ...rcForm, conductRating: e.target.value })}
                className="w-full border p-3 rounded-xl"
              >
                <option value="">— Not set —</option>
                {CONDUCT_RATINGS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium mb-2">Class Teacher&apos;s Comment</label>
              <textarea
                value={rcForm.teacherComment}
                onChange={(e) => setRcForm({ ...rcForm, teacherComment: e.target.value })}
                className="w-full border p-3 rounded-xl"
                rows={3}
              />
            </div>
            <div className="md:col-span-3">
              <button
                type="submit"
                disabled={rcSaving || !rcLookup.studentId}
                className="w-full bg-[var(--brand-color)] hover:brightness-90 text-white py-3 rounded-xl font-semibold disabled:opacity-60"
              >
                {rcSaving ? 'Saving...' : 'Save Report Card Comments'}
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
                <th className="text-center p-4">CA</th>
                <th className="text-center p-4">Exam</th>
                <th className="text-center p-4">Total</th>
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
                  <td className="p-4 text-center text-gray-500">{result.ca_score ?? '—'}</td>
                  <td className="p-4 text-center text-gray-500">{result.exam_score ?? '—'}</td>
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
