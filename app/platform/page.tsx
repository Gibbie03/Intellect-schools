'use client';

import { Fragment, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type School = {
  id: string;
  name: string;
  subdomain: string;
  custom_domain: string | null;
  id_prefix: string;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  tagline: string | null;
  hero_image_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  whatsapp_number: string | null;
  principal_welcome_message: string | null;
  principal_photo_url: string | null;
  prospectus_url: string | null;
  status: 'Active' | 'Suspended';
  created_at: string;
};

type SchoolUserRow = {
  id: string;
  email: string;
  role: 'admin' | 'teacher';
  full_name: string;
  status: 'Active' | 'Inactive';
  totp_enabled: boolean;
};

const emptyForm = {
  name: '',
  subdomain: '',
  customDomain: '',
  idPrefix: '',
  primaryColor: '',
  tagline: '',
  heroImageUrl: '',
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

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    subdomain: '',
    customDomain: '',
    idPrefix: '',
    logoUrl: '',
    primaryColor: '',
    secondaryColor: '',
    tagline: '',
    heroImageUrl: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    whatsappNumber: '',
    principalWelcomeMessage: '',
    principalPhotoUrl: '',
    prospectusUrl: '',
    status: 'Active' as 'Active' | 'Suspended',
  });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState('');
  const [heroImageUploading, setHeroImageUploading] = useState(false);
  const [heroImageError, setHeroImageError] = useState('');

  const [managingId, setManagingId] = useState<string | null>(null);
  const [schoolUsers, setSchoolUsers] = useState<SchoolUserRow[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [resetTarget, setResetTarget] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [resetSubmitting, setResetSubmitting] = useState(false);

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

      setNotice(`Created "${data.school.name}" at ${data.school.custom_domain} — share the admin login you set with them.`);
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

  const startEdit = (school: School) => {
    setManagingId(null);
    setEditingId(school.id);
    setEditError('');
    setEditForm({
      name: school.name,
      subdomain: school.subdomain,
      customDomain: school.custom_domain ?? '',
      idPrefix: school.id_prefix,
      logoUrl: school.logo_url ?? '',
      primaryColor: school.primary_color ?? '',
      secondaryColor: school.secondary_color ?? '',
      tagline: school.tagline ?? '',
      heroImageUrl: school.hero_image_url ?? '',
      contactEmail: school.contact_email ?? '',
      contactPhone: school.contact_phone ?? '',
      address: school.address ?? '',
      whatsappNumber: school.whatsapp_number ?? '',
      principalWelcomeMessage: school.principal_welcome_message ?? '',
      principalPhotoUrl: school.principal_photo_url ?? '',
      prospectusUrl: school.prospectus_url ?? '',
      status: school.status,
    });
  };

  const handleLogoUpload = async (schoolId: string, file: File) => {
    setLogoUploading(true);
    setLogoError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`/api/platform/schools/${schoolId}/logo`, { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload logo.');
      setEditForm((prev) => ({ ...prev, logoUrl: data.logoUrl }));
      load();
    } catch (err) {
      setLogoError((err as Error).message);
    } finally {
      setLogoUploading(false);
    }
  };

  const handleHeroImageUpload = async (schoolId: string, file: File) => {
    setHeroImageUploading(true);
    setHeroImageError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`/api/platform/schools/${schoolId}/hero-image`, { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload hero image.');
      setEditForm((prev) => ({ ...prev, heroImageUrl: data.heroImageUrl }));
      load();
    } catch (err) {
      setHeroImageError((err as Error).message);
    } finally {
      setHeroImageUploading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    setEditSubmitting(true);
    setEditError('');
    try {
      const res = await fetch(`/api/platform/schools/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update school.');
      setEditingId(null);
      load();
    } catch (err) {
      setEditError((err as Error).message);
    } finally {
      setEditSubmitting(false);
    }
  };

  const startManage = (schoolId: string) => {
    setEditingId(null);
    setManagingId(schoolId);
    setResetTarget(null);
    setUsersError('');
    setUsersLoading(true);
    fetch(`/api/platform/schools/${schoolId}/users`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setSchoolUsers(data.users);
      })
      .catch((err) => setUsersError(err.message))
      .finally(() => setUsersLoading(false));
  };

  const handleOwnerReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingId || !resetTarget || resetPassword.length < 8) return;

    setResetSubmitting(true);
    setUsersError('');
    try {
      const res = await fetch(`/api/platform/schools/${managingId}/users/${resetTarget}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: resetPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password.');
      setResetTarget(null);
      setResetPassword('');
    } catch (err) {
      setUsersError((err as Error).message);
    } finally {
      setResetSubmitting(false);
    }
  };

  const handleOwnerDisableTwoFactor = async (userId: string) => {
    if (!managingId) return;
    if (!confirm('Turn off two-factor authentication for this account? Only do this if they are locked out.')) return;

    setUsersError('');
    try {
      const res = await fetch(`/api/platform/schools/${managingId}/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disableTotp: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to disable two-factor authentication.');
      setSchoolUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, totp_enabled: false } : u)));
    } catch (err) {
      setUsersError((err as Error).message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-4xl font-bold">SchoolOS &mdash; Platform Admin</h1>
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
          placeholder="Custom Domain (e.g. www.greenwood.com)"
          value={form.customDomain}
          onChange={(e) => setForm({ ...form, customDomain: e.target.value })}
          className="w-full rounded-xl border p-3"
          required
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
        <input
          type="text"
          placeholder="Homepage Tagline (optional, e.g. Building confident learners for a brighter future.)"
          value={form.tagline}
          onChange={(e) => setForm({ ...form, tagline: e.target.value })}
          className="w-full rounded-xl border p-3 md:col-span-2"
        />
        <input
          type="text"
          placeholder="Hero Image URL (optional, e.g. https://...)"
          value={form.heroImageUrl}
          onChange={(e) => setForm({ ...form, heroImageUrl: e.target.value })}
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
                <th className="text-center p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {schools.map((s) => (
                <Fragment key={s.id}>
                  <tr className="border-b">
                    <td className="p-4">{s.name}</td>
                    <td className="p-4 font-mono">{s.subdomain}</td>
                    <td className="p-4 text-sm text-gray-600">{s.custom_domain || '—'}</td>
                    <td className="p-4 font-mono">{s.id_prefix}</td>
                    <td className="p-4 text-center">{s.status}</td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-3 text-sm">
                        <button onClick={() => startEdit(s)} className="text-gray-700 hover:underline">
                          {editingId === s.id ? 'Cancel' : 'Edit'}
                        </button>
                        <button onClick={() => startManage(s.id)} className="text-gray-700 hover:underline">
                          {managingId === s.id ? 'Hide Accounts' : 'Manage Accounts'}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {editingId === s.id && (
                    <tr className="border-b bg-gray-50">
                      <td colSpan={6} className="p-6">
                        <form onSubmit={handleEditSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {editError && <p className="md:col-span-2 text-sm text-red-600">{editError}</p>}
                          <input
                            type="text"
                            placeholder="School Name"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full rounded-xl border p-3"
                            required
                          />
                          <input
                            type="text"
                            placeholder="Subdomain"
                            value={editForm.subdomain}
                            onChange={(e) => setEditForm({ ...editForm, subdomain: e.target.value.toLowerCase() })}
                            className="w-full rounded-xl border p-3"
                            required
                          />
                          <input
                            type="text"
                            placeholder="Custom Domain (optional)"
                            value={editForm.customDomain}
                            onChange={(e) => setEditForm({ ...editForm, customDomain: e.target.value })}
                            className="w-full rounded-xl border p-3"
                          />
                          <input
                            type="text"
                            placeholder="Student ID Prefix"
                            value={editForm.idPrefix}
                            onChange={(e) => setEditForm({ ...editForm, idPrefix: e.target.value.toUpperCase() })}
                            className="w-full rounded-xl border p-3"
                            required
                          />
                          <input
                            type="text"
                            placeholder="Primary Brand Color (hex, e.g. #0e6b39)"
                            value={editForm.primaryColor}
                            onChange={(e) => setEditForm({ ...editForm, primaryColor: e.target.value })}
                            className="w-full rounded-xl border p-3"
                          />
                          <input
                            type="text"
                            placeholder="Secondary Brand Color (hex, optional, e.g. #b23324)"
                            value={editForm.secondaryColor}
                            onChange={(e) => setEditForm({ ...editForm, secondaryColor: e.target.value })}
                            className="w-full rounded-xl border p-3"
                          />
                          <div className="w-full rounded-xl border p-3 md:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                              Logo (shown in the site header)
                            </label>
                            <div className="flex flex-wrap items-center gap-4">
                              {editForm.logoUrl && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={editForm.logoUrl}
                                  alt="Current logo"
                                  className="h-14 w-14 rounded-lg border object-contain bg-white"
                                />
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                disabled={logoUploading}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleLogoUpload(s.id, file);
                                  e.target.value = '';
                                }}
                                className="flex-1 text-sm"
                              />
                              {logoUploading && <span className="text-sm text-gray-500">Uploading...</span>}
                            </div>
                            {logoError && <p className="mt-2 text-sm text-red-600">{logoError}</p>}
                          </div>
                          <input
                            type="text"
                            placeholder="Homepage Tagline"
                            value={editForm.tagline}
                            onChange={(e) => setEditForm({ ...editForm, tagline: e.target.value })}
                            className="w-full rounded-xl border p-3 md:col-span-2"
                          />
                          <div className="w-full rounded-xl border p-3 md:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                              Hero Image (shown behind the homepage headline)
                            </label>
                            <div className="flex flex-wrap items-center gap-4">
                              {editForm.heroImageUrl && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={editForm.heroImageUrl}
                                  alt="Current hero image"
                                  className="h-14 w-24 rounded-lg border object-cover bg-white"
                                />
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                disabled={heroImageUploading}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleHeroImageUpload(s.id, file);
                                  e.target.value = '';
                                }}
                                className="flex-1 text-sm"
                              />
                              {heroImageUploading && <span className="text-sm text-gray-500">Uploading...</span>}
                            </div>
                            {heroImageError && <p className="mt-2 text-sm text-red-600">{heroImageError}</p>}
                          </div>
                          <input
                            type="email"
                            placeholder="Contact Email (optional)"
                            value={editForm.contactEmail}
                            onChange={(e) => setEditForm({ ...editForm, contactEmail: e.target.value })}
                            className="w-full rounded-xl border p-3"
                          />
                          <input
                            type="text"
                            placeholder="Contact Phone (optional)"
                            value={editForm.contactPhone}
                            onChange={(e) => setEditForm({ ...editForm, contactPhone: e.target.value })}
                            className="w-full rounded-xl border p-3"
                          />
                          <input
                            type="text"
                            placeholder="Address (optional, shown on Contact + map)"
                            value={editForm.address}
                            onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                            className="w-full rounded-xl border p-3 md:col-span-2"
                          />
                          <input
                            type="text"
                            placeholder="WhatsApp Number (e.g. 2348012345678, for the site-wide chat button)"
                            value={editForm.whatsappNumber}
                            onChange={(e) => setEditForm({ ...editForm, whatsappNumber: e.target.value })}
                            className="w-full rounded-xl border p-3"
                          />
                          <input
                            type="text"
                            placeholder="Principal's Photo URL (optional)"
                            value={editForm.principalPhotoUrl}
                            onChange={(e) => setEditForm({ ...editForm, principalPhotoUrl: e.target.value })}
                            className="w-full rounded-xl border p-3"
                          />
                          <textarea
                            placeholder="Principal's Welcome Message (shown on the homepage)"
                            value={editForm.principalWelcomeMessage}
                            onChange={(e) => setEditForm({ ...editForm, principalWelcomeMessage: e.target.value })}
                            className="w-full rounded-xl border p-3 md:col-span-2"
                            rows={4}
                          />
                          <input
                            type="text"
                            placeholder="Prospectus PDF URL (optional, shown as a download on Admissions)"
                            value={editForm.prospectusUrl}
                            onChange={(e) => setEditForm({ ...editForm, prospectusUrl: e.target.value })}
                            className="w-full rounded-xl border p-3 md:col-span-2"
                          />
                          <select
                            value={editForm.status}
                            onChange={(e) =>
                              setEditForm({ ...editForm, status: e.target.value as 'Active' | 'Suspended' })
                            }
                            className="w-full rounded-xl border p-3"
                          >
                            <option value="Active">Active</option>
                            <option value="Suspended">Suspended</option>
                          </select>
                          <button
                            type="submit"
                            disabled={editSubmitting}
                            className="md:col-span-2 w-full rounded-xl bg-gray-900 py-3 font-semibold text-white disabled:opacity-60"
                          >
                            {editSubmitting ? 'Saving...' : 'Save Changes'}
                          </button>
                        </form>
                      </td>
                    </tr>
                  )}

                  {managingId === s.id && (
                    <tr className="border-b bg-gray-50">
                      <td colSpan={6} className="p-6">
                        {usersError && <p className="text-sm text-red-600 mb-4">{usersError}</p>}
                        {usersLoading ? (
                          <p className="text-gray-500">Loading accounts...</p>
                        ) : schoolUsers.length === 0 ? (
                          <p className="text-gray-500">No accounts yet for this school.</p>
                        ) : (
                          <table className="w-full">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="text-left p-3">Name</th>
                                <th className="text-left p-3">Email</th>
                                <th className="text-center p-3">Role</th>
                                <th className="text-center p-3">Status</th>
                                <th className="text-center p-3">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {schoolUsers.map((u) => (
                                <tr key={u.id} className="border-b">
                                  <td className="p-3">{u.full_name}</td>
                                  <td className="p-3">{u.email}</td>
                                  <td className="p-3 text-center capitalize">{u.role}</td>
                                  <td className="p-3 text-center">{u.status}</td>
                                  <td className="p-3 text-center">
                                    <button
                                      onClick={() => {
                                        setResetTarget(resetTarget === u.id ? null : u.id);
                                        setResetPassword('');
                                      }}
                                      className="text-sm text-gray-700 hover:underline"
                                    >
                                      {resetTarget === u.id ? 'Cancel' : 'Reset Password'}
                                    </button>
                                    {resetTarget === u.id && (
                                      <form onSubmit={handleOwnerReset} className="mt-2 flex gap-2 justify-center">
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
                                    {u.totp_enabled && (
                                      <button
                                        onClick={() => handleOwnerDisableTwoFactor(u.id)}
                                        className="mt-2 block text-sm text-red-600 hover:underline"
                                      >
                                        Disable 2FA
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
