'use client';

import { useState } from 'react';

export default function PlatformLoginPage() {
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/platform/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed.');

      // Hard navigation, not router.push/refresh -- a client-side push can
      // serve a stale cached render from before the session cookie existed
      // (that's why this used to need a second click or a manual reload).
      window.location.href = '/platform';
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 border rounded-3xl">
      <h1 className="text-3xl font-bold text-center mb-2">SchoolOS</h1>
      <p className="text-center text-gray-600 mb-8">Platform owner login &mdash; manage the schools on this platform</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          placeholder="Owner Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-3 rounded-xl"
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold disabled:opacity-60"
        >
          {submitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
