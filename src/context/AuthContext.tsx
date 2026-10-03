import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AdminUser, SystemStatus } from '../types';
import { api, getStoredToken, clearStoredToken } from '../services/api';

interface NotificationState {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AuthContextType {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  systemStatus: SystemStatus | null;
  notification: NotificationState | null;
  login: (username: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAdmin: () => Promise<void>;
  refreshSystemStatus: () => Promise<void>;
  notify: (type: 'success' | 'error' | 'info', message: string) => void;
  clearNotification: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [notification, setNotification] = useState<NotificationState | null>(null);

  const notify = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now();
    setNotification({ id, type, message });
    setTimeout(() => {
      setNotification((curr) => (curr?.id === id ? null : curr));
    }, 4500);
  };

  const clearNotification = () => setNotification(null);

  const refreshSystemStatus = async () => {
    try {
      const status = await api.getSystemStatus();
      setSystemStatus(status);
    } catch (err) {
      console.warn('Could not fetch system status', err);
    }
  };

  const refreshAdmin = async () => {
    const token = getStoredToken();
    if (!token) {
      setAdmin(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.getCurrentAdmin();
      setAdmin(res.admin);
    } catch (err) {
      clearStoredToken();
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAdmin();
    refreshSystemStatus();

    const handleExpired = () => {
      setAdmin(null);
      notify('error', 'Session expired. Please sign in again.');
    };

    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, []);

  const login = async (username: string, pass: string) => {
    const res = await api.login(username, pass);
    setAdmin(res.admin);
    notify('success', `Welcome back, ${res.admin.full_name}`);
    await refreshSystemStatus();
  };

  const logout = async () => {
    await api.logout();
    setAdmin(null);
    notify('info', 'You have been signed out successfully.');
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        isAuthenticated: !!admin,
        isLoading,
        systemStatus,
        notification,
        login,
        logout,
        refreshAdmin,
        refreshSystemStatus,
        notify,
        clearNotification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
