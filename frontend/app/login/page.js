'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Email and password are required'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workers/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      localStorage.setItem('workerToken', data.token);
      localStorage.setItem('workerProfile', JSON.stringify(data.worker));
      window.dispatchEvent(new Event('authChange'));

      // Go back to the card they were trying to open, or home
      router.push(redirectTo);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 mb-4 shadow-lg shadow-violet-500/25">
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Worker Sign In</h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to view full job details</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/65 backdrop-blur-md rounded-2xl border border-slate-200/60 p-8 shadow-sm space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="name@domain.com"
              className="w-full glass-input px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 border-slate-200/80 focus:ring-violet-400/50 shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••"
              className="w-full glass-input px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 border-slate-200/80 focus:ring-violet-400/50 shadow-sm" />
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl py-2.5 text-sm font-bold hover:opacity-95 hover:shadow-lg hover:shadow-violet-500/20 disabled:opacity-50 active:scale-[0.98] transition cursor-pointer">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <button type="button" onClick={() => router.push('/')}
            className="w-full text-slate-500 text-sm font-medium hover:text-slate-700 transition cursor-pointer">
            ← Back to listings
          </button>
        </form>
      </div>
    </div>
  );
}