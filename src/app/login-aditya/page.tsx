'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import AppIcon from '@/components/ui/AppIcon';

const CURRENT_YEAR = new Date().getFullYear();

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        toast.success('Authenticated successfully');
        router.push('/admin');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Invalid credentials');
        toast.error(data.error || 'Authentication failed');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-headline font-black text-slate-100 uppercase tracking-widest">
            Executive Portal
          </h1>
          <p className="text-on-surface-variant font-body">Management Suite Authentication</p>
        </div>

        <form onSubmit={handleLogin} className="bg-surface-container-low p-5 sm:p-8 rounded-3xl shadow-2xl ring-1 ring-outline-variant/10 space-y-6">
          {error && (
            <div className="p-4 bg-error-container/20 border border-error/20 rounded-xl text-error text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant font-bold">Username</label>
            <div className="relative">
              <AppIcon name="user" className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="text"
                className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 rounded-xl p-4 pl-12 focus:ring-primary focus:ring-2 transition-all outline-none"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant font-bold">Password</label>
            <div className="relative">
              <AppIcon name="lock" className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="password"
                className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 rounded-xl p-4 pl-12 focus:ring-primary focus:ring-2 transition-all outline-none"
                placeholder="........"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            disabled={loading}
            className={`w-full indigo-gradient-bg text-on-primary py-4 rounded-xl font-headline font-bold text-lg tracking-tight hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? <span className="loading loading-spinner loading-sm"></span> : 'Authenticate'}
          </button>
        </form>

        <p className="text-center text-xs text-on-surface-variant font-body">
          &copy; {CURRENT_YEAR} Executive Portfolio Management
        </p>
      </div>
    </div>
  );
}
