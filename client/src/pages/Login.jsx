/**
 * =====================================================================
 * Contributor: KUNAL
 * Role: Lead Backend & Database Architect
 * Syllabus Sessions: Session 48 (Controlled Form Components & Event Handling)
 * Feature: User Sign-In Form & Authentication Flow
 * =====================================================================
 */
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2, Lock, Mail, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const redirectTo = location.state?.from || '/';

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    try {
      await login(form);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to track orders and check out.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field
          icon={Mail}
          type="email"
          label="Email"
          value={form.email}
          autoComplete="email"
          onChange={(v) => setForm({ ...form, email: v })}
        />
        <Field
          icon={Lock}
          type="password"
          label="Password"
          value={form.password}
          autoComplete="current-password"
          onChange={(v) => setForm({ ...form, password: v })}
        />

        {error && (
          <p className="flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2.5 text-xs text-rose-700">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            {error}
          </p>
        )}

        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy && <Loader2 size={16} className="animate-spin" />}
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <button
        type="button"
        onClick={() => setForm({ email: 'demo@smartcart.com', password: 'demo1234' })}
        className="mt-3 w-full rounded-lg border border-dashed border-line px-3 py-2.5 text-xs text-muted transition-colors hover:border-brand-400 hover:text-brand-700"
      >
        Use the seeded demo account (demo@smartcart.com)
      </button>

      <p className="mt-6 text-center text-sm text-muted">
        No account?{' '}
        <Link to="/register" state={location.state} className="font-semibold text-brand-600 hover:text-brand-700">
          Create one
        </Link>
      </p>
    </AuthShell>
  );
}

/** Shared chrome for the sign-in and sign-up screens. */
export function AuthShell({ title, subtitle, children }) {
  return (
    <div className="mx-auto grid min-h-[75vh] max-w-md place-items-center px-4 py-12">
      <div className="w-full">
        <div className="mb-6 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-linear-to-br from-brand-400 to-accent-500 shadow-lg shadow-brand-500/25">
            <Sparkles size={22} className="text-white" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold">{title}</h1>
          <p className="mt-1.5 text-sm text-muted">{subtitle}</p>
        </div>
        <div className="card p-6">{children}</div>
      </div>
    </div>
  );
}

export function Field({ icon: Icon, label, type = 'text', value, onChange, autoComplete, minLength }) {
  const id = `field-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">
        {label}
      </label>
      <div className="relative">
        <Icon size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          id={id}
          type={type}
          value={value}
          required
          minLength={minLength}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          className="input pl-10"
        />
      </div>
    </div>
  );
}
