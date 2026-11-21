/**
 * =====================================================================
 * User Registration Page (Feature 1 & Feature 7)
 * - Strict Email Validation during Signup
 * - Real Welcome Email Notification Trigger
 * - Optional Complete Delivery Address Collection during Signup
 * =====================================================================
 */
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2, Lock, Mail, User, MapPin, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { AuthShell, Field } from './Login';

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [includeAddress, setIncludeAddress] = useState(false);
  const [address, setAddress] = useState({
    houseNo: '',
    street: '',
    city: 'Rajpura',
    state: 'Punjab',
    pinCode: '140401',
    mobileNumber: '',
  });

  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);
  const [emailStatus, setEmailStatus] = useState(null);

  const redirectTo = location.state?.from || '/';

  // Live email validation as user types
  useEffect(() => {
    const raw = form.email.trim();
    if (!raw) {
      setEmailStatus(null);
      return;
    }

    if (!raw.includes('@') || raw.indexOf('@') === 0 || !raw.split('@')[1]?.includes('.')) {
      setEmailStatus(null);
      return;
    }

    setEmailStatus({ type: 'loading', message: 'Checking email...' });

    const timer = setTimeout(async () => {
      try {
        const res = await api.checkEmail(raw, 'register');
        if (!res.valid) {
          setEmailStatus({
            type: 'error',
            message: res.message,
          });
        } else {
          setEmailStatus({
            type: 'success',
            message: '✓ Email is valid & available',
          });
        }
      } catch (err) {
        setEmailStatus(null);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [form.email]);

  function validateEmail(email) {
    const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    return regex.test(email);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    // Validate email
    if (!validateEmail(form.email)) {
      setError('Please enter a valid, complete email address (e.g. name@example.com)');
      setBusy(false);
      return;
    }

    if (includeAddress) {
      if (!address.houseNo.trim() || !address.street.trim() || !address.city.trim() || !address.pinCode.trim()) {
        setError('Please fill in all address fields or uncheck the delivery address option');
        setBusy(false);
        return;
      }
      if (!/^\d{6}$/.test(address.pinCode.trim())) {
        setError('Please enter a valid 6-digit Indian PIN code');
        setBusy(false);
        return;
      }
    }

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        address: includeAddress ? { ...address, fullName: form.name.trim() } : undefined,
      };

      const res = await register(payload);
      setSuccessInfo(res.emailDelivery);

      setTimeout(() => {
        navigate(redirectTo, { replace: true });
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Create your SmartCart account" subtitle="Join India's AI-Powered Storefront in seconds.">
      {successInfo && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
          <span>Registration successful! A real welcome email has been delivered to <strong>{form.email}</strong>.</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <Field
          icon={User}
          label="Full Name"
          value={form.name}
          autoComplete="name"
          onChange={(v) => setForm({ ...form, name: v })}
        />
        <Field
          icon={Mail}
          type="email"
          label="Email Address"
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
          label="Password (min 6 characters)"
          value={form.password}
          minLength={6}
          autoComplete="new-password"
          onChange={(v) => setForm({ ...form, password: v })}
        />

        {/* Optional Delivery Address Collection during Signup (Feature 7) */}
        <div className="pt-2 border-t border-neutral-100">
          <label className="flex items-center gap-2 text-xs font-semibold text-neutral-800 cursor-pointer">
            <input
              type="checkbox"
              checked={includeAddress}
              onChange={(e) => setIncludeAddress(e.target.checked)}
              className="text-emerald-600 focus:ring-emerald-500 rounded"
            />
            <span className="flex items-center gap-1">
              <MapPin size={13} className="text-emerald-700" /> Add default delivery address now
            </span>
          </label>

          {includeAddress && (
            <div className="mt-3 space-y-2.5 p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs animate-pop-in">
              <input
                type="text"
                placeholder="House / Flat / Building No."
                value={address.houseNo}
                onChange={(e) => setAddress({ ...address, houseNo: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 bg-white"
              />
              <input
                type="text"
                placeholder="Street / Locality"
                value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 bg-white"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="City"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 bg-white"
                />
                <input
                  type="text"
                  placeholder="PIN Code (6 digits)"
                  value={address.pinCode}
                  onChange={(e) => setAddress({ ...address, pinCode: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 bg-white"
                />
              </div>
              <input
                type="tel"
                placeholder="10-digit Mobile Number"
                value={address.mobileNumber}
                onChange={(e) => setAddress({ ...address, mobileNumber: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 bg-white"
              />
            </div>
          )}
        </div>

        {error && (
          <p className="flex items-start gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-xs text-rose-700 border border-rose-100">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {busy && <Loader2 size={16} className="animate-spin" />}
          {busy ? 'Creating account…' : 'Register & Receive Welcome Email'}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-neutral-500">
        Already registered?{' '}
        <Link to="/login" state={location.state} className="font-semibold text-emerald-700 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
