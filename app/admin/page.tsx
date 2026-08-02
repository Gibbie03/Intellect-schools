'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { STAFF_ROLES, CLASSES, DAYS_OF_WEEK } from '@/lib/constants';
import { SESSIONS, TERMS, CURRENT_SESSION, SUBJECTS } from '@/lib/grade';
import { buildWhatsAppLink } from '@/lib/whatsapp';

type Tab =
  | 'dashboard'
  | 'results'
  | 'admissions'
  | 'students'
  | 'staff'
  | 'news'
  | 'gallery'
  | 'contact'
  | 'result-pins'
  | 'report-cards'
  | 'timetables'
  | 'fees'
  | 'messages'
  | 'spotlight'
  | 'calendar'
  | 'testimonials'
  | 'attendance';

const TABS: { id: Tab; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'results', label: 'Manage Results' },
  { id: 'admissions', label: 'Admissions' },
  { id: 'students', label: 'Students' },
  { id: 'staff', label: 'Staff & Roles' },
  { id: 'news', label: 'News & Events' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'contact', label: 'Contact Messages' },
  { id: 'result-pins', label: 'Result Checker Cards' },
  { id: 'report-cards', label: 'Report Cards' },
  { id: 'timetables', label: 'Timetables' },
  { id: 'fees', label: 'Fees' },
  { id: 'messages', label: 'Message Parents' },
  { id: 'spotlight', label: 'Spotlight' },
  { id: 'calendar', label: 'Academic Calendar' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'attendance', label: 'Attendance' },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [adminName, setAdminName] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.fullName) setAdminName(data.fullName);
      });
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-500">Signed in as {adminName || '...'}</span>
          <button onClick={handleLogout} className="text-red-600 hover:underline">
            Logout
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 pb-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-xl px-4 py-2 text-sm font-medium ${
              tab === t.id ? 'bg-[var(--brand-color)] text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div>
        {tab === 'dashboard' && <DashboardOverview />}
        {tab === 'results' && <ResultsSection />}
        {tab === 'admissions' && <AdmissionsSection />}
        {tab === 'students' && <StudentsSection />}
        {tab === 'staff' && <StaffSection />}
        {tab === 'news' && <NewsSection />}
        {tab === 'gallery' && <GallerySection />}
        {tab === 'contact' && <ContactSection />}
        {tab === 'result-pins' && <ResultPinsSection />}
        {tab === 'report-cards' && <ReportCardsSection />}
        {tab === 'timetables' && <TimetablesSection />}
        {tab === 'fees' && <FeesSection />}
        {tab === 'messages' && <MessagesSection />}
        {tab === 'spotlight' && <SpotlightSection />}
        {tab === 'calendar' && <CalendarSection />}
        {tab === 'testimonials' && <TestimonialsSection />}
        {tab === 'attendance' && <AttendanceSection />}
      </div>
    </div>
  );
}

