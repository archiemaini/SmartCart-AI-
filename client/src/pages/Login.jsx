/**
 * =====================================================================
 * Feature: User Sign-In Form & Live Email Existence Verification
 * =====================================================================
 */
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2, Lock, Mail, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [emailStatus, setEmailStatus] = useState(null); // { type: 'error' | 'success' | 'loading', message: string }
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const redirectTo = location.state?.from || '/';

  // Live email existence check as user types
  useEffect(() => {
    const raw = form.email.trim();
    if (!raw) {
      setEmailStatus(null);
      return;
    }

    // Only query when email has an '@' and at least one dot in domain
    if (!raw.includes('@') || raw.indexOf('@') === 0 || !raw.split('@')[1]?.includes('.')) {
      setEmailStatus(null);
      return;
    }

    setEmailStatus({ type: 'loading', message: 'Checking email...' });

    const timer = setTimeout(async () => {
      try {
        const res = await api.checkEmail(raw, 'login');
        if (!res.valid) {
          setEmailStatus({
            type: 'error',
            message: res.message || 'This email does not exist',
          });
        } else {
          setEmailStatus({
            type: 'success',
            message: `Account found for ${res.userName || 'user'}`,
          });
        }
      } catch (err) {
        setEmailStatus(null);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [form.email]);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    // If live check already confirmed the email does not exist, alert user immediately
    if (emailStatus?.type === 'error') {
      setError(emailStatus.message);
      setBusy(false);
      return;
    }

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
          status={emailStatus}
          onChange={(v) => {
            setForm({ ...form, email: v });
            if (error) setError(null);
          }}
        />
        <Field
          icon={Lock}
          type="password"
          label="Password"
          value={form.password}
          autoComplete="current-password"
          onChange={(v) => {
            setForm({ ...form, password: v });
            if (error) setError(null);
          }}
        />

        {error && (
          <p className="flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2.5 text-xs text-rose-700 border border-rose-200">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </p>
        )}

        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy && <Loader2 size={16} className="animate-spin" />}
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <button
        type="button"
        onClick={() => setForm({ email: 'shopper@smartcart.com', password: 'shopper1234' })}
        className="mt-3 w-full rounded-lg border border-dashed border-line px-3 py-2.5 text-xs text-muted transition-colors hover:border-brand-400 hover:text-brand-700"
      >
        Use the demo customer account (shopper@smartcart.com)
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

export function Field({
  icon: Icon,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  autoComplete,
  minLength,
  status, // { type: 'error' | 'success' | 'loading', message: string }
}) {
  const id = `field-${label.toLowerCase().replace(/\s+/g, '-')}`;

  const borderClass = status?.type === 'error'
    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
    : status?.type === 'success'
    ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-200'
    : '';

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={id} className="block text-xs font-bold uppercase tracking-wider text-muted">
          {label}
        </label>
        {status?.type === 'loading' && (
          <span className="flex items-center gap-1 text-[11px] text-muted">
            <Loader2 size={11} className="animate-spin text-brand-600" />
            <span>Checking...</span>
          </span>
        )}
      </div>
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
          onBlur={onBlur}
          className={`input pl-10 ${borderClass}`}
        />
        {status?.type === 'error' && (
          <AlertCircle size={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-rose-500" />
        )}
        {status?.type === 'success' && (
          <CheckCircle2 size={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-600" />
        )}
      </div>
      {status && status.message && status.type !== 'loading' && (
        <p
          className={`mt-1.5 flex items-center gap-1.5 text-xs font-semibold ${
            status.type === 'error' ? 'text-rose-600' : 'text-emerald-700'
          }`}
        >
          {status.type === 'error' && <AlertCircle size={13} className="shrink-0" />}
          {status.type === 'success' && <CheckCircle2 size={13} className="shrink-0" />}
          <span>{status.message}</span>
        </p>
      )}
    </div>
  );
}
