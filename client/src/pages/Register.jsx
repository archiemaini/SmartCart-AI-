/**
 * =====================================================================
 * Contributor: KUNAL
 * Role: Lead Backend & Database Architect
 * Syllabus Sessions: Session 48 (Controlled Form Components & Event Handling)
 * Feature: User Registration Form & Validation Flow
 * =====================================================================
 */
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2, Lock, Mail, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthShell, Field } from './Login';

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const redirectTo = location.state?.from || '/';

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    try {
      await register(form);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Create your account" subtitle="It takes about ten seconds.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field
          icon={User}
          label="Name"
          value={form.name}
          autoComplete="name"
          onChange={(v) => setForm({ ...form, name: v })}
        />
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
          minLength={6}
          autoComplete="new-password"
          onChange={(v) => setForm({ ...form, password: v })}
        />
        <p className="-mt-1 text-[11px] text-muted">At least 6 characters.</p>

        {error && (
          <p className="flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2.5 text-xs text-rose-700">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            {error}
          </p>
        )}

        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy && <Loader2 size={16} className="animate-spin" />}
          {busy ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already registered?{' '}
        <Link to="/login" state={location.state} className="font-semibold text-brand-600 hover:text-brand-700">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