function DashboardOverview() {
  const [counts, setCounts] = useState<{
    uploadedLast24h: number;
    flaggedResults: number;
    pendingAdmissions: number;
    unreadMessages: number;
  } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/results/stats').then((r) => r.json()),
      fetch('/api/admissions').then((r) => r.json()),
      fetch('/api/contact').then((r) => r.json()),
    ])
      .then(([resultStats, admissions, messages]) => {
        if (resultStats.error) throw new Error(resultStats.error);
        if (admissions.error) throw new Error(admissions.error);
        if (messages.error) throw new Error(messages.error);

        setCounts({
          uploadedLast24h: resultStats.uploadedLast24h,
          flaggedResults: resultStats.flagged,
          pendingAdmissions: admissions.admissions.filter((a: { status: string }) => a.status === 'Pending').length,
          unreadMessages: messages.messages.filter((m: { status: string }) => m.status === 'New').length,
        });
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

      {error && <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {!counts && !error && <p className="text-gray-500">Loading...</p>}

      {counts && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard label="Results Uploaded (Last 24h)" value={counts.uploadedLast24h} color="text-green-700" />
          <StatCard label="Results Flagged for Review" value={counts.flaggedResults} color="text-red-600" />
          <StatCard label="Admissions Awaiting Review" value={counts.pendingAdmissions} color="text-orange-600" />
          <StatCard label="Unread Messages" value={counts.unreadMessages} color="text-red-600" />
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <div className="text-sm text-gray-500">{label}</div>
      <div className={`text-4xl font-bold mt-1 ${color}`}>{value}</div>
    </div>
  );
}

type ResultRow = {
  id: string;
  student_id: string;
  subject: string;
  score: number;
  grade: string;
  session: string;
  term: string;
  status: 'Pending' | 'Approved' | 'Rejected';
};

function ResultsSection() {
  const [results, setResults] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch('/api/results')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setResults(data.results);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const updateStatus = async (id: string, status: 'Approved' | 'Rejected') => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/results/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update result.');
      setResults((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">Manage Results</h1>
      <p className="text-sm text-gray-500 mb-6">
        Results are live in student portals as soon as a teacher uploads them. Flag a result here if it needs to
        be pulled down for correction.
      </p>
      {error && <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="bg-white rounded-2xl shadow p-8">
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : results.length === 0 ? (
          <p className="text-gray-500">No results have been uploaded yet.</p>
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
                <th className="text-center p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="p-4 font-mono">{r.student_id}</td>
                  <td className="p-4">{r.subject}</td>
                  <td className="p-4 text-center">{r.score}</td>
                  <td className="p-4 text-center">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">{r.grade}</span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{r.session}</td>
                  <td className="p-4 text-sm text-gray-600">{r.term}</td>
                  <td className="p-4 text-center">
                    <span
                      className={
                        r.status === 'Approved'
                          ? 'text-green-600'
                          : r.status === 'Rejected'
                          ? 'text-red-600'
                          : 'text-orange-600'
                      }
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {r.status === 'Approved' && (
                      <button
                        disabled={updatingId === r.id}
                        onClick={() => updateStatus(r.id, 'Rejected')}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                      >
                        Flag as Incorrect
                      </button>
                    )}
                    {r.status === 'Rejected' && (
                      <button
                        disabled={updatingId === r.id}
                        onClick={() => updateStatus(r.id, 'Approved')}
                        className="rounded-lg bg-green-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-800 disabled:opacity-60"
                      >
                        Restore
                      </button>
                    )}
                    {r.status === 'Pending' && (
                      <div className="flex justify-center gap-2">
                        <button
                          disabled={updatingId === r.id}
                          onClick={() => updateStatus(r.id, 'Approved')}
                          className="rounded-lg bg-green-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-800 disabled:opacity-60"
                        >
                          Approve
                        </button>
                        <button
                          disabled={updatingId === r.id}
                          onClick={() => updateStatus(r.id, 'Rejected')}
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

type Admission = {
  id: string;
  student_name: string;
  class_applying_for: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  status: 'Pending' | 'Reviewed' | 'Accepted' | 'Rejected';
  created_at: string;
};

function AdmissionsSection() {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch('/api/admissions')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setAdmissions(data.admissions);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const updateStatus = async (id: string, status: Admission['status']) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update application.');
      setAdmissions((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Admissions</h1>
      {error && <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="bg-white rounded-2xl shadow p-8">
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : admissions.length === 0 ? (
          <p className="text-gray-500">No applications have been submitted yet.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-4">Student</th>
                <th className="text-left p-4">Class</th>
                <th className="text-left p-4">Parent</th>
                <th className="text-left p-4">Contact</th>
                <th className="text-center p-4">Status</th>
                <th className="text-center p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {admissions.map((a) => (
                <tr key={a.id} className="border-b align-top">
                  <td className="p-4 font-medium">{a.student_name}</td>
                  <td className="p-4">{a.class_applying_for}</td>
                  <td className="p-4">{a.parent_name}</td>
                  <td className="p-4 text-sm text-gray-600">
                    <div>{a.parent_email}</div>
                    <div>{a.parent_phone}</div>
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={
                        a.status === 'Accepted'
                          ? 'text-green-600'
                          : a.status === 'Rejected'
                          ? 'text-red-600'
                          : 'text-orange-600'
                      }
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <select
                      disabled={updatingId === a.id}
                      value={a.status}
                      onChange={(e) => updateStatus(a.id, e.target.value as Admission['status'])}
                      className="rounded-lg border p-2 text-sm"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Reviewed">Reviewed</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

type StudentRow = {
  id: string;
  student_id: string;
  full_name: string;
  class: string;
  status: 'Active' | 'Inactive';
};

const emptyStudentForm = {
  studentId: '',
  fullName: '',
  className: CLASSES[0],
  gender: '',
  parentName: '',
  parentEmail: '',
  parentPhone: '',
};

function StudentsSection() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyStudentForm);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [batchFile, setBatchFile] = useState<File | null>(null);
  const [batchSubmitting, setBatchSubmitting] = useState(false);
  const [batchResult, setBatchResult] = useState<{
    created: number;
    skipped: number;
    errors: { row: number; reason: string }[];
  } | null>(null);
  const [batchError, setBatchError] = useState('');

  const [promoteForm, setPromoteForm] = useState({
    fromClass: CLASSES[0],
    toClass: CLASSES[1] ?? CLASSES[0],
    graduate: false,
  });
  const [promoteSubmitting, setPromoteSubmitting] = useState(false);
  const [promoteError, setPromoteError] = useState('');
  const [promoteNotice, setPromoteNotice] = useState('');

  const load = () => {
    setLoading(true);
    fetch('/api/students')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setStudents(data.students);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentId || !form.fullName || !form.className) return;

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create student profile.');
      setForm(emptyStudentForm);
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id: string, status: 'Active' | 'Inactive') => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update student.');
      setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUpdatingId(null);
    }
  };

  const updateClass = async (id: string, className: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ className }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update student.');
      setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, class: className } : s)));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoteSubmitting(true);
    setPromoteError('');
    setPromoteNotice('');
    try {
      const res = await fetch('/api/students/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromClass: promoteForm.fromClass,
          toClass: promoteForm.graduate ? undefined : promoteForm.toClass,
          graduate: promoteForm.graduate,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to promote class.');
      setPromoteNotice(
        promoteForm.graduate
          ? `Marked ${data.promoted} student(s) from ${promoteForm.fromClass} as graduated.`
          : `Moved ${data.promoted} student(s) from ${promoteForm.fromClass} to ${promoteForm.toClass}.`
      );
      load();
    } catch (err) {
      setPromoteError((err as Error).message);
    } finally {
      setPromoteSubmitting(false);
    }
  };

  const handleBatchUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchFile) return;

    setBatchSubmitting(true);
    setBatchError('');
    setBatchResult(null);

    try {
      const formData = new FormData();
      formData.append('file', batchFile);
      const res = await fetch('/api/students/batch', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Batch upload failed.');
      setBatchResult(data);
      setBatchFile(null);
      load();
    } catch (err) {
      setBatchError((err as Error).message);
    } finally {
      setBatchSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Students</h1>
      {error && <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-8 space-y-4">
          <h2 className="text-xl font-semibold">Create Student Profile</h2>
          <input
            type="text"
            placeholder="Student ID (e.g. ICS/2025/045)"
            value={form.studentId}
            onChange={(e) => setForm({ ...form, studentId: e.target.value })}
            className="w-full rounded-xl border p-3"
            required
          />
          <input
            type="text"
            placeholder="Full Name"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className="w-full rounded-xl border p-3"
            required
          />
          <select
            value={form.className}
            onChange={(e) => setForm({ ...form, className: e.target.value })}
            className="w-full rounded-xl border p-3"
          >
            {CLASSES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Parent/Guardian Name"
            value={form.parentName}
            onChange={(e) => setForm({ ...form, parentName: e.target.value })}
            className="w-full rounded-xl border p-3"
          />
          <input
            type="email"
            placeholder="Parent Email"
            value={form.parentEmail}
            onChange={(e) => setForm({ ...form, parentEmail: e.target.value })}
            className="w-full rounded-xl border p-3"
          />
          <input
            type="tel"
            placeholder="Parent Phone"
            value={form.parentPhone}
            onChange={(e) => setForm({ ...form, parentPhone: e.target.value })}
            className="w-full rounded-xl border p-3"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-[var(--brand-color)] py-3 font-semibold text-white hover:brightness-90 disabled:opacity-60"
          >
            {submitting ? 'Creating...' : 'Create Profile'}
          </button>
        </form>

        <form onSubmit={handleBatchUpload} className="bg-white rounded-2xl shadow p-8 space-y-4">
          <h2 className="text-xl font-semibold">Batch Create from Excel</h2>
          <p className="text-sm text-gray-500">
            Upload an .xlsx file with columns: Student ID, Full Name, Class, Gender, Date of Birth, Parent Name,
            Parent Email, Parent Phone, Address.
          </p>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- file download, not a page route */}
          <a href="/api/students/template" className="inline-block text-sm font-medium text-[var(--brand-color)] hover:underline">
            Download template
          </a>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setBatchFile(e.target.files?.[0] ?? null)}
            className="w-full rounded-xl border p-3"
          />
          {batchError && <p className="text-sm text-red-600">{batchError}</p>}
          {batchResult && (
            <div className="rounded-xl bg-green-50 p-4 text-sm text-green-800">
              <p>
                Created {batchResult.created} student{batchResult.created === 1 ? '' : 's'}.{' '}
                {batchResult.skipped > 0 && `${batchResult.skipped} row(s) skipped.`}
              </p>
              {batchResult.errors.length > 0 && (
                <ul className="mt-2 list-disc pl-5 text-red-700">
                  {batchResult.errors.map((e, i) => (
                    <li key={i}>
                      Row {e.row}: {e.reason}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <button
            type="submit"
            disabled={batchSubmitting || !batchFile}
            className="w-full rounded-xl bg-[var(--brand-color)] py-3 font-semibold text-white hover:brightness-90 disabled:opacity-60"
          >
            {batchSubmitting ? 'Uploading...' : 'Upload & Create'}
          </button>
        </form>
      </div>

      <form onSubmit={handlePromote} className="bg-white rounded-2xl shadow p-8 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="md:col-span-4">
          <h2 className="text-xl font-semibold">Promote a Class</h2>
          <p className="text-sm text-gray-500 mt-1">
            Move every active student in a class up to the next class at once, at the start of a new session &mdash;
            or mark the whole class as graduated instead of moving them.
          </p>
        </div>
        {promoteNotice && <p className="md:col-span-4 text-sm text-green-700">{promoteNotice}</p>}
        {promoteError && <p className="md:col-span-4 text-sm text-red-600">{promoteError}</p>}
        <label className="flex flex-col gap-1 text-sm text-gray-600">
          From Class
          <select
            value={promoteForm.fromClass}
            onChange={(e) => setPromoteForm({ ...promoteForm, fromClass: e.target.value })}
            className="rounded-xl border p-3"
          >
            {CLASSES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-gray-600">
          To Class
          <select
            value={promoteForm.toClass}
            disabled={promoteForm.graduate}
            onChange={(e) => setPromoteForm({ ...promoteForm, toClass: e.target.value })}
            className="rounded-xl border p-3 disabled:opacity-50"
          >
            {CLASSES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={promoteForm.graduate}
            onChange={(e) => setPromoteForm({ ...promoteForm, graduate: e.target.checked })}
          />
          Graduate this class instead (mark Inactive)
        </label>
        <button
          type="submit"
          disabled={promoteSubmitting}
          className="rounded-xl bg-[var(--brand-color)] py-3 font-semibold text-white hover:brightness-90 disabled:opacity-60"
        >
          {promoteSubmitting ? 'Promoting...' : 'Promote'}
        </button>
      </form>

      <div className="bg-white rounded-2xl shadow p-8">
        <h2 className="text-xl font-semibold mb-6">All Students ({students.length})</h2>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : students.length === 0 ? (
          <p className="text-gray-500">No student profiles yet.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-4">Student ID</th>
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Class</th>
                <th className="text-center p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-b">
                  <td className="p-4 font-mono">{s.student_id}</td>
                  <td className="p-4">{s.full_name}</td>
                  <td className="p-4">
                    <select
                      disabled={updatingId === s.id}
                      value={CLASSES.includes(s.class) ? s.class : ''}
                      onChange={(e) => updateClass(s.id, e.target.value)}
                      className="rounded-lg border p-2 text-sm"
                    >
                      {!CLASSES.includes(s.class) && (
                        <option value="" disabled>
                          {s.class} (unrecognized)
                        </option>
                      )}
                      {CLASSES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4 text-center">
                    <select
                      disabled={updatingId === s.id}
                      value={s.status}
                      onChange={(e) => updateStatus(s.id, e.target.value as 'Active' | 'Inactive')}
                      className="rounded-lg border p-2 text-sm"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

type TeacherRow = {
  id: string;
  staff_id: string;
  full_name: string;
  role: (typeof STAFF_ROLES)[number];
  subject: string | null;
  status: 'Active' | 'Inactive';
  class_teacher_of: string | null;
  photo_url: string | null;
  bio: string | null;
  show_on_site: boolean;
};

const emptyStaffForm = {
  staffId: '',
  fullName: '',
  role: STAFF_ROLES[0],
  subject: '',
  email: '',
  phone: '',
  classTeacherOf: '',
  bio: '',
};

type AccountRow = {
  id: string;
  email: string;
  role: 'admin' | 'teacher';
  full_name: string;
  teacher_id: string | null;
  status: 'Active' | 'Inactive';
};

const emptyAccountForm = { email: '', password: '', fullName: '', role: 'teacher' as 'admin' | 'teacher', teacherId: '' };

function StaffSection() {
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyStaffForm);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [accountsError, setAccountsError] = useState('');
  const [accountSubmitting, setAccountSubmitting] = useState(false);
  const [accountForm, setAccountForm] = useState(emptyAccountForm);
  const [resetTarget, setResetTarget] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [resetSubmitting, setResetSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    fetch('/api/teachers')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setTeachers(data.teachers);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  const loadAccounts = () => {
    setAccountsLoading(true);
    fetch('/api/school-users')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setAccounts(data.users);
      })
      .catch((err) => setAccountsError(err.message))
      .finally(() => setAccountsLoading(false));
  };

  useEffect(load, []);
  useEffect(loadAccounts, []);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountForm.email || !accountForm.password || !accountForm.fullName) return;

    setAccountSubmitting(true);
    setAccountsError('');
    try {
      const res = await fetch('/api/school-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...accountForm, teacherId: accountForm.teacherId || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create login account.');
      setAccountForm(emptyAccountForm);
      loadAccounts();
    } catch (err) {
      setAccountsError((err as Error).message);
    } finally {
      setAccountSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget || resetPassword.length < 8) return;

    setResetSubmitting(true);
    setAccountsError('');
    try {
      const res = await fetch(`/api/school-users/${resetTarget}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: resetPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password.');
      setResetTarget(null);
      setResetPassword('');
    } catch (err) {
      setAccountsError((err as Error).message);
    } finally {
      setResetSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.staffId || !form.fullName) return;

    setSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });
      if (photoFile) formData.append('file', photoFile);

      const res = await fetch('/api/teachers', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create staff profile.');
      setForm(emptyStaffForm);
      setPhotoFile(null);
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const updateRole = async (id: string, role: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/teachers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update role.');
      setTeachers((prev) => prev.map((t) => (t.id === id ? { ...t, role: role as TeacherRow['role'] } : t)));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUpdatingId(null);
    }
  };

  const updateStatus = async (id: string, status: 'Active' | 'Inactive') => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/teachers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update employment status.');
      setTeachers((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUpdatingId(null);
    }
  };

  const updateShowOnSite = async (id: string, showOnSite: boolean) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/teachers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showOnSite }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update staff directory visibility.');
      setTeachers((prev) => prev.map((t) => (t.id === id ? { ...t, show_on_site: showOnSite } : t)));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUpdatingId(null);
    }
  };

  const updateClassTeacherOf = async (id: string, classTeacherOf: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/teachers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classTeacherOf }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update class teacher assignment.');
      setTeachers((prev) => prev.map((t) => (t.id === id ? { ...t, class_teacher_of: classTeacherOf || null } : t)));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Staff &amp; Roles</h1>
      {error && <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-8 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <h2 className="md:col-span-2 text-xl font-semibold">Hire / Create Staff Profile</h2>
        <input
          type="text"
          placeholder="Staff ID"
          value={form.staffId}
          onChange={(e) => setForm({ ...form, staffId: e.target.value })}
          className="w-full rounded-xl border p-3"
          required
        />
        <input
          type="text"
          placeholder="Full Name"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          className="w-full rounded-xl border p-3"
          required
        />
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value as typeof form.role })}
          className="w-full rounded-xl border p-3"
        >
          {STAFF_ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Subject (if Teacher)"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          className="w-full rounded-xl border p-3"
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full rounded-xl border p-3"
        />
        <input
          type="tel"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full rounded-xl border p-3"
        />
        <select
          value={form.classTeacherOf}
          onChange={(e) => setForm({ ...form, classTeacherOf: e.target.value })}
          className="w-full rounded-xl border p-3 md:col-span-2"
        >
          <option value="">Not a class teacher</option>
          {CLASSES.map((c) => (
            <option key={c} value={c}>
              Class Teacher of {c}
            </option>
          ))}
        </select>
        <label className="flex flex-col gap-1 text-sm text-gray-600 md:col-span-2">
          Photo (optional, shown on the public Staff Directory)
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
            className="w-full rounded-xl border p-3"
          />
        </label>
        <textarea
          placeholder="Short Bio (optional, shown on the public Staff Directory)"
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          className="w-full rounded-xl border p-3 md:col-span-2"
          rows={2}
        />
        <button
          type="submit"
          disabled={submitting}
          className="md:col-span-2 w-full rounded-xl bg-[var(--brand-color)] py-3 font-semibold text-white hover:brightness-90 disabled:opacity-60"
        >
          {submitting ? 'Creating...' : 'Create Staff Profile'}
        </button>
      </form>

      <div className="bg-white rounded-2xl shadow p-8">
        <h2 className="text-xl font-semibold mb-6">All Staff ({teachers.length})</h2>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : teachers.length === 0 ? (
          <p className="text-gray-500">No staff profiles yet.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-4">Staff ID</th>
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Subject</th>
                <th className="text-center p-4">Role</th>
                <th className="text-center p-4">Class Teacher Of</th>
                <th className="text-center p-4">Employment Status</th>
                <th className="text-center p-4">On Staff Directory</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => (
                <tr key={t.id} className="border-b">
                  <td className="p-4 font-mono">{t.staff_id}</td>
                  <td className="p-4">{t.full_name}</td>
                  <td className="p-4">{t.subject || '—'}</td>
                  <td className="p-4 text-center">
                    <select
                      disabled={updatingId === t.id}
                      value={t.role}
                      onChange={(e) => updateRole(t.id, e.target.value)}
                      className="rounded-lg border p-2 text-sm"
                    >
                      {STAFF_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4 text-center">
                    <select
                      disabled={updatingId === t.id}
                      value={t.class_teacher_of ?? ''}
                      onChange={(e) => updateClassTeacherOf(t.id, e.target.value)}
                      className="rounded-lg border p-2 text-sm"
                    >
                      <option value="">— Not assigned —</option>
                      {CLASSES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4 text-center">
                    <select
                      disabled={updatingId === t.id}
                      value={t.status}
                      onChange={(e) => updateStatus(t.id, e.target.value as 'Active' | 'Inactive')}
                      className="rounded-lg border p-2 text-sm"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive (Terminated)</option>
                    </select>
                  </td>
                  <td className="p-4 text-center">
                    <input
                      type="checkbox"
                      disabled={updatingId === t.id}
                      checked={t.show_on_site}
                      onChange={(e) => updateShowOnSite(t.id, e.target.checked)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow p-8 mt-8">
        <h2 className="text-xl font-semibold mb-2">Staff Login Accounts</h2>
        <p className="text-sm text-gray-500 mb-6">
          Issue a login for a staff member so they can sign in to the Admin Dashboard or Teacher Dashboard.
        </p>

        <form
          onSubmit={handleCreateAccount}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 border-b border-gray-100 pb-8"
        >
          <input
            type="text"
            placeholder="Full Name"
            value={accountForm.fullName}
            onChange={(e) => setAccountForm({ ...accountForm, fullName: e.target.value })}
            className="w-full rounded-xl border p-3"
            required
          />
          <input
            type="email"
            placeholder="Login Email"
            value={accountForm.email}
            onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
            className="w-full rounded-xl border p-3"
            required
          />
          <input
            type="password"
            placeholder="Password (min. 8 characters)"
            value={accountForm.password}
            onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
            className="w-full rounded-xl border p-3"
            minLength={8}
            required
          />
          <select
            value={accountForm.role}
            onChange={(e) => setAccountForm({ ...accountForm, role: e.target.value as 'admin' | 'teacher' })}
            className="w-full rounded-xl border p-3"
          >
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={accountForm.teacherId}
            onChange={(e) => setAccountForm({ ...accountForm, teacherId: e.target.value })}
            className="w-full rounded-xl border p-3 md:col-span-2"
          >
            <option value="">Not linked to a staff directory profile</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.full_name} ({t.staff_id})
              </option>
            ))}
          </select>
          {accountsError && <p className="md:col-span-2 text-sm text-red-600">{accountsError}</p>}
          <button
            type="submit"
            disabled={accountSubmitting}
            className="md:col-span-2 w-full rounded-xl bg-[var(--brand-color)] py-3 font-semibold text-white hover:brightness-90 disabled:opacity-60"
          >
            {accountSubmitting ? 'Creating...' : 'Create Login Account'}
          </button>
        </form>

        {accountsLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : accounts.length === 0 ? (
          <p className="text-gray-500">No login accounts yet.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Email</th>
                <th className="text-center p-4">Role</th>
                <th className="text-center p-4">Status</th>
                <th className="text-center p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => (
                <tr key={a.id} className="border-b">
                  <td className="p-4">{a.full_name}</td>
                  <td className="p-4">{a.email}</td>
                  <td className="p-4 text-center capitalize">{a.role}</td>
                  <td className="p-4 text-center">{a.status}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => {
                        setResetTarget(resetTarget === a.id ? null : a.id);
                        setResetPassword('');
                      }}
                      className="text-sm text-[var(--brand-color)] hover:underline"
                    >
                      {resetTarget === a.id ? 'Cancel' : 'Reset Password'}
                    </button>
                    {resetTarget === a.id && (
                      <form onSubmit={handleResetPassword} className="mt-2 flex gap-2 justify-center">
                        <input
                          type="password"
                          placeholder="New password"
                          value={resetPassword}
                          onChange={(e) => setResetPassword(e.target.value)}
                          className="rounded-lg border p-2 text-sm"
                          minLength={8}
                          required
                        />
                        <button
                          type="submit"
                          disabled={resetSubmitting}
                          className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                        >
                          {resetSubmitting ? 'Saving...' : 'Save'}
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

type NewsItem = { id: string; title: string; content: string; event_date: string | null };

function NewsSection() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', eventDate: '' });

  const load = () => {
    setLoading(true);
    fetch('/api/news')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setItems(data.news);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) return;

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to post.');
      setForm({ title: '', content: '', eventDate: '' });
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/news/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete.');
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">News &amp; Events</h1>
      {error && <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-8 mb-8 space-y-4">
        <h2 className="text-xl font-semibold">Post an Announcement</h2>
        <input
          type="text"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full rounded-xl border p-3"
          required
        />
        <textarea
          placeholder="Content"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          rows={3}
          className="w-full rounded-xl border p-3"
          required
        />
        <div>
          <label className="mb-2 block text-sm font-medium">Event Date (optional)</label>
          <input
            type="date"
            value={form.eventDate}
            onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
            className="rounded-xl border p-3"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-[var(--brand-color)] px-6 py-3 font-semibold text-white hover:brightness-90 disabled:opacity-60"
        >
          {submitting ? 'Posting...' : 'Post'}
        </button>
      </form>

      <div className="bg-white rounded-2xl shadow p-8">
        <h2 className="text-xl font-semibold mb-6">Published Items</h2>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-gray-500">Nothing posted yet.</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-start justify-between rounded-xl border p-4">
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{item.content}</p>
                  {item.event_date && (
                    <p className="text-xs text-gray-400 mt-1">Event date: {item.event_date}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-sm text-red-600 hover:underline shrink-0 ml-4"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

type GalleryImage = { id: string; image_url: string; caption: string | null };

function GallerySection() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState('');

  const load = () => {
    setLoading(true);
    fetch('/api/gallery')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setImages(data.images);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;

    setSubmitting(true);
    setError('');
    try {
      for (let i = 0; i < files.length; i++) {
        setUploadProgress(`Uploading ${i + 1} of ${files.length}...`);
        const formData = new FormData();
        formData.append('file', files[i]);
        if (caption) formData.append('caption', caption);

        const res = await fetch('/api/gallery', { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Failed to upload "${files[i].name}".`);
      }
      setFiles([]);
      setCaption('');
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
      setUploadProgress('');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete.');
      setImages((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Gallery</h1>
      {error && <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-8 mb-8 space-y-4">
        <h2 className="text-xl font-semibold">Add Photos</h2>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          className="w-full rounded-xl border p-3"
          required
        />
        {files.length > 0 && (
          <p className="text-sm text-gray-500">
            {files.length} photo{files.length === 1 ? '' : 's'} selected.
          </p>
        )}
        <input
          type="text"
          placeholder="Caption (optional, applied to all selected photos)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="w-full rounded-xl border p-3"
        />
        <button
          type="submit"
          disabled={submitting || files.length === 0}
          className="rounded-xl bg-[var(--brand-color)] px-6 py-3 font-semibold text-white hover:brightness-90 disabled:opacity-60"
        >
          {submitting ? uploadProgress || 'Uploading...' : `Add Photo${files.length === 1 ? '' : 's'}`}
        </button>
      </form>

      <div className="bg-white rounded-2xl shadow p-8">
        <h2 className="text-xl font-semibold mb-6">Photos ({images.length})</h2>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : images.length === 0 ? (
          <p className="text-gray-500">No photos added yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image) => (
              <div key={image.id} className="overflow-hidden rounded-xl border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.image_url} alt={image.caption ?? ''} className="h-40 w-full object-cover" />
                <div className="p-3 flex items-center justify-between">
                  <span className="text-sm text-gray-600 truncate">{image.caption || 'No caption'}</span>
                  <button onClick={() => handleDelete(image.id)} className="text-xs text-red-600 hover:underline shrink-0 ml-2">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: 'New' | 'Read';
  created_at: string;
};

function ContactSection() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    fetch('/api/contact')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setMessages(data.messages);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const markRead = async (id: string) => {
    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Read' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update message.');
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status: 'Read' } : m)));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Contact Messages</h1>
      {error && <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="bg-white rounded-2xl shadow p-8">
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : messages.length === 0 ? (
          <p className="text-gray-500">No messages received yet.</p>
        ) : (
          <div className="space-y-4">
            {messages.map((m) => (
              <div key={m.id} className="rounded-xl border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{m.name}</h3>
                      {m.status === 'New' && (
                        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {m.email}
                      {m.phone ? ` · ${m.phone}` : ''}
                    </p>
                    {m.subject && <p className="text-sm font-medium mt-2">{m.subject}</p>}
                    <p className="text-sm text-gray-600 mt-1">{m.message}</p>
                  </div>
                  {m.status === 'New' && (
                    <button
                      onClick={() => markRead(m.id)}
                      className="text-sm text-[var(--brand-color)] hover:underline shrink-0"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

type ResultPinBatch = {
  batchLabel: string;
  session: string;
  term: string | null;
  deliveryMethod: string;
  maxUses: number;
  createdAt: string;
  total: number;
  exhausted: number;
};

type GeneratedCard = { serial: string; pin: string };

function ResultPinsSection() {
  const [batches, setBatches] = useState<ResultPinBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [schoolName, setSchoolName] = useState('');

  const [form, setForm] = useState({
    session: CURRENT_SESSION,
    term: TERMS[0],
    count: 50,
    maxUses: 3,
    deliveryMethod: 'print' as 'print' | 'digital',
    batchLabel: '',
  });

  const [generated, setGenerated] = useState<{ batchLabel: string; cards: GeneratedCard[] } | null>(null);

  const load = () => {
    setLoading(true);
    fetch('/api/result-pins')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setBatches(data.batches);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);
  useEffect(() => {
    fetch('/api/school')
      .then((res) => res.json())
      .then((data) => setSchoolName(data.name ?? ''))
      .catch(() => {});
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setGenerated(null);
    try {
      const res = await fetch('/api/result-pins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate cards.');
      setGenerated({ batchLabel: data.batchLabel, cards: data.cards });
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadCsv = () => {
    if (!generated) return;
    const rows = ['Serial,PIN', ...generated.cards.map((c) => `${c.serial},${c.pin}`)];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generated.batchLabel.replace(/\s+/g, '-')}-result-pins.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (!generated) return;
    const win = window.open('', '_blank');
    if (!win) return;

    const cardsHtml = generated.cards
      .map(
        (c) => `
        <div class="card">
          <div class="card-school">${schoolName || 'Result Checker'}</div>
          <div class="card-label">Result Checker Card</div>
          <div class="card-row"><span>Serial</span><strong>${c.serial}</strong></div>
          <div class="card-row"><span>PIN</span><strong>${c.pin}</strong></div>
          <div class="card-note">Enter your Student ID + this Serial + PIN on the school portal to check your result.</div>
        </div>`
      )
      .join('');

    win.document.write(`
      <html>
        <head>
          <title>${generated.batchLabel} - Result Checker Cards</title>
          <style>
            * { box-sizing: border-box; }
            body { font-family: Arial, sans-serif; margin: 0; padding: 16px; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
            .card {
              border: 1.5px dashed #999;
              border-radius: 12px;
              padding: 14px 16px;
              break-inside: avoid;
            }
            .card-school { font-weight: bold; font-size: 14px; }
            .card-label { font-size: 11px; color: #666; margin-bottom: 8px; }
            .card-row { display: flex; justify-content: space-between; font-size: 13px; margin: 4px 0; }
            .card-row strong { letter-spacing: 1px; }
            .card-note { font-size: 10px; color: #666; margin-top: 8px; }
            @media print {
              .card { border: 1.5px dashed #999; }
            }
          </style>
        </head>
        <body>
          <div class="grid">${cardsHtml}</div>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">Result Checker Cards</h1>
      <p className="text-gray-600 mb-8">
        Generate scratch-card style Serial + PIN pairs parents use to check results on the student portal &mdash;
        print them yourself, send them to a card printer, or share codes digitally after payment.
      </p>
      {error && <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleGenerate} className="bg-white rounded-2xl shadow p-8 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <h2 className="md:col-span-2 text-xl font-semibold">Generate a Batch</h2>

        <select
          value={form.session}
          onChange={(e) => setForm({ ...form, session: e.target.value })}
          className="w-full rounded-xl border p-3"
        >
          {SESSIONS.map((s) => (
            <option key={s} value={s}>
              {s} Session
            </option>
          ))}
        </select>

        <select
          value={form.term}
          onChange={(e) => setForm({ ...form, term: e.target.value })}
          className="w-full rounded-xl border p-3"
        >
          {TERMS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <input
          type="number"
          min={1}
          max={1000}
          placeholder="How many cards?"
          value={form.count}
          onChange={(e) => setForm({ ...form, count: Number(e.target.value) })}
          className="w-full rounded-xl border p-3"
          required
        />

        <input
          type="number"
          min={1}
          max={20}
          placeholder="Uses allowed per card"
          value={form.maxUses}
          onChange={(e) => setForm({ ...form, maxUses: Number(e.target.value) })}
          className="w-full rounded-xl border p-3"
          required
        />

        <select
          value={form.deliveryMethod}
          onChange={(e) => setForm({ ...form, deliveryMethod: e.target.value as 'print' | 'digital' })}
          className="w-full rounded-xl border p-3"
        >
          <option value="print">Print (physical cards)</option>
          <option value="digital">Digital (send code directly)</option>
        </select>

        <input
          type="text"
          placeholder="Batch label (optional)"
          value={form.batchLabel}
          onChange={(e) => setForm({ ...form, batchLabel: e.target.value })}
          className="w-full rounded-xl border p-3"
        />

        <button
          type="submit"
          disabled={submitting}
          className="md:col-span-2 rounded-xl bg-[var(--brand-color)] px-6 py-3 font-semibold text-white hover:brightness-90 disabled:opacity-60"
        >
          {submitting ? 'Generating...' : 'Generate Cards'}
        </button>
      </form>

      {generated && (
        <div className="bg-white rounded-2xl shadow p-8 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-semibold">
              {generated.cards.length} card{generated.cards.length === 1 ? '' : 's'} generated &mdash; &ldquo;{generated.batchLabel}&rdquo;
            </h2>
            <div className="flex gap-2">
              <button onClick={handlePrint} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50">
                Print Cards
              </button>
              <button onClick={handleDownloadCsv} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50">
                Download CSV
              </button>
            </div>
          </div>
          <p className="text-sm text-amber-700 bg-amber-50 rounded-xl p-4 mb-4">
            These PINs are shown only once and are not stored in plain text &mdash; save or print this batch now
            before leaving this page.
          </p>
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-3">Serial</th>
                  <th className="text-left p-3">PIN</th>
                </tr>
              </thead>
              <tbody>
                {generated.cards.map((c) => (
                  <tr key={c.serial} className="border-b">
                    <td className="p-3 font-mono">{c.serial}</td>
                    <td className="p-3 font-mono">{c.pin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow p-8">
        <h2 className="text-xl font-semibold mb-6">Past Batches</h2>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : batches.length === 0 ? (
          <p className="text-gray-500">No batches generated yet.</p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-3">Batch</th>
                <th className="text-left p-3">Session / Term</th>
                <th className="text-left p-3">Delivery</th>
                <th className="text-center p-3">Cards</th>
                <th className="text-center p-3">Used Up</th>
                <th className="text-center p-3">Max Uses</th>
                <th className="text-left p-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((b) => (
                <tr key={b.batchLabel + b.createdAt} className="border-b">
                  <td className="p-3 font-medium">{b.batchLabel}</td>
                  <td className="p-3">
                    {b.session}
                    {b.term ? ` · ${b.term}` : ''}
                  </td>
                  <td className="p-3 capitalize">{b.deliveryMethod}</td>
                  <td className="p-3 text-center">{b.total}</td>
                  <td className="p-3 text-center">{b.exhausted}</td>
                  <td className="p-3 text-center">{b.maxUses}</td>
                  <td className="p-3">{new Date(b.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function ReportCardsSection() {
  const [lookup, setLookup] = useState({ studentId: '', session: CURRENT_SESSION, term: TERMS[0] });
  const [status, setStatus] = useState<'Draft' | 'Published' | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState({
    daysSchoolOpened: '',
    daysPresent: '',
    timesPunctual: '',
    conductRating: '',
    teacherComment: '',
    principalComment: '',
  });

  const load = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookup.studentId) return;

    setLoading(true);
    setError('');
    setNotice('');

    try {
      const res = await fetch(
        `/api/report-cards?studentId=${encodeURIComponent(lookup.studentId)}&session=${encodeURIComponent(lookup.session)}&term=${encodeURIComponent(lookup.term)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load report card.');
      const rc = data.reportCard;
      setForm({
        daysSchoolOpened: rc?.days_school_opened?.toString() ?? '',
        daysPresent: rc?.days_present?.toString() ?? '',
        timesPunctual: rc?.times_punctual?.toString() ?? '',
        conductRating: rc?.conduct_rating ?? '',
        teacherComment: rc?.teacher_comment ?? '',
        principalComment: rc?.principal_comment ?? '',
      });
      setStatus(rc?.status ?? 'Draft');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const persist = async (publish?: boolean) => {
    if (!lookup.studentId) return;

    setSaving(true);
    setError('');
    setNotice('');

    try {
      const res = await fetch('/api/report-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: lookup.studentId,
          session: lookup.session,
          term: lookup.term,
          ...form,
          ...(publish !== undefined ? { publish } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save report card.');
      setStatus(data.reportCard?.status ?? 'Draft');
      setNotice(
        publish === true
          ? 'Published — this term is now visible on the student portal.'
          : publish === false
          ? 'Reverted to Draft — no longer visible on the student portal.'
          : 'Saved as Draft.'
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    persist();
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">Report Cards</h1>
      <p className="text-gray-600 mb-8">
        Attendance, conduct, and comments for one student&apos;s term &mdash; shown on the printable report card and
        the student portal alongside subject results.
      </p>

      <div className="bg-white rounded-2xl shadow p-8">
        <form onSubmit={load} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <input
            type="text"
            placeholder="Student ID"
            value={lookup.studentId}
            onChange={(e) => setLookup({ ...lookup, studentId: e.target.value })}
            className="w-full border p-3 rounded-xl"
            required
          />
          <select
            value={lookup.session}
            onChange={(e) => setLookup({ ...lookup, session: e.target.value })}
            className="w-full border p-3 rounded-xl"
          >
            {SESSIONS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            value={lookup.term}
            onChange={(e) => setLookup({ ...lookup, term: e.target.value })}
            className="w-full border p-3 rounded-xl"
          >
            {TERMS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-gray-900 text-white px-6 py-3 font-semibold disabled:opacity-60"
          >
            {loading ? 'Loading...' : 'Load'}
          </button>
        </form>

        {error && <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {notice && <div className="mb-6 rounded-xl bg-green-50 p-4 text-sm text-green-800">{notice}</div>}
        {status && (
          <p className="text-sm mb-4">
            Status:{' '}
            <span className={status === 'Published' ? 'text-green-700 font-medium' : 'text-orange-600 font-medium'}>
              {status}
            </span>
            {status === 'Draft' && ' — not yet visible to the student.'}
          </p>
        )}

        <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Days School Opened</label>
            <input
              type="number"
              min="0"
              value={form.daysSchoolOpened}
              onChange={(e) => setForm({ ...form, daysSchoolOpened: e.target.value })}
              className="w-full border p-3 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Days Present</label>
            <input
              type="number"
              min="0"
              value={form.daysPresent}
              onChange={(e) => setForm({ ...form, daysPresent: e.target.value })}
              className="w-full border p-3 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Times Punctual</label>
            <input
              type="number"
              min="0"
              value={form.timesPunctual}
              onChange={(e) => setForm({ ...form, timesPunctual: e.target.value })}
              className="w-full border p-3 rounded-xl"
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium mb-2">Conduct</label>
            <select
              value={form.conductRating}
              onChange={(e) => setForm({ ...form, conductRating: e.target.value })}
              className="w-full border p-3 rounded-xl"
            >
              <option value="">— Not set —</option>
              {['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium mb-2">Class Teacher&apos;s Comment</label>
            <textarea
              value={form.teacherComment}
              onChange={(e) => setForm({ ...form, teacherComment: e.target.value })}
              className="w-full border p-3 rounded-xl"
              rows={3}
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium mb-2">Principal&apos;s Comment</label>
            <textarea
              value={form.principalComment}
              onChange={(e) => setForm({ ...form, principalComment: e.target.value })}
              className="w-full border p-3 rounded-xl"
              rows={3}
            />
          </div>
          <div className="md:col-span-3 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving || !lookup.studentId}
              className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 py-3 rounded-xl font-semibold disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              type="button"
              onClick={() => persist(true)}
              disabled={saving || !lookup.studentId}
              className="flex-1 bg-[var(--brand-color)] hover:brightness-90 text-white py-3 rounded-xl font-semibold disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Publish Report Card'}
            </button>
            {status === 'Published' && (
              <button
                type="button"
                onClick={() => persist(false)}
                disabled={saving}
                className="rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Revert to Draft
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

type ClassTimetableEntry = {
  id: string;
  day_of_week: string;
  period_number: number;
  start_time: string | null;
  end_time: string | null;
  subject: string;
  teacher_name: string | null;
};

type ExamTimetableEntry = {
  id: string;
  subject: string;
  exam_date: string;
  start_time: string | null;
  end_time: string | null;
  venue: string | null;
};

const PERIOD_COUNT = 8;

function TimetablesSection() {
  const [selectedClass, setSelectedClass] = useState(CLASSES[0]);

  // Class timetable grid
  const [grid, setGrid] = useState<Record<string, { subject: string; teacherName: string }>>({});
  const [periodTimes, setPeriodTimes] = useState<Record<number, { start: string; end: string }>>({});
  const [ttLoading, setTtLoading] = useState(false);
  const [ttSaving, setTtSaving] = useState(false);
  const [ttError, setTtError] = useState('');
  const [ttNotice, setTtNotice] = useState('');

  // Exam timetable
  const [examLookup, setExamLookup] = useState({ session: CURRENT_SESSION, term: TERMS[0] });
  const [examEntries, setExamEntries] = useState<ExamTimetableEntry[]>([]);
  const [examLoading, setExamLoading] = useState(false);
  const [examError, setExamError] = useState('');
  const [examForm, setExamForm] = useState({ subject: SUBJECTS[0], examDate: '', startTime: '', endTime: '', venue: '' });
  const [examSubmitting, setExamSubmitting] = useState(false);

  const cellKey = (day: string, period: number) => `${day}|${period}`;

  const loadClassTimetable = async (className: string) => {
    setTtLoading(true);
    setTtError('');
    setTtNotice('');
    try {
      const res = await fetch(`/api/class-timetables?class=${encodeURIComponent(className)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load timetable.');

      const newGrid: Record<string, { subject: string; teacherName: string }> = {};
      const newTimes: Record<number, { start: string; end: string }> = {};
      (data.entries as ClassTimetableEntry[]).forEach((e) => {
        newGrid[cellKey(e.day_of_week, e.period_number)] = { subject: e.subject, teacherName: e.teacher_name ?? '' };
        if (!newTimes[e.period_number] && (e.start_time || e.end_time)) {
          newTimes[e.period_number] = { start: e.start_time ?? '', end: e.end_time ?? '' };
        }
      });
      setGrid(newGrid);
      setPeriodTimes(newTimes);
    } catch (err) {
      setTtError((err as Error).message);
    } finally {
      setTtLoading(false);
    }
  };

  useEffect(() => {
    loadClassTimetable(selectedClass);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass]);

  const saveClassTimetable = async () => {
    setTtSaving(true);
    setTtError('');
    setTtNotice('');
    try {
      const entries = Object.entries(grid)
        .filter(([, v]) => v.subject?.trim())
        .map(([key, v]) => {
          const [dayOfWeek, periodStr] = key.split('|');
          const periodNumber = Number(periodStr);
          return {
            dayOfWeek,
            periodNumber,
            subject: v.subject,
            teacherName: v.teacherName || undefined,
            startTime: periodTimes[periodNumber]?.start || undefined,
            endTime: periodTimes[periodNumber]?.end || undefined,
          };
        });

      const res = await fetch('/api/class-timetables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ class: selectedClass, entries }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save timetable.');
      setTtNotice(`Saved ${data.saved} period(s) for ${selectedClass}.`);
    } catch (err) {
      setTtError((err as Error).message);
    } finally {
      setTtSaving(false);
    }
  };

  const loadExams = async () => {
    setExamLoading(true);
    setExamError('');
    try {
      const res = await fetch(
        `/api/exam-timetables?class=${encodeURIComponent(selectedClass)}&session=${encodeURIComponent(examLookup.session)}&term=${encodeURIComponent(examLookup.term)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load exam timetable.');
      setExamEntries(data.entries);
    } catch (err) {
      setExamError((err as Error).message);
    } finally {
      setExamLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass, examLookup.session, examLookup.term]);

  const addExamEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examForm.subject || !examForm.examDate) return;

    setExamSubmitting(true);
    setExamError('');
    try {
      const res = await fetch('/api/exam-timetables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class: selectedClass,
          session: examLookup.session,
          term: examLookup.term,
          subject: examForm.subject,
          examDate: examForm.examDate,
          startTime: examForm.startTime,
          endTime: examForm.endTime,
          venue: examForm.venue,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add exam entry.');
      setExamForm({ subject: SUBJECTS[0], examDate: '', startTime: '', endTime: '', venue: '' });
      loadExams();
    } catch (err) {
      setExamError((err as Error).message);
    } finally {
      setExamSubmitting(false);
    }
  };

  const deleteExamEntry = async (id: string) => {
    try {
      const res = await fetch(`/api/exam-timetables/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete entry.');
      setExamEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setExamError((err as Error).message);
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Timetables</h1>

      <div className="mb-8">
        <label className="block text-sm font-medium mb-2">Class</label>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="w-full md:w-64 rounded-xl border p-3"
        >
          {CLASSES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow p-8 mb-8">
        <h2 className="text-xl font-semibold mb-2">Weekly Class Timetable</h2>
        <p className="text-sm text-gray-500 mb-6">
          Fill in a subject for each period. Leave a cell blank to skip it. Times you set for a period apply across
          the week.
        </p>
        {ttError && <div className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{ttError}</div>}
        {ttNotice && <div className="mb-4 rounded-xl bg-green-50 p-4 text-sm text-green-800">{ttNotice}</div>}

        {ttLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-2">Period</th>
                  <th className="text-left p-2">Time</th>
                  {DAYS_OF_WEEK.map((d) => (
                    <th key={d} className="text-left p-2">
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: PERIOD_COUNT }, (_, i) => i + 1).map((period) => (
                  <tr key={period} className="border-b align-top">
                    <td className="p-2 font-medium">{period}</td>
                    <td className="p-2">
                      <div className="flex flex-col gap-1">
                        <input
                          type="time"
                          value={periodTimes[period]?.start ?? ''}
                          onChange={(e) =>
                            setPeriodTimes({
                              ...periodTimes,
                              [period]: { start: e.target.value, end: periodTimes[period]?.end ?? '' },
                            })
                          }
                          className="rounded border p-1 text-xs w-24"
                        />
                        <input
                          type="time"
                          value={periodTimes[period]?.end ?? ''}
                          onChange={(e) =>
                            setPeriodTimes({
                              ...periodTimes,
                              [period]: { start: periodTimes[period]?.start ?? '', end: e.target.value },
                            })
                          }
                          className="rounded border p-1 text-xs w-24"
                        />
                      </div>
                    </td>
                    {DAYS_OF_WEEK.map((day) => {
                      const key = cellKey(day, period);
                      const cell = grid[key] ?? { subject: '', teacherName: '' };
                      return (
                        <td key={day} className="p-2">
                          <input
                            type="text"
                            placeholder="Subject"
                            value={cell.subject}
                            onChange={(e) => setGrid({ ...grid, [key]: { ...cell, subject: e.target.value } })}
                            className="w-32 rounded border p-1 mb-1"
                          />
                          <input
                            type="text"
                            placeholder="Teacher"
                            value={cell.teacherName}
                            onChange={(e) => setGrid({ ...grid, [key]: { ...cell, teacherName: e.target.value } })}
                            className="w-32 rounded border p-1 text-xs text-gray-500"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button
          onClick={saveClassTimetable}
          disabled={ttSaving || ttLoading}
          className="mt-6 rounded-xl bg-[var(--brand-color)] px-6 py-3 font-semibold text-white hover:brightness-90 disabled:opacity-60"
        >
          {ttSaving ? 'Saving...' : `Save Timetable for ${selectedClass}`}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow p-8">
        <h2 className="text-xl font-semibold mb-2">Exam Timetable</h2>
        <p className="text-sm text-gray-500 mb-6">Add exam dates, times, and venues for {selectedClass}.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <select
            value={examLookup.session}
            onChange={(e) => setExamLookup({ ...examLookup, session: e.target.value })}
            className="w-full rounded-xl border p-3"
          >
            {SESSIONS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            value={examLookup.term}
            onChange={(e) => setExamLookup({ ...examLookup, term: e.target.value })}
            className="w-full rounded-xl border p-3"
          >
            {TERMS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>

        {examError && <div className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{examError}</div>}

        <form onSubmit={addExamEntry} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
          <select
            value={examForm.subject}
            onChange={(e) => setExamForm({ ...examForm, subject: e.target.value })}
            className="rounded-xl border p-3"
          >
            {SUBJECTS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <input
            type="date"
            value={examForm.examDate}
            onChange={(e) => setExamForm({ ...examForm, examDate: e.target.value })}
            className="rounded-xl border p-3"
            required
          />
          <input
            type="time"
            value={examForm.startTime}
            onChange={(e) => setExamForm({ ...examForm, startTime: e.target.value })}
            className="rounded-xl border p-3"
          />
          <input
            type="time"
            value={examForm.endTime}
            onChange={(e) => setExamForm({ ...examForm, endTime: e.target.value })}
            className="rounded-xl border p-3"
          />
          <input
            type="text"
            placeholder="Venue"
            value={examForm.venue}
            onChange={(e) => setExamForm({ ...examForm, venue: e.target.value })}
            className="rounded-xl border p-3"
          />
          <button
            type="submit"
            disabled={examSubmitting}
            className="md:col-span-5 rounded-xl bg-gray-900 text-white px-6 py-3 font-semibold disabled:opacity-60"
          >
            {examSubmitting ? 'Adding...' : 'Add Exam Entry'}
          </button>
        </form>

        {examLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : examEntries.length === 0 ? (
          <p className="text-gray-500">No exam entries yet for this class/term.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-3">Subject</th>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Time</th>
                <th className="text-left p-3">Venue</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {examEntries.map((e) => (
                <tr key={e.id} className="border-b">
                  <td className="p-3">{e.subject}</td>
                  <td className="p-3">{new Date(e.exam_date).toLocaleDateString()}</td>
                  <td className="p-3">
                    {e.start_time || '—'} {e.end_time ? `– ${e.end_time}` : ''}
                  </td>
                  <td className="p-3">{e.venue || '—'}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => deleteExamEntry(e.id)} className="text-sm text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

type FeeRow = {
  id: string;
  student_id: string;
  description: string;
  amount: number;
  due_date: string | null;
  status: 'Unpaid' | 'Paid';
  last_reminded_at: string | null;
  student: { full_name: string; parent_name: string | null; parent_phone: string | null } | null;
};

type FeeRosterStudent = { student_id: string; full_name: string };

function FeesSection() {
  const [lookup, setLookup] = useState({ className: CLASSES[0], session: CURRENT_SESSION, term: TERMS[0] });
  const [fees, setFees] = useState<FeeRow[]>([]);
  const [roster, setRoster] = useState<FeeRosterStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ studentId: '', description: 'School Fees', amount: '', dueDate: '' });

  const load = () => {
    setLoading(true);
    setError('');
    fetch(
      `/api/fees?class=${encodeURIComponent(lookup.className)}&session=${encodeURIComponent(lookup.session)}&term=${encodeURIComponent(lookup.term)}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setFees(data.fees);
        setRoster(data.roster ?? []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [lookup.className, lookup.session, lookup.term]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentId || !form.amount) return;

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: form.studentId,
          session: lookup.session,
          term: lookup.term,
          description: form.description,
          amount: form.amount,
          dueDate: form.dueDate,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add fee record.');
      setForm({ studentId: '', description: 'School Fees', amount: '', dueDate: '' });
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (fee: FeeRow) => {
    const nextStatus = fee.status === 'Paid' ? 'Unpaid' : 'Paid';
    try {
      const res = await fetch(`/api/fees/${fee.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status.');
      setFees((prev) => prev.map((f) => (f.id === fee.id ? { ...f, status: nextStatus } : f)));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const remind = async (fee: FeeRow) => {
    if (!fee.student?.parent_phone) {
      setError(`No parent phone number on file for ${fee.student?.full_name ?? fee.student_id}.`);
      return;
    }
    const amountStr = `₦${Number(fee.amount).toLocaleString()}`;
    const dueStr = fee.due_date ? ` due ${new Date(fee.due_date).toLocaleDateString()}` : '';
    const message = `Hello ${fee.student.parent_name || ''}, this is a reminder that ${fee.description} (${amountStr})${dueStr} for ${fee.student.full_name} is still outstanding. Kindly make payment at your earliest convenience. Thank you.`;
    window.open(buildWhatsAppLink(fee.student.parent_phone, message), '_blank');

    try {
      await fetch(`/api/fees/${fee.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminded: true }),
      });
      setFees((prev) => prev.map((f) => (f.id === fee.id ? { ...f, last_reminded_at: new Date().toISOString() } : f)));
    } catch {
      // Non-critical -- the WhatsApp link already opened either way.
    }
  };

  const deleteFee = async (id: string) => {
    try {
      const res = await fetch(`/api/fees/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete fee.');
      setFees((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">Fees</h1>
      <p className="text-gray-600 mb-8">
        Track fee records per student and remind parents by WhatsApp &mdash; no online payment collection here, just
        records and reminders.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <select
          value={lookup.className}
          onChange={(e) => setLookup({ ...lookup, className: e.target.value })}
          className="w-full rounded-xl border p-3"
        >
          {CLASSES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          value={lookup.session}
          onChange={(e) => setLookup({ ...lookup, session: e.target.value })}
          className="w-full rounded-xl border p-3"
        >
          {SESSIONS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select
          value={lookup.term}
          onChange={(e) => setLookup({ ...lookup, term: e.target.value })}
          className="w-full rounded-xl border p-3"
        >
          {TERMS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>

      {error && <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleAdd} className="bg-white rounded-2xl shadow p-8 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <h2 className="md:col-span-4 text-xl font-semibold">Add a Fee Record</h2>
        <select
          value={form.studentId}
          onChange={(e) => setForm({ ...form, studentId: e.target.value })}
          className="w-full rounded-xl border p-3"
          required
        >
          <option value="">— Select student —</option>
          {roster.map((s) => (
            <option key={s.student_id} value={s.student_id}>
              {s.full_name} ({s.student_id})
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full rounded-xl border p-3"
        />
        <input
          type="number"
          min="0"
          placeholder="Amount (₦)"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          className="w-full rounded-xl border p-3"
          required
        />
        <input
          type="date"
          value={form.dueDate}
          onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          className="w-full rounded-xl border p-3"
        />
        <button
          type="submit"
          disabled={submitting}
          className="md:col-span-4 rounded-xl bg-[var(--brand-color)] px-6 py-3 font-semibold text-white hover:brightness-90 disabled:opacity-60"
        >
          {submitting ? 'Adding...' : 'Add Fee Record'}
        </button>
      </form>

      <div className="bg-white rounded-2xl shadow p-8">
        <h2 className="text-xl font-semibold mb-6">Fee Records ({fees.length})</h2>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : fees.length === 0 ? (
          <p className="text-gray-500">No fee records yet for this class/term.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-3">Student</th>
                <th className="text-left p-3">Description</th>
                <th className="text-right p-3">Amount</th>
                <th className="text-left p-3">Due</th>
                <th className="text-center p-3">Status</th>
                <th className="text-center p-3">Remind</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {fees.map((f) => (
                <tr key={f.id} className="border-b">
                  <td className="p-3">{f.student?.full_name ?? f.student_id}</td>
                  <td className="p-3">{f.description}</td>
                  <td className="p-3 text-right">₦{Number(f.amount).toLocaleString()}</td>
                  <td className="p-3">{f.due_date ? new Date(f.due_date).toLocaleDateString() : '—'}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => toggleStatus(f)}
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        f.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {f.status}
                    </button>
                  </td>
                  <td className="p-3 text-center">
                    {f.status === 'Unpaid' && (
                      <button
                        onClick={() => remind(f)}
                        className="text-sm text-green-700 hover:underline whitespace-nowrap"
                      >
                        WhatsApp
                      </button>
                    )}
                    {f.last_reminded_at && (
                      <p className="text-xs text-gray-400">Last: {new Date(f.last_reminded_at).toLocaleDateString()}</p>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => deleteFee(f.id)} className="text-sm text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

type MessageRosterStudent = {
  id: string;
  student_id: string;
  full_name: string;
  parent_name: string | null;
  parent_phone: string | null;
};

function MessagesSection() {
  const [className, setClassName] = useState(CLASSES[0]);
  const [roster, setRoster] = useState<MessageRosterStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    fetch(`/api/students?class=${encodeURIComponent(className)}&status=Active`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setRoster(data.students);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [className]);

  const messageFor = (student: MessageRosterStudent) =>
    message
      .replaceAll('{{parent}}', student.parent_name || 'Parent/Guardian')
      .replaceAll('{{student}}', student.full_name);

  const send = (student: MessageRosterStudent) => {
    if (!student.parent_phone) {
      setError(`No parent phone number on file for ${student.full_name}.`);
      return;
    }
    window.open(buildWhatsAppLink(student.parent_phone, messageFor(student)), '_blank');
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">Message Parents</h1>
      <p className="text-gray-600 mb-8">
        Compose one message, then send it to each parent via a pre-filled WhatsApp link &mdash; you click each one,
        nothing is sent automatically. Use <code>{'{{parent}}'}</code> and <code>{'{{student}}'}</code> to personalize.
      </p>

      <div className="bg-white rounded-2xl shadow p-8 mb-8">
        <label className="block text-sm font-medium mb-2">Class</label>
        <select
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          className="w-full md:w-64 rounded-xl border p-3 mb-6"
        >
          {CLASSES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <label className="block text-sm font-medium mb-2">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Dear {{parent}}, this is a reminder about..."
          className="w-full rounded-xl border p-3"
          rows={4}
        />
      </div>

      {error && <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="bg-white rounded-2xl shadow p-8">
        <h2 className="text-xl font-semibold mb-6">{className} Roster ({roster.length})</h2>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : roster.length === 0 ? (
          <p className="text-gray-500">No active students found in {className}.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-3">Student</th>
                <th className="text-left p-3">Parent</th>
                <th className="text-left p-3">Phone</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {roster.map((s) => (
                <tr key={s.id} className="border-b">
                  <td className="p-3">{s.full_name}</td>
                  <td className="p-3">{s.parent_name || '—'}</td>
                  <td className="p-3">{s.parent_phone || '—'}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => send(s)}
                      disabled={!message.trim()}
                      className="text-sm text-green-700 hover:underline disabled:text-gray-300 disabled:no-underline"
                    >
                      Send via WhatsApp
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

type SpotlightRow = {
  id: string;
  name: string;
  subtitle: string | null;
  photo_url: string | null;
  blurb: string | null;
  period_label: string | null;
  created_at: string;
};

function SpotlightSection() {
  const [spotlights, setSpotlights] = useState<SpotlightRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', subtitle: '', blurb: '', periodLabel: '' });
  const [file, setFile] = useState<File | null>(null);

  const load = () => {
    setLoading(true);
    fetch('/api/spotlights')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setSpotlights(data.spotlights);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;

    setSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      if (form.subtitle) formData.append('subtitle', form.subtitle);
      if (form.blurb) formData.append('blurb', form.blurb);
      if (form.periodLabel) formData.append('periodLabel', form.periodLabel);
      if (file) formData.append('file', file);

      const res = await fetch('/api/spotlights', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add spotlight.');
      setForm({ name: '', subtitle: '', blurb: '', periodLabel: '' });
      setFile(null);
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/spotlights/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete.');
      setSpotlights((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">Spotlight</h1>
      <p className="text-gray-600 mb-8">
        Feature a &quot;Student/Staff of the Month&quot; on the homepage &mdash; a photo, a short note on why they
        were picked, and the period it covers.
      </p>
      {error && <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-8 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <h2 className="md:col-span-2 text-xl font-semibold">Add a Spotlight</h2>
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-xl border p-3"
          required
        />
        <input
          type="text"
          placeholder="Subtitle (e.g. SSS 2, or Mathematics Teacher)"
          value={form.subtitle}
          onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
          className="w-full rounded-xl border p-3"
        />
        <input
          type="text"
          placeholder="Period (e.g. September 2025)"
          value={form.periodLabel}
          onChange={(e) => setForm({ ...form, periodLabel: e.target.value })}
          className="w-full rounded-xl border p-3 md:col-span-2"
        />
        <textarea
          placeholder="Why were they picked?"
          value={form.blurb}
          onChange={(e) => setForm({ ...form, blurb: e.target.value })}
          className="w-full rounded-xl border p-3 md:col-span-2"
          rows={3}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full rounded-xl border p-3 md:col-span-2"
        />
        <button
          type="submit"
          disabled={submitting}
          className="md:col-span-2 rounded-xl bg-[var(--brand-color)] px-6 py-3 font-semibold text-white hover:brightness-90 disabled:opacity-60"
        >
          {submitting ? 'Adding...' : 'Add Spotlight'}
        </button>
      </form>

      <div className="bg-white rounded-2xl shadow p-8">
        <h2 className="text-xl font-semibold mb-6">Spotlights ({spotlights.length})</h2>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : spotlights.length === 0 ? (
          <p className="text-gray-500">No spotlights added yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {spotlights.map((s) => (
              <div key={s.id} className="overflow-hidden rounded-xl border">
                {s.photo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.photo_url} alt={s.name} className="h-40 w-full object-cover" />
                )}
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{s.name}</span>
                    <button onClick={() => handleDelete(s.id)} className="text-xs text-red-600 hover:underline shrink-0 ml-2">
                      Delete
                    </button>
                  </div>
                  {s.subtitle && <p className="text-sm text-gray-500">{s.subtitle}</p>}
                  {s.period_label && <p className="text-xs text-gray-400 mt-1">{s.period_label}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const EVENT_TYPES = ['Resumption', 'Midterm Break', 'Closing', 'Holiday', 'Other'] as const;

type CalendarRow = {
  id: string;
  session: string;
  term: string | null;
  title: string;
  event_type: (typeof EVENT_TYPES)[number];
  start_date: string;
  end_date: string | null;
};

function CalendarSection() {
  const [selectedSession, setSelectedSession] = useState(CURRENT_SESSION);
  const [entries, setEntries] = useState<CalendarRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    term: '',
    title: '',
    eventType: EVENT_TYPES[0] as (typeof EVENT_TYPES)[number],
    startDate: '',
    endDate: '',
  });

  const load = () => {
    setLoading(true);
    fetch(`/api/academic-calendar?session=${encodeURIComponent(selectedSession)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setEntries(data.entries);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [selectedSession]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.startDate) return;

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/academic-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session: selectedSession,
          term: form.term || null,
          title: form.title,
          eventType: form.eventType,
          startDate: form.startDate,
          endDate: form.endDate || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add calendar entry.');
      setForm({ term: '', title: '', eventType: EVENT_TYPES[0], startDate: '', endDate: '' });
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/academic-calendar/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete.');
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">Academic Calendar</h1>
      <p className="text-gray-600 mb-8">
        Publish resumption and closing dates, mid-term breaks, and holidays for parents and students to see &mdash;
        separate from the exam timetable.
      </p>
      {error && <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="mb-6">
        <select
          value={selectedSession}
          onChange={(e) => setSelectedSession(e.target.value)}
          className="rounded-xl border p-3"
        >
          {SESSIONS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-8 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <h2 className="md:col-span-2 text-xl font-semibold">Add an Entry for {selectedSession}</h2>
        <input
          type="text"
          placeholder="Title (e.g. First Term Resumption)"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full rounded-xl border p-3 md:col-span-2"
          required
        />
        <select
          value={form.eventType}
          onChange={(e) => setForm({ ...form, eventType: e.target.value as (typeof EVENT_TYPES)[number] })}
          className="w-full rounded-xl border p-3"
        >
          {EVENT_TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select
          value={form.term}
          onChange={(e) => setForm({ ...form, term: e.target.value })}
          className="w-full rounded-xl border p-3"
        >
          <option value="">Whole Session (no specific term)</option>
          {TERMS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <label className="flex flex-col gap-1 text-sm text-gray-600">
          Start Date
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            className="w-full rounded-xl border p-3"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-gray-600">
          End Date (optional, for a range like a break)
          <input
            type="date"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            className="w-full rounded-xl border p-3"
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="md:col-span-2 rounded-xl bg-[var(--brand-color)] px-6 py-3 font-semibold text-white hover:brightness-90 disabled:opacity-60"
        >
          {submitting ? 'Adding...' : 'Add Entry'}
        </button>
      </form>

      <div className="bg-white rounded-2xl shadow p-8">
        <h2 className="text-xl font-semibold mb-6">{selectedSession} Calendar ({entries.length})</h2>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : entries.length === 0 ? (
          <p className="text-gray-500">No calendar entries added yet for this session.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-3">Title</th>
                <th className="text-left p-3">Type</th>
                <th className="text-left p-3">Term</th>
                <th className="text-left p-3">Dates</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-b">
                  <td className="p-3 font-medium">{e.title}</td>
                  <td className="p-3">{e.event_type}</td>
                  <td className="p-3">{e.term || 'Whole Session'}</td>
                  <td className="p-3">
                    {new Date(e.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    {e.end_date &&
                      ` – ${new Date(e.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`}
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => handleDelete(e.id)} className="text-xs text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

type TestimonialRow = {
  id: string;
  author_name: string;
  author_role: string | null;
  quote: string;
  photo_url: string | null;
  created_at: string;
};

function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<TestimonialRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ authorName: '', authorRole: '', quote: '' });
  const [file, setFile] = useState<File | null>(null);

  const load = () => {
    setLoading(true);
    fetch('/api/testimonials')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setTestimonials(data.testimonials);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.authorName || !form.quote) return;

    setSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('authorName', form.authorName);
      if (form.authorRole) formData.append('authorRole', form.authorRole);
      formData.append('quote', form.quote);
      if (file) formData.append('file', file);

      const res = await fetch('/api/testimonials', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add testimonial.');
      setForm({ authorName: '', authorRole: '', quote: '' });
      setFile(null);
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/testimonials/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete.');
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">Testimonials</h1>
      <p className="text-gray-600 mb-8">
        Quotes from parents and alumni, shown on the homepage to build trust with prospective families.
      </p>
      {error && <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-8 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <h2 className="md:col-span-2 text-xl font-semibold">Add a Testimonial</h2>
        <input
          type="text"
          placeholder="Author Name"
          value={form.authorName}
          onChange={(e) => setForm({ ...form, authorName: e.target.value })}
          className="w-full rounded-xl border p-3"
          required
        />
        <input
          type="text"
          placeholder="Role (e.g. Parent of SSS 2 student, or Alumnus, Class of 2020)"
          value={form.authorRole}
          onChange={(e) => setForm({ ...form, authorRole: e.target.value })}
          className="w-full rounded-xl border p-3"
        />
        <textarea
          placeholder="Quote"
          value={form.quote}
          onChange={(e) => setForm({ ...form, quote: e.target.value })}
          className="w-full rounded-xl border p-3 md:col-span-2"
          rows={3}
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full rounded-xl border p-3 md:col-span-2"
        />
        <button
          type="submit"
          disabled={submitting}
          className="md:col-span-2 rounded-xl bg-[var(--brand-color)] px-6 py-3 font-semibold text-white hover:brightness-90 disabled:opacity-60"
        >
          {submitting ? 'Adding...' : 'Add Testimonial'}
        </button>
      </form>

      <div className="bg-white rounded-2xl shadow p-8">
        <h2 className="text-xl font-semibold mb-6">Testimonials ({testimonials.length})</h2>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : testimonials.length === 0 ? (
          <p className="text-gray-500">No testimonials added yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.id} className="rounded-xl border p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {t.photo_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.photo_url} alt={t.author_name} className="h-10 w-10 rounded-full object-cover" />
                    )}
                    <div>
                      <p className="font-semibold">{t.author_name}</p>
                      {t.author_role && <p className="text-xs text-gray-500">{t.author_role}</p>}
                    </div>
                  </div>
                  <button onClick={() => handleDelete(t.id)} className="text-xs text-red-600 hover:underline shrink-0">
                    Delete
                  </button>
                </div>
                <p className="mt-3 text-sm text-gray-600">&ldquo;{t.quote}&rdquo;</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const ATTENDANCE_STATUSES = ['Present', 'Absent', 'Late'] as const;

type RosterStudentRow = { id: string; student_id: string; full_name: string };
type AttendanceMark = { student_id: string; status: (typeof ATTENDANCE_STATUSES)[number] };

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function AttendanceSection() {
  const [selectedClass, setSelectedClass] = useState(CLASSES[0]);
  const [date, setDate] = useState(todayIso());
  const [session, setSession] = useState(CURRENT_SESSION);
  const [term, setTerm] = useState(TERMS[0]);

  const [roster, setRoster] = useState<RosterStudentRow[]>([]);
  const [marksByStudent, setMarksByStudent] = useState<Record<string, (typeof ATTENDANCE_STATUSES)[number]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    setError('');
    setNotice('');
    fetch(`/api/attendance?class=${encodeURIComponent(selectedClass)}&date=${encodeURIComponent(date)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setRoster(data.roster ?? []);
        const initial: Record<string, (typeof ATTENDANCE_STATUSES)[number]> = {};
        (data.roster ?? []).forEach((s: RosterStudentRow) => {
          initial[s.student_id] = 'Present';
        });
        (data.marks ?? []).forEach((m: AttendanceMark) => {
          initial[m.student_id] = m.status;
        });
        setMarksByStudent(initial);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [selectedClass, date]);

  const setMark = (studentId: string, status: (typeof ATTENDANCE_STATUSES)[number]) => {
    setMarksByStudent((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status: (typeof ATTENDANCE_STATUSES)[number]) => {
    setMarksByStudent(Object.fromEntries(roster.map((s) => [s.student_id, status])));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const records = roster.map((s) => ({ studentId: s.student_id, status: marksByStudent[s.student_id] || 'Present' }));
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ class: selectedClass, date, session, term, records }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save attendance.');
      setNotice(`Saved attendance for ${data.count} student(s).`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">Attendance</h1>
      <p className="text-gray-600 mb-8">Mark daily attendance for a class. Feeds the &quot;days present&quot; figure on report cards.</p>

      <div className="mb-6 flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-sm text-gray-600">
          Class
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="rounded-xl border p-3"
          >
            {CLASSES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-gray-600">
          Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl border p-3" />
        </label>
        <label className="flex flex-col gap-1 text-sm text-gray-600">
          Session
          <select value={session} onChange={(e) => setSession(e.target.value)} className="rounded-xl border p-3">
            {SESSIONS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-gray-600">
          Term
          <select value={term} onChange={(e) => setTerm(e.target.value)} className="rounded-xl border p-3">
            {TERMS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
      </div>

      {error && <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {notice && <div className="mb-6 rounded-xl bg-green-50 p-4 text-sm text-green-800">{notice}</div>}

      <div className="bg-white rounded-2xl shadow p-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">
            {selectedClass} &mdash; {new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
          </h2>
          <div className="flex gap-2 text-sm">
            <button onClick={() => markAll('Present')} className="rounded-lg border px-3 py-1.5 hover:bg-gray-50">
              Mark all Present
            </button>
            <button onClick={() => markAll('Absent')} className="rounded-lg border px-3 py-1.5 hover:bg-gray-50">
              Mark all Absent
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : roster.length === 0 ? (
          <p className="text-gray-500">No active students in {selectedClass}.</p>
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
                {roster.map((s) => (
                  <tr key={s.id} className="border-b">
                    <td className="p-3">{s.full_name}</td>
                    <td className="p-3">
                      <div className="flex justify-center gap-4">
                        {ATTENDANCE_STATUSES.map((status) => (
                          <label key={status} className="flex items-center gap-1 text-xs">
                            <input
                              type="radio"
                              name={`status-${s.student_id}`}
                              checked={marksByStudent[s.student_id] === status}
                              onChange={() => setMark(s.student_id, status)}
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
              onClick={handleSave}
              disabled={saving}
              className="mt-6 rounded-xl bg-[var(--brand-color)] px-6 py-3 font-semibold text-white hover:brightness-90 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
