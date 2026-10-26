/**
 * =====================================================================
 * Contributor: KUNAL
 * Role: Lead Backend & Database Architect
 * Syllabus Sessions: Sessions 29-30 (JWT Token Persistence) & Sessions 46-47 (React Context & State)
 * Feature: Authentication State Management & Session Hydration
 * =====================================================================
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, tokenStore } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // `true` until the stored token has been checked, so protected routes don't
  // bounce a logged-in user to /login during the first paint.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      if (!tokenStore.get()) {
        setLoading(false);
        return;
      }

      try {
        const { user: me } = await api.me();
        if (!cancelled) setUser(me);
      } catch {
        // Expired or tampered token — drop it silently.
        tokenStore.clear();
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const { user: me, token } = await api.login(credentials);
    tokenStore.set(token);
    setUser(me);
    return me;
  }, []);

  const register = useCallback(async (payload) => {
    const { user: me, token } = await api.register(payload);
    tokenStore.set(token);
    setUser(me);
    return me;
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, isAuthenticated: Boolean(user), login, register, logout }),
    [user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside an <AuthProvider>');
  return ctx;
}
