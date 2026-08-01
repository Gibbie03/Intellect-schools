'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type School = {
  id: string;
  name: string;
  subdomain: string;
  custom_domain: string | null;
  id_prefix: string;
  status: 'Active' | 'Suspended';
  created_at: string;
};

const emptyForm = {
  name: '',
  subdomain: '',
  customDomain: '',
  idPrefix: '',
  primaryColor: '',
  adminFullName: '',
  adminEmail: '',
  adminPassword: '',
};

const emptyAdminForm = { schoolId: '', fullName: '', email: '', password: '', role: 'admin' as 'admin' | 'teacher' };

export default function PlatformDashboard() {
  const router = useRouter();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState(emptyForm);

  const [adminForm, setAdminForm] = useState(emptyAdminForm);
  const [adminSubmitting, setAdminSubmitting] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [adminNotice, setAdminNotice] = useState('');

  const load = () => {
    setLoading(true);
    fetch('/api/platform/schools')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setSchools(data.schools);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleLogout = async () => {
    await fetch('/api/platform/logout', { method: 'POST' });
    router.push('/platform/login');
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setNotice('');

    try {
      const res = await fetch('/api/platform/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create school.');

      setNotice(`Created "${data.school.name}" at ${data.school.subdomain} — share the admin login you set with them.`);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminForm.schoolId) return;

    setAdminSubmitting(true);
    setAdminError('');
    setAdminNotice('');

    try {
      const res = await fetch(`/api/platform/schools/${adminForm.schoolId}/admins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: adminForm.fullName,
          email: adminForm.email,
          password: adminForm.password,
          role: adminForm.role,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create account.');

      setAdminNotice(`Created a ${adminForm.role} login for ${data.user.email}.`);
      setAdminForm(emptyAdminForm);
    } catch (err) {
      setAdminError((err as Error).message);
    } finally {
      setAdminSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-4xl font-bold">Platform Owner</h1>
        <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">
          Logout
        </button>
      </div>

      {notice && <div className="mb-6 rounded-xl bg-green-50 p-4 text-sm text-green-800">{notice}</div>}
      {error && <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-8 mb-10 grid grid-cols-1 md:grid-cols-2 gap-4">
        <h2 className="md:col-span-2 text-xl font-semibold">Onboard a New School</h2>

        <input
          type="text"
          placeholder="School Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-xl border p-3"
          required
        />
        <input
          type="text"
          placeholder="Subdomain (e.g. greenwood)"
          value={form.subdomain}
          onChange={(e) => setForm({ ...form, subdomain: e.target.value.toLowerCase() })}
          className="w-full rounded-xl border p-3"
          required
        />
        <input
          type="text"
          placeholder="Custom Domain (optional, e.g. www.greenwood.com)"
          value={form.customDomain}
          onChange={(e) => setForm({ ...form, customDomain: e.target.value })}
          className="w-full rounded-xl border p-3"
        />
        <input
          type="text"
          placeholder="Student ID Prefix (e.g. GRW)"
          value={form.idPrefix}
          onChange={(e) => setForm({ ...form, idPrefix: e.target.value.toUpperCase() })}
          className="w-full rounded-xl border p-3"
          required
        />
        <input
          type="text"
          placeholder="Brand Color (hex, optional, e.g. #15803d)"
          value={form.primaryColor}
          onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
          className="w-full rounded-xl border p-3 md:col-span-2"
        />

        <div className="md:col-span-2 border-t border-gray-100 pt-4 mt-2">
          <p className="text-sm font-medium text-gray-700 mb-4">First Admin Account</p>
        </div>

        <input
          type="text"
          placeholder="Admin Full Name"
          value={form.adminFullName}
          onChange={(e) => setForm({ ...form, adminFullName: e.target.value })}
          className="w-full rounded-xl border p-3"
          required
        />
        <input
          type="email"
          placeholder="Admin Email"
          value={form.adminEmail}
          onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
          className="w-full rounded-xl border p-3"
          required
        />
        <input
          type="password"
          placeholder="Admin Password (min. 8 characters)"
          value={form.adminPassword}
          onChange={(e) => setForm({ ...form, adminPassword: e.target.value })}
          className="w-full rounded-xl border p-3 md:col-span-2"
          minLength={8}
          required
        />

        <button
          type="submit"
          disabled={submitting}
          className="md:col-span-2 w-full rounded-xl bg-gray-900 py-3 font-semibold text-white disabled:opacity-60"
        >
          {submitting ? 'Creating...' : 'Create School'}
        </button>
      </form>

      <form onSubmit={handleAddAdmin} className="bg-white rounded-2xl shadow p-8 mb-10 grid grid-cols-1 md:grid-cols-2 gap-4">
        <h2 className="md:col-span-2 text-xl font-semibold">Add an Account to an Existing School</h2>
        <p className="md:col-span-2 text-sm text-gray-500">
          Use this to bootstrap a school&apos;s very first admin, or to add a login when a school&apos;s admin is
          locked out.
        </p>

        {adminNotice && (
          <div className="md:col-span-2 rounded-xl bg-green-50 p-4 text-sm text-green-800">{adminNotice}</div>
        )}
        {adminError && <p className="md:col-span-2 text-sm text-red-600">{adminError}</p>}

        <select
          value={adminForm.schoolId}
          onChange={(e) => setAdminForm({ ...adminForm, schoolId: e.target.value })}
          className="w-full rounded-xl border p-3 md:col-span-2"
          required
        >
          <option value="">Select a school...</option>
          {schools.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.subdomain})
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Full Name"
          value={adminForm.fullName}
          onChange={(e) => setAdminForm({ ...adminForm, fullName: e.target.value })}
          className="w-full rounded-xl border p-3"
          required
        />
        <select
          value={adminForm.role}
          onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value as 'admin' | 'teacher' })}
          className="w-full rounded-xl border p-3"
        >
          <option value="admin">Admin</option>
          <option value="teacher">Teacher</option>
        </select>
        <input
          type="email"
          placeholder="Email"
          value={adminForm.email}
          onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
          className="w-full rounded-xl border p-3"
          required
        />
        <input
          type="password"
          placeholder="Password (min. 8 characters)"
          value={adminForm.password}
          onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
          className="w-full rounded-xl border p-3"
          minLength={8}
          required
        />
        <button
          type="submit"
          disabled={adminSubmitting}
          className="md:col-span-2 w-full rounded-xl bg-gray-900 py-3 font-semibold text-white disabled:opacity-60"
        >
          {adminSubmitting ? 'Creating...' : 'Create Account'}
        </button>
      </form>

      <div className="bg-white rounded-2xl shadow p-8">
        <h2 className="text-xl font-semibold mb-6">All Schools ({schools.length})</h2>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : schools.length === 0 ? (
          <p className="text-gray-500">No schools yet.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Subdomain</th>
                <th className="text-left p-4">Custom Domain</th>
                <th className="text-left p-4">ID Prefix</th>
                <th className="text-center p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {schools.map((s) => (
                <tr key={s.id} className="border-b">
                  <td className="p-4">{s.name}</td>
                  <td className="p-4 font-mono">{s.subdomain}</td>
                  <td className="p-4 text-sm text-gray-600">{s.custom_domain || '—'}</td>
                  <td className="p-4 font-mono">{s.id_prefix}</td>
                  <td className="p-4 text-center">{s.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
