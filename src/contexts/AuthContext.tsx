import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, User as BackendUser } from '../services/auth.service';
import { getErrorMessage } from '../services/error';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, fromTokens?: boolean) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapBackendUser(u: BackendUser): User {
  console.log('mapBackendUser - Backend user:', u);
  const mapped = {
    id: u.userId,
    name: u.fullName,
    email: u.email,
    phone: u.phone,
    role: u.role,
  };
  console.log('mapBackendUser - Mapped user:', mapped);
  return mapped;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    // On mount, if we have a refresh token, try to fetch current user
    const bootstrap = async () => {
      try {
        const authenticated = authService.isAuthenticated();
        setHasSession(authenticated);
        console.log('[AuthContext] Bootstrap - isAuthenticated:', authenticated);
        if (authenticated) {
          console.log('[AuthContext] Fetching current user...');
          const me = await authService.currentUser();
          console.log('[AuthContext] Current user response:', me);
          const mapped = mapBackendUser(me);
          console.log('[AuthContext] Setting user:', mapped);
          setUser(mapped);
        } else {
          console.log('[AuthContext] Not authenticated, user will be null');
        }
      } catch (error) {
        console.error('[AuthContext] Bootstrap error:', error);
        // ignore, user will be treated as logged out
      } finally {
        setIsReady(true);
        console.log('[AuthContext] Bootstrap complete, isReady: true');
      }
    };
    void bootstrap();
  }, []);

  const login = async (email: string, password: string, fromTokens = false) => {
    try {
      if (fromTokens) {
        const me = await authService.currentUser();
        const mapped = mapBackendUser(me);
        console.log('[AuthContext] Login from tokens - user:', mapped);
        setUser(mapped);
        setHasSession(true);
        return;
      }

      const res = await authService.login({ identifier: email, password });
      console.log('[AuthContext] Login response:', res.data);

      const me = await authService.currentUser();
      const mapped = mapBackendUser(me);
      console.log('[AuthContext] Login - fetched user:', mapped);
      setUser(mapped);
      setHasSession(true);
    } catch (error) {
      console.error('[AuthContext] Login error:', error);
      throw new Error(getErrorMessage(error, 'Unable to login'));
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      await authService.register({
        fullName: name,
        email,
        password,
      });
      await login(email, password);
    } catch (error) {
      console.error('[AuthContext] Signup error:', error);
      throw new Error(getErrorMessage(error, 'Unable to create account'));
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setHasSession(false);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    logout,
    isAuthenticated: !!user || hasSession,
    isReady,
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
