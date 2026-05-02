import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { adminLogin, ApiError } from './api';

interface AdminContextType {
  isAdmin: boolean;
  /** Admin password kept in-memory for the current session — used to authorise admin API calls. */
  adminPassword: string | null;
  /** Verifies the password against the backend. Resolves true on success, throws on transport errors. */
  loginAsAdmin: (password: string) => Promise<{ ok: boolean; error?: string }>;
  logoutAdmin: () => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState<string | null>(null);

  const loginAsAdmin = useCallback(async (password: string): Promise<{ ok: boolean; error?: string }> => {
    const trimmed = password.trim();
    if (!trimmed) return { ok: false, error: 'Please enter the admin password.' };
    try {
      await adminLogin(trimmed);
      setAdminPassword(trimmed);
      setIsAdmin(true);
      return { ok: true };
    } catch (e: unknown) {
      if (e instanceof ApiError) {
        if (e.status === 401) return { ok: false, error: 'Incorrect password. Try again.' };
        if (e.status === 503) return { ok: false, error: 'Admin login is not configured on the server.' };
        return { ok: false, error: e.message || 'Login failed. Try again.' };
      }
      return { ok: false, error: 'Network error. Please check your connection.' };
    }
  }, []);

  const logoutAdmin = useCallback(() => {
    setIsAdmin(false);
    setAdminPassword(null);
  }, []);

  return (
    <AdminContext.Provider value={{ isAdmin, adminPassword, loginAsAdmin, logoutAdmin }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used inside AdminProvider');
  return ctx;
}
