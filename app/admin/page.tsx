'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { STAFF_ROLES } from '@/lib/constants';

type Tab = 'dashboard' | 'results' | 'admissions' | 'students' | 'staff' | 'news' | 'gallery' | 'contact';

const TABS: { id: Tab; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'results', label: 'Manage Results' },
  { id: 'admissions', label: 'Admissions' },
  { id: 'students', label: 'Students' },
  { id: 'staff', label: 'Staff & Roles' },
  { id: 'news', label: 'News & Events' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'contact', label: 'Contact Messages' },
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
              tab === t.id ? 'bg-green-700 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
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
  className: '',
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
          <input
            type="text"
            placeholder="Class (e.g. Primary 4)"
            value={form.className}
            onChange={(e) => setForm({ ...form, className: e.target.value })}
            className="w-full rounded-xl border p-3"
            required
          />
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
            className="w-full rounded-xl bg-green-700 py-3 font-semibold text-white hover:bg-green-800 disabled:opacity-60"
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
          <a href="/api/students/template" className="inline-block text-sm font-medium text-green-700 hover:underline">
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
            className="w-full rounded-xl bg-green-700 py-3 font-semibold text-white hover:bg-green-800 disabled:opacity-60"
          >
            {batchSubmitting ? 'Uploading...' : 'Upload & Create'}
          </button>
        </form>
      </div>

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
                  <td className="p-4">{s.class}</td>
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
};

const emptyStaffForm = { staffId: '', fullName: '', role: STAFF_ROLES[0], subject: '', email: '', phone: '' };

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
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [accountsError, setAccountsError] = useState('');
  const [accountSubmitting, setAccountSubmitting] = useState(false);
  const [accountForm, setAccountForm] = useState(emptyAccountForm);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.staffId || !form.fullName) return;

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create staff profile.');
      setForm(emptyStaffForm);
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
        <button
          type="submit"
          disabled={submitting}
          className="md:col-span-2 w-full rounded-xl bg-green-700 py-3 font-semibold text-white hover:bg-green-800 disabled:opacity-60"
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
                <th className="text-center p-4">Employment Status</th>
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
                      value={t.status}
                      onChange={(e) => updateStatus(t.id, e.target.value as 'Active' | 'Inactive')}
                      className="rounded-lg border p-2 text-sm"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive (Terminated)</option>
                    </select>
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
            className="md:col-span-2 w-full rounded-xl bg-green-700 py-3 font-semibold text-white hover:bg-green-800 disabled:opacity-60"
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
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => (
                <tr key={a.id} className="border-b">
                  <td className="p-4">{a.full_name}</td>
                  <td className="p-4">{a.email}</td>
                  <td className="p-4 text-center capitalize">{a.role}</td>
                  <td className="p-4 text-center">{a.status}</td>
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
          className="rounded-xl bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800 disabled:opacity-60"
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
  const [file, setFile] = useState<File | null>(null);
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
    if (!file) return;

    setSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (caption) formData.append('caption', caption);

      const res = await fetch('/api/gallery', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add image.');
      setFile(null);
      setCaption('');
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
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
        <h2 className="text-xl font-semibold">Add a Photo</h2>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full rounded-xl border p-3"
          required
        />
        <input
          type="text"
          placeholder="Caption (optional)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="w-full rounded-xl border p-3"
        />
        <button
          type="submit"
          disabled={submitting || !file}
          className="rounded-xl bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800 disabled:opacity-60"
        >
          {submitting ? 'Uploading...' : 'Add Photo'}
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
                      className="text-sm text-green-700 hover:underline shrink-0"
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
