import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api, getStoredUser, setSession, clearSession } from '../api/client';

interface AuthContextType {
  user: User | null;
  role: 'admin' | 'tenant' | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function verify() {
      try {
        if (localStorage.getItem('re_ops_token')) {
          const fresh = await api.getMe();
          setUser(fresh);
          localStorage.setItem('re_ops_user', JSON.stringify(fresh));
        }
      } catch {
        setUser(null);
        clearSession();
      } finally {
        setIsLoading(false);
      }
    }
    verify();
  }, []);

  const login = async (email: string, pass: string): Promise<User> => {
    const res = await api.login({ email, password: pass });
    setSession(res.access_token, res.user);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    clearSession();
    setUser(null);
    window.location.href = '/login';
  };

  const refreshUser = async () => {
    try {
      const fresh = await api.getMe();
      setUser(fresh);
      localStorage.setItem('re_ops_user', JSON.stringify(fresh));
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

