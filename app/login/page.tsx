'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  // A plain client-side router.push() here can serve a stale cached render
  // of /admin or /teacher-dashboard from Next's client router cache (e.g.
  // one previously redirected to /login before the session cookie existed)
  // -- router.refresh() is meant to bust that, but calling it right after
  // push doesn't reliably win the race, which is why this used to need a
  // second click or a manual reload. A hard navigation always issues a
  // fresh top-level request, so middleware sees the new cookie immediately.
  const finishLogin = (role: string) => {
    const isAdminType = role === 'admin' || role === 'primary_admin' || role === 'secondary_admin';
    window.location.href = isAdminType ? '/admin' : '/teacher-dashboard';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed.');

      if (data.requires2fa) {
        setPendingToken(data.pendingToken);
        return;
      }

      finishLogin(data.role);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingToken || !code) return;

    setVerifying(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pendingToken, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed.');

      finishLogin(data.role);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setVerifying(false);
    }
  };

  if (pendingToken) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 border rounded-3xl">
        <h1 className="text-3xl font-bold text-center mb-2">Two-Factor Verification</h1>
        <p className="text-center text-gray-600 mb-8">Enter the 6-digit code from your authenticator app.</p>

        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            inputMode="numeric"
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full border p-3 rounded-xl text-center text-2xl tracking-widest"
            maxLength={6}
            autoFocus
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={verifying}
            className="w-full bg-[var(--brand-color)] text-white py-3 rounded-xl font-semibold disabled:opacity-60"
          >
            {verifying ? 'Verifying...' : 'Verify'}
          </button>
          <button
            type="button"
            onClick={() => {
              setPendingToken(null);
              setCode('');
              setError('');
            }}
            className="w-full text-sm text-gray-500 hover:underline"
          >
            Back to login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-8 border rounded-3xl">
      <h1 className="text-3xl font-bold text-center mb-2">Staff Login</h1>
      <p className="text-center text-gray-600 mb-8">Sign in to your admin or teacher account</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-3 rounded-xl"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-3 rounded-xl"
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[var(--brand-color)] text-white py-3 rounded-xl font-semibold disabled:opacity-60"
        >
          {submitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
