/**
 * =====================================================================
 * Auth Context with RBAC, Address Management, and Cart Syncing
 * =====================================================================
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, tokenStore } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!tokenStore.get()) {
      setUser(null);
      return null;
    }
    try {
      const { user: me } = await api.me();
      setUser(me);
      return me;
    } catch {
      tokenStore.clear();
      setUser(null);
      return null;
    }
  }, []);

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
    const res = await api.register(payload);
    tokenStore.set(res.token);
    setUser(res.user);
    return res;
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  // Delivery Address Helpers (Feature 7)
  const addAddress = useCallback(async (addrData) => {
    const res = await api.addAddress(addrData);
    setUser((prev) => (prev ? { ...prev, addresses: res.addresses } : prev));
    return res.addresses;
  }, []);

  const updateAddress = useCallback(async (id, addrData) => {
    const res = await api.updateAddress(id, addrData);
    setUser((prev) => (prev ? { ...prev, addresses: res.addresses } : prev));
    return res.addresses;
  }, []);

  const deleteAddress = useCallback(async (id) => {
    const res = await api.deleteAddress(id);
    setUser((prev) => (prev ? { ...prev, addresses: res.addresses } : prev));
    return res.addresses;
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
      refreshUser,
      addAddress,
      updateAddress,
      deleteAddress,
    }),
    [user, loading, login, register, logout, refreshUser, addAddress, updateAddress, deleteAddress]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside an <AuthProvider>');
  return ctx;
}
