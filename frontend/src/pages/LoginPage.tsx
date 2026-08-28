import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api';
import { Blocks, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await authApi.login({ email, password });
      setAuth(res.user, res.token);
      toast.success(`Welcome back, ${res.user.name}!`);
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1117] flex items-center justify-center p-4">
      <div className="card max-w-md w-full p-8 space-y-6 shadow-xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center mx-auto shadow-md">
            <Blocks className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Sign in to DayBlocks</h1>
          <p className="text-xs text-slate-500">Your configurable time-based diary</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label mb-1 block">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="demo@dayblocks.app"
              className="input"
              required
            />
          </div>

          <div>
            <label className="label mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In</span>}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="p-3 bg-brand-50/50 dark:bg-brand-950/20 border border-brand-200/50 dark:border-brand-900/30 rounded-lg text-xs text-slate-600 dark:text-slate-400 space-y-1">
          <p className="font-semibold text-brand-700 dark:text-brand-300">Demo Account Credentials:</p>
          <p>Email: <code className="font-mono font-semibold">demo@dayblocks.app</code></p>
          <p>Password: <code className="font-mono font-semibold">demo1234</code></p>
        </div>

        <p className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
