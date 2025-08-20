
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Plan, User } from '@/types/ehr';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password?: string) => Promise<void>;
  signup: (username: string, password?: string, plan?: Plan, clinicName?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for user in localStorage on initial load to persist session
    // This part remains to keep the user logged in across page reloads
    try {
      const storedUser = localStorage.getItem('notasmed-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error parsing user from localStorage", error);
      localStorage.removeItem('notasmed-user');
    } finally {
        setLoading(false);
    }
  }, []);

  const login = async (username: string, password?: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const { user: loggedInUser } = await response.json();
      localStorage.setItem('notasmed-user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
    } else {
      const { message } = await response.json();
      throw new Error(message || 'Invalid username or password.');
    }
  };

  const signup = async (username: string, password?: string, plan: Plan = 'Free', clinicName?: string) => {
      if (!username || !password) {
          throw new Error('Username and password are required.');
      }
      if (!clinicName) {
        throw new Error('Clinic name is required.');
      }
      
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, plan, clinicName }),
      });
      
      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message || 'Failed to sign up.');
      }
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('notasmed-user');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
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
