import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, User as BackendUser } from '../services/auth.service';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapBackendUser(u: BackendUser): User {
  return {
    id: u.userId,
    name: u.fullName,
    email: u.email,
    phone: u.phone,
    role: u.role,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // On mount, if we have a refresh token, try to fetch current user
    const bootstrap = async () => {
      try {
        if (authService.isAuthenticated()) {
          const me = await authService.currentUser();
          setUser(mapBackendUser(me));
        }
      } catch {
        // ignore, user will be treated as logged out
      } finally {
        setIsReady(true);
      }
    };
    bootstrap();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authService.login({ identifier: email, password });
    if (res.data.user) {
      setUser(mapBackendUser(res.data.user));
    } else {
      // Fallback: fetch profile
      const me = await authService.currentUser();
      setUser(mapBackendUser(me));
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    await authService.register({
      fullName: name,
      email,
      phone: '',
      password,
    });
    // After successful registration, log the user in
    await login(email, password);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };

  if (!isReady) {
    return null; // You can render a spinner/splash here if desired
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
