"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type Plan = 'Free' | 'Pro' | 'Admin';

interface User {
  username: string;
  plan: Plan;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const FAKE_USERS: { [key: string]: { password?: string; plan: Plan } } = {
  'victor': { password: 'codigo', plan: 'Admin' },
  'pro-user': { password: 'pro', plan: 'Pro' },
  'free-user': { password: 'free', plan: 'Free' },
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for user in localStorage on initial load
    try {
      const storedUser = localStorage.getItem('notasmed-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('notasmed-user');
    } finally {
        setLoading(false);
    }
  }, []);

  const login = async (username: string, password?: string) => {
    const userData = FAKE_USERS[username.toLowerCase()];
    if (userData && (!userData.password || userData.password === password)) {
      const newUser: User = { username: username, plan: userData.plan };
      localStorage.setItem('notasmed-user', JSON.stringify(newUser));
      setUser(newUser);
    } else {
      throw new Error('Invalid username or password.');
    }
  };

  const logout = () => {
    localStorage.removeItem('notasmed-user');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
