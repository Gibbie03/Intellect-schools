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
  const [showAttendance, setShowAttendance] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
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
  // remark for one student's term. Restricted to the teacher's own assigned
  // class (set by an admin); principal's comment is admin-only.
  const [classTeacherOf, setClassTeacherOf] = useState<string | null>(null);
  const [rcRoster, setRcRoster] = useState<RosterStudent[]>([]);
  const [rcLookup, setRcLookup] = useState({ studentId: '', session: CURRENT_SESSION, term: TERMS[0] });
  const [rcStatus, setRcStatus] = useState<'Draft' | 'Published' | null>(null);
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

  // Daily attendance -- restricted to the teacher's own assigned class, same
  // as report card comments above.
  const [attDate, setAttDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [attSession, setAttSession] = useState(CURRENT_SESSION);
  const [attTerm, setAttTerm] = useState(TERMS[0]);
  const [attMarks, setAttMarks] = useState<Record<string, 'Present' | 'Absent' | 'Late'>>({});
  const [attLoading, setAttLoading] = useState(false);
  const [attSaving, setAttSaving] = useState(false);
  const [attError, setAttError] = useState('');
  const [attNotice, setAttNotice] = useState('');

  // Two-factor authentication (self-service, per account).
  const [totpEnabled, setTotpEnabled] = useState<boolean | null>(null);
  const [setupData, setSetupData] = useState<{ secret: string; qrCodeDataUrl: string } | null>(null);
  const [confirmCode, setConfirmCode] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [settingUp, setSettingUp] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [showDisable, setShowDisable] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [securityError, setSecurityError] = useState('');
  const [securityNotice, setSecurityNotice] = useState('');

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
        setClassTeacherOf(data.classTeacherOf ?? null);
        setTotpEnabled(Boolean(data.totpEnabled));
      });
  }, []);

  useEffect(() => {
    if (!classTeacherOf) return;
    fetch(`/api/students?class=${encodeURIComponent(classTeacherOf)}&status=Active`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setRcRoster(data.students);
      })
      .catch(() => {});
  }, [classTeacherOf]);

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
      setNotice('Result uploaded. It will appear on the student portal once the class teacher publishes this term’s report card.');
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
      setRcStatus(rc?.status ?? 'Draft');
    } catch (err) {
      setRcError((err as Error).message);
    } finally {
      setRcLoading(false);
    }
  };

  const persistReportCard = async (publish?: boolean) => {
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
          ...(publish !== undefined ? { publish } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save report card.');
      setRcStatus(data.reportCard?.status ?? 'Draft');
      setRcNotice(
        publish === true
          ? 'Published — this term is now visible on the student portal.'
          : publish === false
          ? 'Reverted to Draft — no longer visible on the student portal.'
          : 'Saved as Draft.'
      );
    } catch (err) {
      setRcError((err as Error).message);
    } finally {
      setRcSaving(false);
    }
  };

  const saveReportCard = (e: React.FormEvent) => {
    e.preventDefault();
    persistReportCard();
  };

  const startTotpSetup = async () => {
    setSettingUp(true);
    setSecurityError('');
    setSecurityNotice('');
    try {
      const res = await fetch('/api/auth/2fa/setup', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start setup.');
      setSetupData({ secret: data.secret, qrCodeDataUrl: data.qrCodeDataUrl });
    } catch (err) {
      setSecurityError((err as Error).message);
    } finally {
      setSettingUp(false);
    }
  };

  const handleConfirmTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfirming(true);
    setSecurityError('');
    try {
      const res = await fetch('/api/auth/2fa/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: confirmCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid code.');
      setSetupData(null);
      setConfirmCode('');
      setTotpEnabled(true);
      setSecurityNotice('Two-factor authentication is now on for your account.');
    } catch (err) {
      setSecurityError((err as Error).message);
    } finally {
      setConfirming(false);
    }
  };

  const handleDisableTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    setDisabling(true);
    setSecurityError('');
    try {
      const res = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: disablePassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to disable.');
      setTotpEnabled(false);
      setShowDisable(false);
      setDisablePassword('');
      setSecurityNotice('Two-factor authentication has been turned off.');
    } catch (err) {
      setSecurityError((err as Error).message);
    } finally {
      setDisabling(false);
    }
  };

  const autofillAttendance = async () => {
    if (!rcLookup.studentId) return;
    setRcError('');
    try {
      const res = await fetch(
        `/api/attendance?studentId=${encodeURIComponent(rcLookup.studentId)}&session=${encodeURIComponent(rcLookup.session)}&term=${encodeURIComponent(rcLookup.term)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load attendance.');
      setRcForm((prev) => ({
        ...prev,
        daysSchoolOpened: String(data.totalDays),
        daysPresent: String(data.daysPresent),
      }));
    } catch (err) {
      setRcError((err as Error).message);
    }
  };

  useEffect(() => {
    if (!showAttendance || !classTeacherOf) return;

    setAttLoading(true);
    setAttError('');
    setAttNotice('');
    fetch(`/api/attendance?class=${encodeURIComponent(classTeacherOf)}&date=${encodeURIComponent(attDate)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        const initial: Record<string, 'Present' | 'Absent' | 'Late'> = {};
        (data.roster ?? []).forEach((s: RosterStudent) => {
          initial[s.student_id] = 'Present';
        });
        (data.marks ?? []).forEach((m: { student_id: string; status: 'Present' | 'Absent' | 'Late' }) => {
          initial[m.student_id] = m.status;
        });
        setAttMarks(initial);
      })
      .catch((err) => setAttError(err.message))
      .finally(() => setAttLoading(false));
  }, [showAttendance, classTeacherOf, attDate]);

  const saveAttendance = async () => {
    if (!classTeacherOf) return;
    setAttSaving(true);
    setAttError('');
    setAttNotice('');
    try {
      const records = rcRoster.map((s) => ({ studentId: s.student_id, status: attMarks[s.student_id] || 'Present' }));
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ class: classTeacherOf, date: attDate, session: attSession, term: attTerm, records }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save attendance.');
      setAttNotice(`Saved attendance for ${data.count} student(s).`);
    } catch (err) {
      setAttError((err as Error).message);
    } finally {
      setAttSaving(false);
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
              setShowAttendance(false);
              setShowSecurity(false);
            }}
            className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold"
          >
            {showReportCard ? 'Cancel' : 'Report Card Comments'}
          </button>
          {classTeacherOf && (
            <button
              onClick={() => {
                setShowAttendance(!showAttendance);
                setShowForm(false);
                setShowBatch(false);
                setShowPhoto(false);
                setShowReportCard(false);
                setShowSecurity(false);
              }}
              className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold"
            >
              {showAttendance ? 'Cancel' : 'Take Attendance'}
            </button>
          )}
          <button
            onClick={() => {
              setShowSecurity(!showSecurity);
              setShowForm(false);
              setShowBatch(false);
              setShowPhoto(false);
              setShowReportCard(false);
              setShowAttendance(false);
            }}
            className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold"
          >
            {showSecurity ? 'Cancel' : 'Security'}
          </button>
          <button
            onClick={() => {
              setShowPhoto(!showPhoto);
              setShowForm(false);
              setShowBatch(false);
              setShowReportCard(false);
              setShowAttendance(false);
              setShowSecurity(false);
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
              setShowAttendance(false);
              setShowSecurity(false);
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
              setShowAttendance(false);
              setShowSecurity(false);
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
                Uploaded {batchResult.created} result{batchResult.created === 1 ? '' : 's'}. They&apos;ll appear on
                student portals once the class teacher publishes this term&apos;s report card.
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

          {!classTeacherOf ? (
            <p className="text-sm text-amber-700 bg-amber-50 rounded-xl p-4">
              You&apos;re not assigned as a class teacher yet. Ask your admin to assign you to a class in Staff &amp;
              Roles &mdash; report card comments are limited to your own class.
            </p>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">
                Showing students in <strong>{classTeacherOf}</strong>, your assigned class.
              </p>
              <form onSubmit={loadReportCard} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <select
                  value={rcLookup.studentId}
                  onChange={(e) => setRcLookup({ ...rcLookup, studentId: e.target.value })}
                  className="w-full border p-3 rounded-xl"
                  required
                >
                  <option value="">— Select student —</option>
                  {rcRoster.map((s) => (
                    <option key={s.id} value={s.student_id}>
                      {s.full_name} ({s.student_id})
                    </option>
                  ))}
                </select>
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
          {rcStatus && (
            <p className="text-sm mb-4">
              Status:{' '}
              <span className={rcStatus === 'Published' ? 'text-green-700 font-medium' : 'text-orange-600 font-medium'}>
                {rcStatus}
              </span>
              {rcStatus === 'Draft' && ' — not yet visible to the student.'}
            </p>
          )}

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
              <button
                type="button"
                onClick={autofillAttendance}
                disabled={!rcLookup.studentId}
                className="mt-2 text-xs font-medium text-[var(--brand-color)] hover:underline disabled:text-gray-300 disabled:no-underline"
              >
                Autofill from Attendance
              </button>
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
            <div className="md:col-span-3 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={rcSaving || !rcLookup.studentId}
                className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 py-3 rounded-xl font-semibold disabled:opacity-60"
              >
                {rcSaving ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                type="button"
                onClick={() => persistReportCard(true)}
                disabled={rcSaving || !rcLookup.studentId}
                className="flex-1 bg-[var(--brand-color)] hover:brightness-90 text-white py-3 rounded-xl font-semibold disabled:opacity-60"
              >
                {rcSaving ? 'Saving...' : 'Publish Report Card'}
              </button>
              {rcStatus === 'Published' && (
                <button
                  type="button"
                  onClick={() => persistReportCard(false)}
                  disabled={rcSaving}
                  className="rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Revert to Draft
                </button>
              )}
            </div>
          </form>
            </>
          )}
        </div>
      )}

      {/* Take Attendance */}
      {showAttendance && classTeacherOf && (
        <div className="bg-white p-8 rounded-2xl shadow mb-10 border">
          <h2 className="text-2xl font-semibold mb-2">Take Attendance &mdash; {classTeacherOf}</h2>
          <p className="text-sm text-gray-500 mb-6">Feeds the &quot;days present&quot; figure on report cards.</p>

          <div className="mb-6 flex flex-wrap items-end gap-4">
            <label className="flex flex-col gap-1 text-sm text-gray-600">
              Date
              <input
                type="date"
                value={attDate}
                onChange={(e) => setAttDate(e.target.value)}
                className="rounded-xl border p-3"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-gray-600">
              Session
              <select value={attSession} onChange={(e) => setAttSession(e.target.value)} className="rounded-xl border p-3">
                {SESSIONS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm text-gray-600">
              Term
              <select value={attTerm} onChange={(e) => setAttTerm(e.target.value)} className="rounded-xl border p-3">
                {TERMS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
          </div>

          {attError && <p className="mb-4 text-sm text-red-600">{attError}</p>}
          {attNotice && <p className="mb-4 text-sm text-green-700">{attNotice}</p>}

          {attLoading ? (
            <p className="text-gray-500">Loading...</p>
          ) : rcRoster.length === 0 ? (
            <p className="text-gray-500">No active students in {classTeacherOf}.</p>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-3">Student</th>
                    <th className="text-center p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rcRoster.map((s) => (
                    <tr key={s.id} className="border-b">
                      <td className="p-3">{s.full_name}</td>
                      <td className="p-3">
                        <div className="flex justify-center gap-4">
                          {(['Present', 'Absent', 'Late'] as const).map((status) => (
                            <label key={status} className="flex items-center gap-1 text-xs">
                              <input
                                type="radio"
                                name={`att-status-${s.student_id}`}
                                checked={(attMarks[s.student_id] || 'Present') === status}
                                onChange={() => setAttMarks((prev) => ({ ...prev, [s.student_id]: status }))}
                              />
                              {status}
                            </label>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                onClick={saveAttendance}
                disabled={attSaving}
                className="mt-6 rounded-xl bg-[var(--brand-color)] px-6 py-3 font-semibold text-white hover:brightness-90 disabled:opacity-60"
              >
                {attSaving ? 'Saving...' : 'Save Attendance'}
              </button>
            </>
          )}
        </div>
      )}

      {/* Security */}
      {showSecurity && (
        <div className="bg-white p-8 rounded-2xl shadow mb-10 border max-w-xl">
          <h2 className="text-2xl font-semibold mb-2">Security</h2>
          <p className="text-sm text-gray-500 mb-6">
            Two-factor authentication adds a 6-digit code from an authenticator app on top of your password.
          </p>
          {securityError && <p className="mb-4 text-sm text-red-600">{securityError}</p>}
          {securityNotice && <p className="mb-4 text-sm text-green-700">{securityNotice}</p>}

          {totpEnabled === null ? (
            <p className="text-gray-500">Loading...</p>
          ) : totpEnabled ? (
            <div>
              <p className="text-sm text-green-700 font-medium mb-4">Two-factor authentication is ON.</p>
              {!showDisable ? (
                <button onClick={() => setShowDisable(true)} className="text-sm text-red-600 hover:underline">
                  Turn off two-factor authentication
                </button>
              ) : (
                <form onSubmit={handleDisableTotp} className="space-y-3">
                  <label className="block text-sm font-medium">Confirm your password to turn it off</label>
                  <input
                    type="password"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    className="w-full rounded-xl border p-3"
                    required
                  />
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={disabling}
                      className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      {disabling ? 'Turning off...' : 'Turn Off'}
                    </button>
                    <button type="button" onClick={() => setShowDisable(false)} className="text-sm text-gray-500 hover:underline">
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : setupData ? (
            <form onSubmit={handleConfirmTotp} className="space-y-4">
              <p className="text-sm text-gray-600">
                Scan this QR code with your authenticator app, then enter the 6-digit code it shows.
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={setupData.qrCodeDataUrl} alt="Two-factor QR code" className="h-48 w-48" />
              <p className="text-xs text-gray-500">
                Can&apos;t scan? Enter this key manually: <span className="font-mono">{setupData.secret}</span>
              </p>
              <input
                type="text"
                inputMode="numeric"
                placeholder="123456"
                value={confirmCode}
                onChange={(e) => setConfirmCode(e.target.value)}
                className="w-full rounded-xl border p-3 text-center text-xl tracking-widest"
                maxLength={6}
                required
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={confirming}
                  className="rounded-xl bg-[var(--brand-color)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {confirming ? 'Confirming...' : 'Confirm & Enable'}
                </button>
                <button type="button" onClick={() => setSetupData(null)} className="text-sm text-gray-500 hover:underline">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={startTotpSetup}
              disabled={settingUp}
              className="rounded-xl bg-[var(--brand-color)] px-6 py-3 font-semibold text-white hover:brightness-90 disabled:opacity-60"
            >
              {settingUp ? 'Starting...' : 'Enable Two-Factor Authentication'}
            </button>
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
        Results are saved immediately, but only appear on the student portal once the class teacher compiles and
        publishes that term&apos;s report card (see Report Card Comments above).
      </div>
    </div>
  );
}
