
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Plan } from '@/types/ehr';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface User {
  username: string;
  plan: Plan;
  clinicName?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password?: string) => Promise<void>;
  signup: (username: string, password?: string, plan?: Plan, clinicName?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const FAKE_USERS_KEY = "notasmed-fake-users";

const initialUsers: { [key: string]: { password?: string; plan: Plan, clinicName?: string } } = {
  'victor': { password: 'codigo', plan: 'Hospital' },
  'clinica-user': { password: 'clinica', plan: 'Clinica', clinicName: 'Clínica Central' },
  'free-user': { password: 'free', plan: 'Free', clinicName: 'Consultorio Dr. Ejemplo' },
};


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [fakeUsers, setFakeUsers] = useLocalStorage(FAKE_USERS_KEY, initialUsers);
  const router = useRouter();

  useEffect(() => {
    // Check for user in localStorage on initial load
    try {
      const storedUser = localStorage.getItem('notasmed-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error al analizar el usuario desde localStorage", error);
      localStorage.removeItem('notasmed-user');
    } finally {
        setLoading(false);
    }
  }, []);

  const login = async (username: string, password?: string) => {
    const userData = fakeUsers[username.toLowerCase()];
    if (userData && (!userData.password || userData.password === password)) {
      const newUser: User = { username: username, plan: userData.plan, clinicName: userData.clinicName };
      localStorage.setItem('notasmed-user', JSON.stringify(newUser));
      setUser(newUser);
    } else {
      throw new Error('Usuario o contraseña inválidos.');
    }
  };

  const signup = async (username: string, password?: string, plan: Plan = 'Free', clinicName?: string) => {
      if (!username || !password) {
          throw new Error('El nombre de usuario y la contraseña son requeridos.');
      }
      if (fakeUsers[username.toLowerCase()]) {
          throw new Error('El nombre de usuario ya existe.');
      }
      
      const newUsers = {
          ...fakeUsers,
          [username.toLowerCase()]: { password, plan, clinicName }
      };
      setFakeUsers(newUsers);
  }

  const logout = () => {
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
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
